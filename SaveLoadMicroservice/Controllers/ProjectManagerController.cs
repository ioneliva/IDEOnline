using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
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
    }
}