using Microsoft.AspNetCore.Authorization;
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

namespace RunMicroservice.Controllers
{
    [Route("[controller]")]
    [Authorize]
    [ApiController]
    public class RunController : ControllerBase
    {
        //POST: /run
        [HttpPost]
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