using System;
using System.Data.SqlClient;
using System.Linq;
using System.Net;
using Microsoft.AspNetCore.Mvc;
using SaveLoadMicroservice.Models;

namespace SaveLoadMicroservice.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class SaveController : ControllerBase
    {
        private readonly dbContext _context;

        public SaveController(dbContext context)
        {
            _context = context;
        }

        // POST: /Save  
        //in body payload JSon ex: {"UserName":"George","FileName":"myCFile.cpp","FileContent": "#include <iostream> int main(){}","FileParentId": 34}
        [HttpPost]
        public HttpStatusCode PostUserFiles([FromBody]RequestModel req)
        {
            UserFiles newUserFiles = new UserFiles
            {
                Name = req.FileName,
                Content = req.FileContent,
                ParentId = req.FileParentId
            };
            //try
            //{
                //checking if the user already exits
                Users existingUser = _context.Users.Where(u => u.Name == req.UserName).SingleOrDefault();
                if (existingUser == null) //insert new user, new files
                {
                    Users newUser = new Users
                    {
                        Name = req.UserName
                    };
                    //insert new user
                    _context.Users.Add(newUser);
                    _context.SaveChanges();
                    //insert new files for new user
                    newUserFiles.UserId = newUser.Id;
                    _context.UserFiles.Add(newUserFiles);
                    _context.SaveChanges();
                }
                else
                {
                    //check if the file for this user already exists, within the same Directory (directory represented by parentId)
                    IQueryable<UserFiles> existingFiles = from f in _context.UserFiles
                                                          where f.Name == req.FileName && f.UserId == existingUser.Id && f.ParentId == req.FileParentId
                                                          select f;
                    if (!existingFiles.Any())   //user already exists, but file is new, inserting new file
                    {
                        newUserFiles.UserId = existingUser.Id;
                        _context.UserFiles.Add(newUserFiles);
                        _context.SaveChanges();
                    }
                    else    //user already exists, file already exists, updating file
                    {
                        foreach (UserFiles file in existingFiles)
                        {
                            file.Content = req.FileContent;
                        }
                        _context.SaveChanges();
                    }
                    //update user files
                }
            //}
            //catch (Exception ex)
            //{
                //if (ex.GetBaseException().GetType() == typeof(SqlException))
                //{
                //    Int32 ErrorCode = ((SqlException)ex.InnerException).Number;
                //    switch (ErrorCode)
                //    {
                //        case 2627:  // Unique constraint error
                //            return (HttpStatusCode)2627;
                //        case 547:   // Constraint check violation
                //            return (HttpStatusCode)547;
                //        case 2601:  // Duplicated key row error
                //            return (HttpStatusCode)2601;
                //        default:
                //            break;
                //    }
                //}
            //}
            return HttpStatusCode.OK;
        }
    }
}