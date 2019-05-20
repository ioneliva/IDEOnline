using System;
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
             sql would be SELECT * FROM UserFiles
                                    INNER JOIN Users
                                        WHERE UserFiles.UserId == Users.Id
                                        AND Users.Name = username AND UserFiles.parentId =-1
             */
            IQueryable<object> userFiles = from f in _context.UserFiles
                                           join u in _context.Users on f.UserId equals u.Id
                                           where u.Name == username && f.ParentId == -1
                                           select f;
            if (userFiles.Any())
            {
                foreach (UserFiles file in userFiles)
                {
                    //prepare a response object to contain only certain properties we need for the client
                    SimpleResponseContainer container = new SimpleResponseContainer()
                    {
                        Name = file.Name,
                        Type = file.Type,
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