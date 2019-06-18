using System.Collections.Generic;

namespace RunMicroservice.Models
{
    public class Project
    {
        public string Root { get; set; }
        public string Language { get; set; }
        public List<ProjectFile> Files { get; set; }

    }
    public class ProjectFile
    {
        public string Name { get; set; }
        public string Type { get; set; }
        public string Parent { get; set; }
        public string Content { get; set; }
    }
    public class SimpleFileStructure
    {
        public string Name { get; set; }
        public string Path { get; set; }
    }
}
