namespace SaveLoadMicroservice.Models
{
    public class RequestModel
    {
        public int UserId { get; set; }
        public string UserName { get; set; }
        public int Id { get; set; }
        public string FileName { get; set; }
        public string FileContent { get; set; }
        public int FileParentId { get; set; }
    }
}
