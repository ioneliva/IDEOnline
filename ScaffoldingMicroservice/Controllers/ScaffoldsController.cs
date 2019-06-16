using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json.Linq;
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
        // GET /Scaffolds?scaffold={query}
        [HttpGet]
        public IActionResult GetScaffold(string scaffoldName)
        {
            JArray jsonResponse = new JArray();
            string WorkingDirPath = Path.GetDirectoryName(Assembly.GetEntryAssembly().Location);
            string projectRootPath = Path.GetFullPath(Path.Combine(WorkingDirPath, "..","..",".."));

            ProcessStartInfo startInfo = new ProcessStartInfo
            {
                CreateNoWindow = true,
                UseShellExecute = false,
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                FileName = "dotnet",
                Arguments = " new " + scaffoldName + " --name " + scaffoldName + "_sample" + " -o " + projectRootPath + "\\Samples\\"+ scaffoldName
            };

            var process = Process.Start(startInfo) ?? throw new Exception("could not start process");
            process.WaitForExit();

            using (StreamReader sr = process.StandardOutput)
            {
                string result = sr.ReadToEnd();
                Console.Write(result);
            }


            return Ok(jsonResponse.ToString()); //200
        }

    }
}
