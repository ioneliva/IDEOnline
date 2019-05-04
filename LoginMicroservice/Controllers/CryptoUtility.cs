using System;
using System.Security.Cryptography;
using System.Text;

namespace LoginMicroservice.Controllers
{
    public class CryptoUtility
    {
        //generate new salt for hashing
        public byte[] GenerateSalt(int saltSize)
        {
            RNGCryptoServiceProvider rng = new RNGCryptoServiceProvider();
            byte[] buff = new byte[saltSize];
            //generate random sequence of bytes for the array above
            rng.GetBytes(buff);

            return buff;
        }

        //generate new hash for given string and salt
        public byte[] GenerateHash(string passwd, byte[] salt)
        {
            //concat salt and password and transform into byte representation
            byte[] saltAndPasswd = Encoding.UTF8.GetBytes(passwd + Convert.ToBase64String(salt));
            //sha256 is not the best algorithm because it is fast and can be brute forced in a short time, but it will do
            SHA256Managed sha256Manager = new SHA256Managed();
            byte[] hashedPasswd = sha256Manager.ComputeHash(saltAndPasswd);
            return hashedPasswd;
        }

        //compare plain text password with the stored hashed value 
        public bool ComparePasswd(string plainPasswd, byte[] hashedPasswd, byte[] salt)
        {
            bool ret=true;

            byte[] hashFromPlainPasswd = GenerateHash(plainPasswd, salt);
            //compare new hashed passwd to hashed passwd stored in the database (byte by byte, equals operator doesn't work here)
            if (hashFromPlainPasswd.Length != hashedPasswd.Length)
            {
                ret=false;
            }
            else
            {
                for (int i = 0; i < hashFromPlainPasswd.Length; i++)
                {
                    if (hashFromPlainPasswd[i] != hashedPasswd[i])
                    {
                        ret=false;
                    }
                }
            }

            return ret;
        }
    }
}
