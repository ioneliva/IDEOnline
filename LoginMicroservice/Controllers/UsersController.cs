using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using LoginMicroservice.Models;
using System.Data.SqlClient;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using System.Security.Claims;

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
                return Ok(); //200
            }
            else
            {
                return Conflict(); //409
            }
        }

        // POST: /users/editName
        [HttpPost("editName")]
        public async Task<IActionResult> EditUsername([FromBody]NameChangeRequestModel req)
        {
            //not checking name length on this, I did it on the client
            //find current user name for request client
            string username = User.FindFirst(ClaimTypes.NameIdentifier).Value;

            //find user in the database
            Users existingUser = _context.Users.Where(u => u.Name == username).SingleOrDefault();
            //check if desired username is not too long
            if (req.NewName.Length < 20)
            {
                //check if desired username is not already taken
                Users userNameTaken = _context.Users.Where(u => u.Name == req.NewName).SingleOrDefault();
                if (userNameTaken == null)
                {
                    try
                    {
                        existingUser.Name = req.NewName;
                        _context.Update(existingUser);
                        await _context.SaveChangesAsync();
                        return Ok(); //200
                    }
                    catch
                    {
                        return StatusCode(420); //Method Failure
                    }
                }
                else
                {
                    return Conflict(); //409
                }
            }else
            {
                return StatusCode(413); //Request Entity Too Large
            }
        }

        // POST: /users/editPassword
        [HttpPost("editPassword")]
        public async Task<IActionResult> EditPassword([FromBody]PasswordChangeRequestModel request)
        {
            //find current user name for request client
            string username = User.FindFirst(ClaimTypes.NameIdentifier).Value;

            //find user in the database
            Users existingUser = _context.Users.Where(u => u.Name == username).SingleOrDefault();
            CryptoUtility util = new CryptoUtility();
            try
            {
                existingUser.Password = util.GenerateHash(request.NewPassword, existingUser.Salt);
                _context.Update(existingUser);
                await _context.SaveChangesAsync();
                return Ok(); //200
            }
            catch
            {
                return StatusCode(420); //Method Failure
            }
        }

        // POST: /Users/editAvatar
        [HttpPost("editAvatar")]
        public async Task<IActionResult> EditAvatar([FromBody]AvatarChangeRequestModel request)
        {
            //find current user name for request client
            string username = User.FindFirst(ClaimTypes.NameIdentifier).Value;

            //find user in the database
            Users existingUser = _context.Users.Where(u => u.Name == username).SingleOrDefault();
            try
            {
                existingUser.Avatar = request.NewAvatar;
                _context.Update(existingUser);
                await _context.SaveChangesAsync();
                return Ok(); //200
            }
            catch
            {
                return StatusCode(420); //Method Failure
            }
        }

        // DELETE: /Users/deleteAccount
        [HttpDelete("deleteAccount")]
        public async Task<IActionResult> DeleteAccount()
        {
            //find current user name for request client from the jwt token
            string username = User.FindFirst(ClaimTypes.NameIdentifier).Value;
            //find user in the database
            Users existingUser = _context.Users.Where(u => u.Name == username).SingleOrDefault();
            //delete it
            if (existingUser != null)
            {
                try { 
                _context.Users.Remove(existingUser);
                await _context.SaveChangesAsync();
                return Ok(); //200
                }
                catch
                {
                    return StatusCode(420); //Method Failure
                }
            }
            else
            {
                return NotFound(); //404
            }
        }
    }
}
