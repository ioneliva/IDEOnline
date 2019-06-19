using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json.Linq;
using RunMicroservice.Models;
using System.Collections.Generic;
using System.Linq;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis;
using System.IO;
using System;
using System.Reflection;
using System.Runtime.Loader;
using Newtonsoft.Json;
using System.Diagnostics;

namespace RunMicroservice.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class RunController : ControllerBase
    {
        //POST: /Run
        //this method uses dotnet CLI to compile and run the project
        //it works for all types of projects and it's consistent, but it is quite slow. See next method for an alternative
        [HttpPost]
        public IActionResult Run([FromBody]JArray req)
        {
            List<SimpleFileStructure> fileList = new List<SimpleFileStructure>();
            string projectRootPath = Path.GetFullPath(Path.Combine(Path.GetDirectoryName(Assembly.GetEntryAssembly().Location), "..", "..", ".."));
            string csprojLocation = "";

            //create root
            foreach (JObject item in req.Take(1))
            {
                SimpleFileStructure file = new SimpleFileStructure();
                file.Name = item.GetValue("root").ToString();
                csprojLocation = file.Path = projectRootPath + "\\Samples\\" + item.GetValue("root").ToString();
                //create root dir
                Directory.CreateDirectory(file.Path);
                fileList.Add(file);
            }
            
            //create all files and directories in root
            foreach (JObject item in req.Skip(1))
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

            //compile and run created structure using dotnet CLI
            ProcessStartInfo startInfo = new ProcessStartInfo
            {
                CreateNoWindow = true,
                UseShellExecute = false,
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                FileName = "dotnet",
                Arguments = " run -p " + csprojLocation + " --verbosity q"
                //note: since Core 2.0, dotnet restore is automatically called on dotnet run
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
                return Conflict(ex); //409
            }

            //delete the temporary project created
            Directory.Delete(csprojLocation, true);

            //strip directory paths from compilation response (these are the directories created on the server, irrelevant for the client)
            successResult = StripDirectoryPaths(successResult);
            errResult = StripDirectoryPaths(errResult);
            //return response as Json Object
            Dictionary<string, string> responseMessage = new Dictionary<string, string>
            {
                { "successResult", successResult },
                { "errResult", errResult }
            };

            return Ok(JsonConvert.SerializeObject(responseMessage)); //200
        }

        //remove directory paths from string. Directories are represented as [path]
        private string StripDirectoryPaths(string fullPath)
        {
            string strippedPath = "";
            if (fullPath.IndexOf("[") == -1) { return fullPath; }
            else { 
                string[] strArray = fullPath.Split('[');
                foreach (string item in strArray)
                {
                    if (item.IndexOf("]") == -1)
                    {
                        strippedPath += item;
                    }
                    else { 
                        string clean = item.Remove(0, item.IndexOf("]")+1);
                        strippedPath += clean;
                    }
                }
                return strippedPath;
            }
        }

        //POST: /run/Roslyn
        //this method compiles and runs the project using Roslyn .Net Compiler
        //works great for single files and is faster than the CLI. It fails for multiple files with inter-dependancies, though...
        [HttpPost("Roslyn")]
        public IActionResult Runproject([FromBody]JArray req)
        {
            ResponseContainer response = new ResponseContainer();
            Project project = new Project();
            ProjectFile file = new ProjectFile();

            //get file structure from request
            foreach (JObject item in req.Take(1))
            {
                project.Root = item.GetValue("root").ToString();
                project.Language = item.GetValue("language").ToString();
            }

            List<ProjectFile> fileList =new List<ProjectFile>();
            foreach (JObject item in req.Skip(1))
            {
                file.Name = item.GetValue("name").ToString();
                file.Type = item.GetValue("type").ToString();
                file.Parent = item.GetValue("parent").ToString();
                string content = "";
                if (item.GetValue("content") != null && item.GetValue("content").ToString() != "")
                {
                    content = item.GetValue("content").ToString();
                }
                file.Content = content;

                fileList.Add(file);

                string dotnetCoreDirectory = Path.GetDirectoryName(typeof(object).GetTypeInfo().Assembly.Location);
                //assembly name needs to be unique, so we don't get a conflict on re-running and loading the same assembly from memory
                string assemblyName = "Gen" + Guid.NewGuid().ToString().Replace("-", "") + ".dll";
                CSharpCompilation compilation = CSharpCompilation.Create(assemblyName)
                    .WithOptions(new CSharpCompilationOptions(OutputKind.DynamicallyLinkedLibrary))
                    .AddReferences(
                        MetadataReference.CreateFromFile(typeof(object).GetTypeInfo().Assembly.Location),
                        MetadataReference.CreateFromFile(typeof(Console).GetTypeInfo().Assembly.Location),
                        MetadataReference.CreateFromFile(typeof(Enumerable).GetTypeInfo().Assembly.Location),
                        MetadataReference.CreateFromFile(Path.Combine(dotnetCoreDirectory, "System.Private.CoreLib.dll")),
                        MetadataReference.CreateFromFile(Path.Combine(dotnetCoreDirectory, "System.Console.dll")),
                        MetadataReference.CreateFromFile(Path.Combine(dotnetCoreDirectory, "System.Runtime.dll")))
                    .AddSyntaxTrees(CSharpSyntaxTree.ParseText(file.Content));

                // Debug output
                foreach (Diagnostic compilerMessage in compilation.GetDiagnostics())
                {
                    response.Error += compilerMessage;
                    return Ok(JsonConvert.SerializeObject(response)); //200
                }

                //output compilation to in memory stream (can also be deployed on disk as an exe or dll, but we don't want that)
                using (MemoryStream memoryStream = new MemoryStream())
                {
                    Microsoft.CodeAnalysis.Emit.EmitResult emitResult = compilation.Emit(memoryStream);
                    if (emitResult.Success)
                    {
                        memoryStream.Seek(0, SeekOrigin.Begin);

                        //load assembly from memory
                        AssemblyLoadContext context = AssemblyLoadContext.Default;
                        Assembly assembly = context.LoadFromStream(memoryStream);

                        //use reflection to execute assembly
                        BindingFlags methodsFilter = BindingFlags.Public | BindingFlags.NonPublic | BindingFlags.Static;
                        string TypeContainingEntryPoint = (from type in assembly.GetTypes()
                                                        from method in type.GetMethods(methodsFilter)
                                                        where method.Name == "Main"
                                                        select type.FullName).FirstOrDefault();

                        if (TypeContainingEntryPoint != null)
                        {
                            //redirect stdout and stderror to a Stringwriter object
                            StringWriter stringWriter = new StringWriter();
                            Console.SetOut(stringWriter);
                            Console.SetError(stringWriter);

                            //note: main() is static, there's no need to instantiate the type containing it, and there are no params passed, therefore parameters (null, null)
                            assembly.GetType(TypeContainingEntryPoint).GetMethod("Main", methodsFilter).Invoke(null, null);

                            response.Result += stringWriter.ToString();
                        }
                    }
                }
            }
            project.Files=fileList;

            if(response.Result != "" || response.Error != "")
            {
                return Ok(JsonConvert.SerializeObject(response)); //200
            }
            else
            {
                return NoContent(); //204
            }
        }
    }
}