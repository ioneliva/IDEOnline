using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using LoginMicroservice.Models;
using System.Data.SqlClient;

namespace LoginMicroservice.Controllers
{
    [Route("[controller]")]
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

        // DELETE: /Users
        //for local testing: DELETE request to http://localhost:5200/Users, in body payload JSon ex: { "name":"aaa", "pswd":"123"}
        [HttpDelete]
        public async Task<IActionResult> DeleteUser([FromBody]RequestModel request)
        {
            //check if user exists in database and if the request matched it's password
            Users existingUser = _context.Users.Where(u => u.Name == request.Name).SingleOrDefault();
            CryptoUtility util = new CryptoUtility();
            if (existingUser != null)
            {
                if (util.ComparePasswd(request.Password, existingUser.Password, existingUser.Salt))
                {
                    //user name and password provided match existing user in database, deleting
                    _context.Users.Remove(existingUser);
                    await _context.SaveChangesAsync();
                    return Ok(); //200
                }else //wrong password, user is not authorized to delete this
                {
                    return Unauthorized(); //401
                }
            }
            else
            {
                return NotFound(); //404
            }
        }
    }
    
    //class representing a request body. User for model binding in request regarding Login database
    public class RequestModel
    {
        public string Name { get; set; }
        public string Password { get; set; }
        public string Avatar { get; set; }
    }
}
