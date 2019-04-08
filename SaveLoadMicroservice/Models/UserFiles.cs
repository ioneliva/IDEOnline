using System.ComponentModel.DataAnnotations;

namespace SaveLoadMicroservice.Models
{
    public partial class UserFiles
    {
        [Key]
        public long Id { get; set; }
        public long? UserId { get; set; }
        public string Name { get; set; }
        public long ParentId { get; set; }
        public string Content { get; set; }

        public virtual Users User { get; set; }
    }
}
