namespace LoginMicroservice.Models
{
    // poco classes representing a request body. Used for model binding in requests
    public class RequestModel
    {
        public string Name { get; set; }
        public string Password { get; set; }
        public string Avatar { get; set; }
    }
    public class NameChangeRequestModel
    {
        public string NewName { get; set; }
    }
    public class PasswordChangeRequestModel
    {
        public string NewPassword { get; set; }
    }
    public class AvatarChangeRequestModel
    {
        public string NewAvatar { get; set; }
    }
}
