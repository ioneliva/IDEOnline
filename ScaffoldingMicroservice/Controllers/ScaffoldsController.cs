using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using ScaffoldingMicroservice.Models;
using System;
using System.Diagnostics;
using System.IO;
using System.Reflection;

namespace ScaffoldingMicroservice.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class ScaffoldsController : Controller
    {
        // GET /Scaffolds?scaffold=_scaffold&projectName=_name
        [HttpGet]
        public IActionResult GetScaffold(string scaffoldName, string projectName)
        {
            JArray jsonResponse = new JArray();
            string WorkingDirPath = Path.GetDirectoryName(Assembly.GetEntryAssembly().Location);
            string projectRootPath = Path.GetFullPath(Path.Combine(WorkingDirPath, "..", "..", ".."));

            ProcessStartInfo startInfo = new ProcessStartInfo
            {
                CreateNoWindow = true,
                UseShellExecute = false,
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                FileName = "dotnet",
                Arguments = " new " + scaffoldName + " --name " + projectName + " --no-restore" + " -o " + projectRootPath + "\\Samples\\" + projectName
                //note: since Core 2.0, dotnet restore is automatically run on dotnet new, unless specified, as we did above
            };

            string result;
            try
            {
                using (Process process = Process.Start(startInfo))
                {
                    process.WaitForExit();
                    using (StreamReader sr = process.StandardOutput)
                    {
                        result = sr.ReadToEnd();
                        //output is redirected to stream sr, but we have no use for it. Handy to have. Will display on console for now
                        Console.Write(result);
                    }
                }
            }
            catch (Exception ex)
            {
                result = ex.ToString();
            }

            //build the client response from sample created
            string createdProjectPath = projectRootPath + "\\Samples\\" + projectName;
            string rootPath = createdProjectPath;
            JArray ret = GetStructure(createdProjectPath, rootPath, new JArray());
            //delete sample files
            Directory.Delete(createdProjectPath, true);

            return Ok(ret.ToString()); //200
        }

        //read directories and files for the scaffold requested (recursive method)
        //note: had to pass the Jarray container as a parameter because it would get reinitialised at every recursion
        private JArray GetStructure(string directoryPath, string rootPath, JArray vector)
        {
            ResponseContainer container;
            
            //add the root
            if (directoryPath == rootPath)
            {
                container = new ResponseContainer()
                {
                    Name = new DirectoryInfo(directoryPath).Name,
                    Type = "c#",
                    Parent = "",
                    Content = ""
                };
                vector.Add(JsonConvert.SerializeObject(container));
            }

            //add all files in current directory
            foreach (string file in Directory.GetFiles(directoryPath))
            {
                string fileContent = System.IO.File.ReadAllText(file);
                container = new ResponseContainer()
                {
                    Name =new FileInfo(file).Name + "_" +new DirectoryInfo(directoryPath).Name,
                    Type = "File",
                    Parent = new DirectoryInfo(directoryPath).Name,
                    Content = fileContent
                };
                vector.Add(JsonConvert.SerializeObject(container));
            }

            //add all sub-directories
            foreach (string dir in Directory.GetDirectories(directoryPath))
            {
                container = new ResponseContainer()
                {
                    Name = new DirectoryInfo(dir).Name,
                    Type = "Directory",
                    Parent = new DirectoryInfo(directoryPath).Name,
                    Content = ""
                };
                vector.Add(JsonConvert.SerializeObject(container));
                //recursively add files in each sub-directory
                GetStructure(dir, rootPath, vector);
            }

            //loop is over, we convert json array to string representation, send it to client
            return vector;
        }
    }
}
