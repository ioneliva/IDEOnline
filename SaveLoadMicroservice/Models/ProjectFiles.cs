namespace SaveLoadMicroservice.Models
{
    public partial class ProjectFiles
    {
        public long Id { get; set; }
        public long? ProjectId { get; set; }
        public string Name { get; set; }
        public string DirectParent { get; set; }
        public string Content { get; set; }
        public string Type { get; set; }

        public virtual Projects Project { get; set; }
    }
}
