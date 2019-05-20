using System;
using System.Data.SqlClient;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json.Linq;
using SaveLoadMicroservice.Models;

namespace SaveLoadMicroservice.Controllers
{
    [Route("[controller]")]
    [Authorize]
    [ApiController]
    public class SaveController : ControllerBase
    {
        private readonly SaveLoadDbContext _context;

        public SaveController(SaveLoadDbContext context)
        {
            _context = context;
        }

        //PUT: /Save  
        [HttpPut]
        public async Task<IActionResult> SaveUserProject([FromBody]JArray req)
        {
            foreach (JObject item in req)
            {
                string fileName = item.GetValue("name").ToString();
                string fileType = item.GetValue("type").ToString();
                //get file parentId, knowing parentName
                UserFiles fileParent = _context.UserFiles.Where(f => f.Name == item.GetValue("parent").ToString()).SingleOrDefault();
                long fileParentId = -1;
                if (fileParent != null)
                {
                    fileParentId = fileParent.Id;
                }
                string fileContent = item.GetValue("content").ToString();
                //instance of files class for new user
                UserFiles newUserFiles = new UserFiles
                {
                    Name = fileName,
                    Type = fileType,
                    ParentId = fileParentId,
                    Content = fileContent,
                };

                //extract user name from JWT token
                string username = User.FindFirst(ClaimTypes.NameIdentifier).Value;
                //check if user already exists in the Users table
                try
                {
                    Users existingUser = _context.Users.Where(u => u.Name == username).SingleOrDefault();
                if (existingUser == null) //insert new user, new files
                {
                    Users newUser = new Users { Name = username };
                    _context.Users.Add(newUser);
                    _context.SaveChanges(); //not async, we need the id created before we can proceed
                    //get id of user from users table, knowing user name
                    long userId = _context.Users.Where(u => u.Name == username).SingleOrDefault().Id;
                    newUserFiles.UserId = userId;
                    _context.UserFiles.Add(newUserFiles);
                    await _context.SaveChangesAsync();
                }
                else
                {
                    //check if the file for this user already exists, within the same Directory (directory represented by parentId)
                    IQueryable<UserFiles> existingFiles = from f in _context.UserFiles
                                                          where f.Name == fileName && f.UserId == existingUser.Id && f.ParentId == fileParentId
                                                          select f;
                    if (!existingFiles.Any())   //user already exists, but file is new, inserting new file
                    {
                        newUserFiles.UserId = existingUser.Id;
                        _context.UserFiles.Add(newUserFiles);
                        await _context.SaveChangesAsync();
                    }
                    else    //user already exists, file already exists, updating file
                    {
                        foreach (UserFiles file in existingFiles)
                        {
                            file.Content = fileContent;
                        }
                        await _context.SaveChangesAsync();
                    }
                }
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
            }
            return Ok();
        }
    }
}