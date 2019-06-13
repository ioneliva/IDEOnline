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
            //extract user name from JWT token
            string username = User.FindFirst(ClaimTypes.NameIdentifier).Value;
            //check if user already exists in the Users table
            Users existingUser = _context.Users.Where(u => u.Name == username).FirstOrDefault();
            try
            {
                Users user = new Users();
                if (existingUser == null)
                {
                    user.Name = username;
                    _context.Users.Add(user);
                    await _context.SaveChangesAsync();
                }
                else
                {
                    user = existingUser;
                }

                //first item in JArray is alywas the root (and project name)
                Projects project = new Projects();
                foreach (JObject item in req.Take(1))
                {
                    project.UserId = user.Id;
                    project.Name = item.GetValue("root").ToString();
                    project.Language = item.GetValue("language").ToString();

                    //check if the project for this user already exists
                    Projects existingProject = (from p in _context.Projects
                                                where p.Name == item.GetValue("root").ToString() && p.UserId == user.Id
                                                select p).FirstOrDefault();
                    if (existingProject == null)
                    {
                        _context.Projects.Add(project);
                    }
                    else
                    {
                        /*if project already exists we delete it and recreate it based on the data received
                        this is to track any deleted or renamed files and directories
                        we could update each element separateley, but that takes more database transactions, more code both here and on the client and is actually slower*/
                        _context.Projects.Remove(existingProject);
                        _context.Projects.Add(project);
                    }
                    await _context.SaveChangesAsync();
                }

                //after first item in JArray, the files and directories are enumerated
                foreach (JObject item in req.Skip(1))
                {
                    string content = "";
                    if (item.GetValue("content") != null)
                    {
                        content = item.GetValue("content").ToString();
                    }
                    ProjectFiles projectFile = new ProjectFiles
                    {
                        ProjectId = project.Id,
                        Name = item.GetValue("name").ToString(),
                        Type = item.GetValue("type").ToString(),
                        DirectParent = item.GetValue("parent").ToString(),
                        Content = content
                    };
                    _context.ProjectFiles.Add(projectFile);
                    await _context.SaveChangesAsync();
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
                return StatusCode(500); //Internal server error
            }
            return Ok();
        }
    }
}
