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

            //extract user name from JWT token
            string username = User.FindFirst(ClaimTypes.NameIdentifier).Value;

            /*We will have to implement a BFS traverse to get all the file descending from the root*/
            Queue<UserFiles> que = new Queue<UserFiles>();
            //1.add root to que
            IQueryable<UserFiles> rootSearch = from f in _context.UserFiles
                                              join u in _context.Users on f.UserId equals u.Id
                                              where u.Name == username && f.Name == projectName
                                         select f;
            foreach (UserFiles root in rootSearch)
            {
                que.Enqueue(root);      //there's always exactly 1 root found
            }
            //2.loop through que until empty
            while (que.Count > 0)
            {
                //3.Take last element out from que
                UserFiles current = que.Dequeue();
                //4.find and add all children of the current node and add them to the que
                /* sql would look like: SELECT * FROM UserFiles
                                            INNER JOIN Users 
                                                WHERE Users.Id = UserFiles.userId 
                                                AND UserFiles.ParentID = current.id */
                IQueryable<UserFiles> userFiles = from f in _context.UserFiles
                                                  join u in _context.Users on f.UserId equals u.Id
                                                  where u.Name == username && f.ParentId == current.Id
                                                  select f;
                if (userFiles.Any())
                {
                    foreach (UserFiles child in userFiles)
                    {
                        que.Enqueue(child);
                    }
                }
                //5.execute our logic for the current node
                string parentName = "";
                //get parent name from parent id
                if (_context.UserFiles.Where(uf => uf.Id == current.ParentId).SingleOrDefault() != null) //will be null for root
                {
                    parentName = _context.UserFiles.Where(uf => uf.Id == current.ParentId).SingleOrDefault().Name;
                }
                //prepare a response object to contain certain properties we need for the client
                ResponseContainer container = new ResponseContainer()
                {
                    Name = current.Name,
                    Type = current.Type,
                    Parent = parentName,
                    Content = current.Content
                };
                //add container to an array of jsons we will return at the end
                jsonResponse.Add(JsonConvert.SerializeObject(container));
            }
            //loop is over, we convert json array to string representation, send it to client
            return Ok(jsonResponse.ToString()); //200
        }
    }
}