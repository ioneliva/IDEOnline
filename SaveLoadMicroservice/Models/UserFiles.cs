namespace SaveLoadMicroservice.Models
{
    public partial class UserFiles
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string FileName { get; set; }
        public string FileContent { get; set; }
        public int FileParentId { get; set; }

        public virtual Users User { get; set; }
    }
}
