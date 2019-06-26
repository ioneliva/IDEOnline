using Newtonsoft.Json.Linq;

namespace RunMicroservice.Models
{
    public class RequestModel
    {
        public string Env { get; set; }
        public JArray Filetree { get; set; }
    }
}
