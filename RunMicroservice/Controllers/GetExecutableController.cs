using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json.Linq;
using RunMicroservice.Models;
using System.Collections.Generic;
using System.Linq;
using System.IO;
using System;
using System.Reflection;
using System.Diagnostics;
using System.IO.Compression;

namespace RunMicroservice.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class GetExecutableController : ControllerBase
    {
        //POST: /GetExecutable
        //this method handles a post with a project as filetree information and returns an executable for it
        [HttpPost]
        public ActionResult SendZipToClient([FromBody]RequestModel req)
        {
            List<SimpleFileStructure> fileList = new List<SimpleFileStructure>();
            string projectRootPath = Path.GetFullPath(Path.Combine(Path.GetDirectoryName(Assembly.GetEntryAssembly().Location), "..", "..", ".."));
            string csprojLocation = "", projName = "";

            //get environment from request
            string env = req.Env;
            JArray fileTree = req.Filetree;

            //create root
            foreach (JObject item in fileTree.Take(1))
            {
                SimpleFileStructure file = new SimpleFileStructure();
                file.Name = item.GetValue("root").ToString();
                projName = file.Name;
                csprojLocation = file.Path = projectRootPath + "\\Samples\\" + item.GetValue("root").ToString();
                //create root dir
                Directory.CreateDirectory(file.Path);
                fileList.Add(file);
            }

            //create all files and directories in root
            foreach (JObject item in fileTree.Skip(1))
            {
                SimpleFileStructure file = new SimpleFileStructure();
                //strip the parent out of the file name (file name comes in the form file.extension_parent)
                int indexof_ = item.GetValue("name").ToString().IndexOf("_");
                file.Name = indexof_ == -1 ? item.GetValue("name").ToString() : item.GetValue("name").ToString().Substring(0, indexof_);

                string parentPath = fileList.Where(f => f.Name == item.GetValue("parent").ToString()).FirstOrDefault().Path;
                file.Path = Path.Combine(parentPath, file.Name);

                if (item.GetValue("type").ToString() == "Directory")
                {
                    //create directory
                    Directory.CreateDirectory(file.Path);
                }
                else if (item.GetValue("type").ToString() == "File")
                {
                    string content = "";
                    if (item.GetValue("content") != null && item.GetValue("content").ToString() != "")
                    {
                        content = item.GetValue("content").ToString();
                    }
                    //create file
                    System.IO.File.WriteAllText(file.Path, content);
                }
                fileList.Add(file);
            }

            //Release project using dotnet CLI
            ProcessStartInfo startInfo = new ProcessStartInfo
            {
                CreateNoWindow = true,
                UseShellExecute = false,
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                FileName = "dotnet",
                Arguments = " publish " + csprojLocation + " -c Release -r " + env +" --self-contained -o " + csprojLocation + "\\Releases"
                //note: since Core 2.0, dotnet restore is automatically called on dotnet publish
            };
            string successResult = "", errResult = "";
            try
            {
                using (Process process = Process.Start(startInfo))
                {
                    using (StreamReader sr = process.StandardOutput)
                    {
                        successResult = sr.ReadToEnd();

                    }
                    using (StreamReader sr = process.StandardError)
                    {
                        errResult = sr.ReadToEnd();

                    }
                    process.WaitForExit();
                }
            }
            catch (Exception ex)
            {
                return Conflict(); //409
            }

            //once the executables are created to pack them into an archive and send it to client
            DirectoryInfo releasesDir = new DirectoryInfo(csprojLocation + "\\Releases\\");
            var archive = GetArchive(releasesDir, projName + ".zip");

            ////delete the temporary project created
            Directory.Delete(csprojLocation, true);

            return archive;
        }

        //in memory compression for releases dir, archive not created on disk
        private FileContentResult GetArchive(DirectoryInfo releasesDir, string archiveName)
        {
            FileInfo[] Files = releasesDir.GetFiles("*.*");

            byte[] compressedBytes;
            using (var outStream = new MemoryStream())
            {
                using (var archive = new ZipArchive(outStream, ZipArchiveMode.Create, true))
                {
                    foreach (FileInfo file in Files)
                    {
                        byte[] fileBytes = System.IO.File.ReadAllBytes(file.FullName);
                        var fileInArchive = archive.CreateEntry(file.Name, CompressionLevel.Optimal);

                        using (var entryStream = fileInArchive.Open())
                        using (var fileToCompressStream = new MemoryStream(fileBytes))
                        {
                            fileToCompressStream.CopyTo(entryStream);
                        }
                    }
                }
                compressedBytes = outStream.ToArray();
            }
            return File(compressedBytes, "application/zip", archiveName);
        }
    }
}