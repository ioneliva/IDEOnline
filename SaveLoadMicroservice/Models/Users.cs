using System;
using System.Collections.Generic;

namespace SaveLoadMicroservice.Models
{
    public partial class Users
    {
        public Users()
        {
            UserFiles = new HashSet<UserFiles>();
        }

        public long Id { get; set; }
        public string Name { get; set; }

        public virtual ICollection<UserFiles> UserFiles { get; set; }
    }
}
