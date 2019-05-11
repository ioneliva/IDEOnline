using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using LoginMicroservice.Models;
using System.Data.SqlClient;
using Microsoft.AspNetCore.Authorization;

namespace LoginMicroservice.Controllers
{
    [Route("[controller]")]
    [Authorize]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly LoginContext _context;

        public UsersController(LoginContext context)
        {
            _context = context;
        }

        // PUT: /Users
        //for local testing: PUT request to http://localhost:5200/users in body payload JSon ex: { "name":"aaa", "pswd":"123"[, "avatar":base64Image]}
        [AllowAnonymous]
        [HttpPut]
        public async Task<IActionResult> PutUser([FromBody]RequestModel request)
        {
            //despite the fact that name is varchar(20), Sqlite converts it to text type if it's larger and still allows it
            //that would allow very long user names that would cause malformed html displayed on client page
            if (request.Name.Length > 20)
            {
                return StatusCode(413); //Request Entity Too Large
            }
            //check if user already exists in the database
            Users existingUser = _context.Users.Where(u => u.Name == request.Name).SingleOrDefault();
            CryptoUtility util = new CryptoUtility();
            if (existingUser == null)
            {
                byte[] generatedSalt = util.GenerateSalt(32);
                Users newUser = new Users
                {
                    Name = request.Name,
                    Salt = generatedSalt,
                    Password = util.GenerateHash(request.Password, generatedSalt),
                    Avatar = request.Avatar
                };
                //insert new user
                _context.Users.Add(newUser);
                try
                {
                    await _context.SaveChangesAsync();
                }
                catch (Exception ex)
                {
                    if (ex.GetBaseException().GetType() == typeof(SqlException))
                    {
                        Int32 ErrorCode = ((SqlException)ex.InnerException).Number;
                        switch (ErrorCode)
                        {
                            case 2627:  // Unique constraint error
                                return StatusCode(2627);
                            case 547:   // Constraint check violation
                                return StatusCode(547);
                            case 2601:  // Duplicated key row error
                                return StatusCode(2601);
                            default:
                                return StatusCode(ErrorCode);
                        }
                    }
                }
                //201(created) should be returned ONLY after the server has created the new object. Because this is async, we cannot guarantee that
                return Ok(); //200
            }
            else
            {
                return Conflict(); //409
            }
        }

        // put: /Users/Edit/name
        //in body payload ex:{"oldname" :"name","newname":"name"} 
        [HttpPut("/edit/name")]
        public async Task<IActionResult> EditUsername([FromBody]NameChangeRequestModel request)
        {
            //find user in the database
            Users existingUser = _context.Users.Where(u => u.Name == request.Name).SingleOrDefault();
            //we don't need to ask for a password because the client is authorized for this operation with jwt bearer token
            if (existingUser != null)
            {
                existingUser.Name = request.NewName;
                _context.Update(existingUser);
                await _context.SaveChangesAsync();
                return Ok(); //200
            }
            else
            {
                return NotFound(); //404
            }
        }

        // put: /Users/Edit/password
        //in body payload ex:{"name" :"name","newPassword":"123"} 
        [HttpPut("/edit/name")]
        public async Task<IActionResult> EditPassword([FromBody]PasswordChangeRequestModel request)
        {
            //find user in the database
            Users existingUser = _context.Users.Where(u => u.Name == request.Name).SingleOrDefault();
            //we could get the user name from the jwt token, but we'll just send it from the client
            if (existingUser != null)
            {
                CryptoUtility util = new CryptoUtility();
                existingUser.Password = util.GenerateHash(request.NewPassword, existingUser.Salt);
                _context.Update(existingUser);
                await _context.SaveChangesAsync();
                return Ok(); //200
            }
            else
            {
                return NotFound(); //404
            }
        }

        // put: /Users/Edit/avatar
        //in body payload ex:{"name" :"name","avatar": base64String} 
        [HttpPut("/edit/name")]
        public async Task<IActionResult> EditAvatar([FromBody]AvatarChangeRequestModel request)
        {
            //find user in the database
            Users existingUser = _context.Users.Where(u => u.Name == request.Name).SingleOrDefault();
            //no need for password, jwt token must be presented
            if (existingUser != null)
            {
                existingUser.Avatar = request.Avatar;
                _context.Update(existingUser);
                await _context.SaveChangesAsync();
                return Ok(); //200
            }
            else
            {
                return NotFound(); //404
            }
        }

        // DELETE: /Users
        //for local testing: DELETE request to http://localhost:5200/Users, in body payload JSon ex: { "name":"aaa", "pswd":"123"}
        [HttpDelete]
        public async Task<IActionResult> DeleteUser([FromBody]RequestModel request)
        {
            //check if user exists in database, no need for password because we have jwt auth
            Users existingUser = _context.Users.Where(u => u.Name == request.Name).SingleOrDefault();
            if (existingUser != null)
            {
                _context.Users.Remove(existingUser);
                await _context.SaveChangesAsync();
                return Ok(); //200
            }
            else
            {
                return NotFound(); //404
            }
        }
    }
    
    //classes representing a request body. Used for model binding in requests
    public class RequestModel
    {
        public string Name { get; set; }
        public string Password { get; set; }
        public string Avatar { get; set; }
    }
    public class NameChangeRequestModel
    {
        public string Name { get; set; }
        public string NewName { get; set; }
    }
    public class PasswordChangeRequestModel
    {
        public string Name { get; set; }
        public string NewPassword { get; set; }
    }
    public class AvatarChangeRequestModel
    {
        public string Name { get; set; }
        public string Avatar { get; set; }
    }
}
