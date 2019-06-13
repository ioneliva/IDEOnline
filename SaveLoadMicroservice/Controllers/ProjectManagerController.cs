using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using SaveLoadMicroservice.Models;

namespace SaveLoadMicroservice.Controllers
{
    [Route("[controller]")]
    [Authorize]
    [ApiController]
    public class ProjectManagerController : Controller
    {
        private readonly SaveLoadDbContext _context;

        public ProjectManagerController(SaveLoadDbContext context)
        {
            _context = context;
        }

        //GET /projectManager/getlist
        [HttpGet("getlist")]
        public IActionResult GetProjectList()
        {
            JArray jsonResponse = new JArray();

            //extract user name from JWT token
            string username = User.FindFirst(ClaimTypes.NameIdentifier).Value;

            /*find all projects saved by this user (project root has parent == -1)
             sql would be SELECT * FROM Projects
                                    INNER JOIN Users
                                        WHERE Projects.UserId == Users.Id
                                        AND Users.Name = username
             */
            IQueryable<object> userProjects = from p in _context.Projects
                                               join u in _context.Users on p.UserId equals u.Id
                                               where u.Name == username
                                               select p;
            if (userProjects.Any())
            {
                foreach (Projects project in userProjects)
                {
                    //prepare a response object to contain only certain properties we need for the client
                    SimpleResponseContainer container = new SimpleResponseContainer()
                    {
                        Name = project.Name,
                        Language = project.Language,
                    };
                    //add response to an array of jsons
                    jsonResponse.Add(JsonConvert.SerializeObject(container));
                }
                //convert json array to string representation, send it to client
                return Ok(jsonResponse.ToString()); //200
            }
            return NotFound(); //404
        }

        //POST /projectManager/renameProject
        [HttpPost("renameProject")]
        public async Task<IActionResult> RenameProject([FromBody]ProjectRenameRequest req)
        {
            //extract user name from JWT Token
            string username = User.FindFirst(ClaimTypes.NameIdentifier).Value;
            //find project in database
            Projects project = (from p in _context.Projects
                                  join u in _context.Users on p.UserId equals u.Id
                                  where u.Name == username && p.Name== req.Project
                                  select p).FirstOrDefault();
            //rename project (if it exists)
            if (project != null)
            {
                project.Name = req.NewName;
                _context.Projects.Update(project);
                await _context.SaveChangesAsync();
            }

            return Ok(); //200
        }

        //DELETE /projectManager/deleteProject?projectName=name
        [HttpDelete("deleteProject")]
        public async Task<IActionResult> DeleteProject(string projectName)
        {
            //extract user name from JWT Token
            string username = User.FindFirst(ClaimTypes.NameIdentifier).Value;
            //find project in database
            Projects project = (from p in _context.Projects
                                join u in _context.Users on p.UserId equals u.Id
                                where u.Name == username && p.Name == projectName
                                select p).First();  //We are guaranteeed to have exactly one project match

            //delete project
            _context.Projects.Remove(project);
            await _context.SaveChangesAsync();
            return Accepted(); //202
        }
    }
}