using System;
using System.Collections.Generic;

namespace SaveLoadMicroservice.Models
{
    public partial class UserFiles
    {
        public long Id { get; set; }
        public long? UserId { get; set; }
        public string Name { get; set; }
        public long? ParentId { get; set; }
        public string Content { get; set; }
        public string Type { get; set; }

        public virtual Users User { get; set; }
    }
}
