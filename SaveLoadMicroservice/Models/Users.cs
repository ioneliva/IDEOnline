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
        public int UserId { get; set; }
        public string UserName { get; set; }

        public virtual ICollection<UserFiles> UserFiles { get; set; }
    }
}
