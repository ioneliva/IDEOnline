using System;
using System.Security.Cryptography;
using System.Text;

namespace LoginMicroservice.Controllers
{
    public class CryptoUtility
    {
        //generate new salt for hashing
        private string GenerateSalt(int saltSize)
        {
            RNGCryptoServiceProvider rng = new RNGCryptoServiceProvider();
            byte[] buff = new byte[saltSize];
            //generate random sequence of bytes for the array above
            rng.GetBytes(buff);

            return Convert.ToBase64String(buff);
        }

        //generate new hash for given string and salt
        private string GenerateHash(string passwd, string salt)
        {
            //concat salt and password and transform into byte representation
            byte[] saltAndPasswd = Encoding.UTF8.GetBytes(passwd + salt);
            //sha256 is not the best algorithm because it is fast and can be brute forced in a short time, but it will do
            SHA256Managed sha256Manager = new SHA256Managed();
            byte[] hashedPasswd = sha256Manager.ComputeHash(saltAndPasswd);
            return Convert.ToBase64String(hashedPasswd);
        }

        //compare plain text password with the stored hashed value 
        private bool ComparePasswd(string plainPasswd, string hashedPasswd, string salt)
        {
            bool ret = false;

            string hashFromPlainPasswd = GenerateHash(plainPasswd, salt);
            if (hashFromPlainPasswd.Equals(hashedPasswd))
            {
                ret = true;
            }
            return ret;
        }
    }
}
