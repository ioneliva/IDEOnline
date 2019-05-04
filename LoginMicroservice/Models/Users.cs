namespace LoginMicroservice.Models
{
    public partial class Users
    {
        public long Id { get; set; }
        public string Name { get; set; }
        public byte[] Password { get; set; }
        public byte[] Salt { get; set; }
        public byte[] Avatar { get; set; }
    }
}
