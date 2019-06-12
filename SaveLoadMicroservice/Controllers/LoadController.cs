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
    public class LoadController : Controller
    {
        private readonly SaveLoadDbContext _context;

        public LoadController(SaveLoadDbContext context)
        {
            _context = context;
        }

        //GET /Load?projectName={projectName}"
        [HttpGet]
        public IActionResult LoadProject(string projectName)
        {
            JArray jsonResponse =new JArray();

            //get all files for project
            /*sql would look like: SELECT * FROM ProjectFiles
                                      INNER JOIN Projects
                                      WHERE ProjectFiles.ProjectId = Projects.Id
                                          AND Projects.Name == projectName */
            IQueryable<ProjectFiles> projectFiles = from pf in _context.ProjectFiles
                                                       join p in _context.Projects on pf.ProjectId equals p.Id
                                                       where p.Name == projectName
                                                       select pf;

            //add the root to the response
            Projects root = _context.Projects.Where(p => p.Name ==projectName).First(); 
            ResponseContainer container = new ResponseContainer()
            {
                Name = root.Name,
                Type = root.Language,
                Parent = "" //root is the only element without a parent. This is how we identify it on the client
            };
            //add container to an array of jsons we will return at the end
            jsonResponse.Add(JsonConvert.SerializeObject(container));
            //add the files and directories to the container
            if (projectFiles.Any())
            {
                foreach (ProjectFiles file in projectFiles)
                {
                    container = new ResponseContainer()
                    {
                        Name = file.Name,
                        Type = file.Type,
                        Parent = file.DirectParent,
                        Content = file.Content
                    };
                    jsonResponse.Add(JsonConvert.SerializeObject(container));
                }
            }
            //loop is over, we convert json array to string representation, send it to client
            return Ok(jsonResponse.ToString()); //200
        }
    }
}