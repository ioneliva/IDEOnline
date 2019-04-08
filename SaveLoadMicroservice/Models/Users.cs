using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace SaveLoadMicroservice.Models
{
    public partial class Users
    {
        public Users()
        {
            UserFiles = new HashSet<UserFiles>();
        }
        [Key]
        public long Id { get; set; }
        public string Name { get; set; }

        public virtual ICollection<UserFiles> UserFiles { get; set; }
    }
}
