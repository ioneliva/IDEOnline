namespace SaveLoadMicroservice.Models
{
    public class ResponseContainer
    {
        public string Name { get; set; }
        public string Type { get; set; }
        public string Parent { get; set; }
        public string Content { get; set; }
    }
    public class SimpleResponseContainer
    {
        public string Name { get; set; }
        public string Language { get; set; }
    }
}
