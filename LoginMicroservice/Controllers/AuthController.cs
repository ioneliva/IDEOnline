using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;

namespace LoginMicroservice.Controllers
{
    [Route("[controller]")]
    public class AuthController : Controller
    {
        [HttpGet]
        public IActionResult Get(string name, string pswd)
        {
            if (name == "aaa" && pswd == "123") //hard coded for now
            {
                Claim[] claims = new Claim[]
                {
                    new Claim(JwtRegisteredClaimNames.Sub, name),                       //Subject Identifier
                    new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),  //The "jti" (JWT ID) claim provides a unique identifier for the JWT
                    new Claim(JwtRegisteredClaimNames.Iat, DateTime.UtcNow.ToUniversalTime().ToString(), ClaimValueTypes.Integer64)     //Time at which the JWT was issued
                };

                //todo: move the secret key out of here, into a secure location. Make a generator for unique crypto keys
                string secret = "Y2F0Y2hlciUyMHdvbmclMjBsb3ZlJTIwLm5ldA==";
                SymmetricSecurityKey signingKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(secret));
                JwtSecurityToken jwt = new JwtSecurityToken(
                    issuer: "http://localhost:5200",
                    audience: "Editor Registered Client",
                    claims: claims,
                    notBefore: DateTime.UtcNow,
                    expires: DateTime.UtcNow.Add(TimeSpan.FromMinutes(5)),
                    signingCredentials: new SigningCredentials(signingKey, SecurityAlgorithms.HmacSha256)
                );
                string encodedJwt = new JwtSecurityTokenHandler().WriteToken(jwt);
                var responseJson = new
                {
                    access_token = encodedJwt,
                    expires_in = (int)TimeSpan.FromMinutes(5).TotalSeconds
                };

                return Json(responseJson);
            }
            else
            {
                return Json("wrong user or passwd");
            }
        }
    }
}