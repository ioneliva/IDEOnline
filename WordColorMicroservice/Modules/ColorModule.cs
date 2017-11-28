using Nancy;
using System.Collections.Generic;
using Nancy.Extensions;
using Nancy.IO;
using System.Linq;
using System.Text.RegularExpressions;

namespace WordColorMicroservice.Modules
{ 
    public class ColorModule : NancyModule
    {
        public ColorModule()
        {
            Get("/", _ => Response.AsFile("just a placeholder, maybe later I'll implemet sending the dictionaries to the client on request")
            );

            Post("/", _ =>
            {
                
                //receiving post content
                /*
                var body = this.Request.Body; //this is the actual post content (as Json)
                int length = (int)body.Length;
                byte[] data = new byte[length];
                body.Read(data, 0, length);
                string clientWord = Encoding.Default.GetString(data); //this is it as string
                */
                string clientWord = RequestStream.FromStream(Request.Body).AsString();  //same as above, but using Nancy library



                //forming the proper html tags around the word for the client
                string serverModified = MatchToColor(clientWord);
                //the post is async, so the client doesn't know which word it actually sent. We form a pair containing the original word to "remind"
                Dictionary<string, string> responsePair=new Dictionary<string, string>();
                responsePair.Add("originalWord", clientWord);
                responsePair.Add("serverModified", serverModified);
                //sending response
                return Response.AsJson(responsePair, HttpStatusCode.OK);
            });
        }

        private string MatchToColor(string wordAndSeparator)
        {
            List<string> cKeywords = new List<string>() {
                "auto","break","case","char","const","continue","default","do","double","else","enum","extern","float","for","goto","if","int","long","register","return","short","signed","sizeof","static","struct","switch","typedef","union","unsigned","void","volatile","while",
            };
            string wordColor="black", delimiterColor="black";
            
            //separate the word from delimiter
            char delimiter = wordAndSeparator[wordAndSeparator.Length - 1];
            string word = wordAndSeparator.Substring(0, wordAndSeparator.Length - 1);

            //match the delimiter to see if it's part of the special chars or just a space, tab, etc
            var regex = @"[\[\].,\/#!$%\^&\*;:{}=\-_`~()<>]$";
            var match = Regex.Match(delimiter.ToString(), regex);

            if (match.Success){
                delimiterColor = "green";
            }

            if (cKeywords.Contains(word.ToLower())){
                wordColor = "blue";
            }
            return "<span style=\"color:"+ wordColor + "\">" + word + "</span><span style=\"color:"+ delimiterColor + "\">" + delimiter + "</span>";
        }


    }
}