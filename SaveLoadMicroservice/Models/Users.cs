using System.Collections.Generic;

namespace SaveLoadMicroservice.Models
{
    public partial class Users
    {
        public Users()
        {
            Projects = new HashSet<Projects>();
        }

        public long Id { get; set; }
        public string Name { get; set; }

        public virtual ICollection<Projects> Projects { get; set; }
    }
}
