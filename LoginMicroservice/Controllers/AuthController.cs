﻿using System;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using LoginMicroservice.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;

namespace LoginMicroservice.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class AuthController : Controller
    {
        private readonly LoginContext _context;

        public AuthController(LoginContext context)
        {
            _context = context;
        }

        [HttpPost]
        //obtain token for username and password
        //for local testing: POST request to http://localhost:5200/auth , in body params ex: {"name":"aaa", "password":"123"}
        //access token obtained can be tested at jwt.io
        public IActionResult SetJWTForUser([FromBody]RequestModel request)
        {
            //check if user exists in the database
            CryptoUtility util = new CryptoUtility();
            Users existingUser = _context.Users.Where(u => u.Name == request.Name).SingleOrDefault();
            if(existingUser != null)
            {
                //get salt from database for request user name
                byte[] dbSalt = existingUser.Salt;
                //compare provided password from request body to password in the database
                if(util.ComparePasswd(request.Password, existingUser.Password, dbSalt))
                {
                    //success, user and password match
                    Claim[] claims = new Claim[]
{
                    new Claim(JwtRegisteredClaimNames.Sub, request.Name),                       //Subject Identifier
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
                        expires: DateTime.UtcNow.Add(TimeSpan.FromMinutes(120)),    //2 hours to expire
                        signingCredentials: new SigningCredentials(signingKey, SecurityAlgorithms.HmacSha256)
                    );
                    string encodedJwt = new JwtSecurityTokenHandler().WriteToken(jwt);
                    var responseJson = new
                    {
                        access_token = encodedJwt,
                        expires_in = (int)TimeSpan.FromMinutes(5).TotalSeconds,
                        userAvatar = existingUser.Avatar //avatar picture is sent as byte array, we'll convert in client
                    };

                    return Json(responseJson);
                }else //provided password doesn't match the one in the database
                {
                    return Unauthorized(); //401
                }
            }
            else //provided user name does not exist in database
            {
                return NotFound();  //404
            }
        }
    }
}