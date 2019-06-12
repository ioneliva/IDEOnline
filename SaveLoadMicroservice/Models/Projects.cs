using System.Collections.Generic;

namespace SaveLoadMicroservice.Models
{
    public partial class Projects
    {
        public Projects()
        {
            ProjectFiles = new HashSet<ProjectFiles>();
        }

        public long Id { get; set; }
        public long? UserId { get; set; }
        public string Name { get; set; }
        public string Language { get; set; }

        public virtual Users User { get; set; }
        public virtual ICollection<ProjectFiles> ProjectFiles { get; set; }
    }
}
