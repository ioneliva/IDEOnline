using Nancy;
using System.Collections.Generic;
using Nancy.Extensions;
using Nancy.IO;
using System.Linq;
using System.Text.RegularExpressions;
using Newtonsoft.Json.Linq;

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
                JObject clientMessage = JObject.Parse(RequestStream.FromStream(Request.Body).AsString());
                string word = clientMessage["word"].ToString();
                string delimiter = clientMessage["delimiter"].ToString();

                //forming the proper html tags around the word for the client
                if (delimiter.Equals("\u0000")){//null is perfectly ok, means directional keys in this case
                    delimiter = "\\u0000"; //need to trick Json format to ignore it, otherwise it complains about invalid values on client page
                }
                string serverModified = MatchToColor(word, delimiter);
                //the post is async, so the client doesn't know which word it actually sent. We form a pair containing the original word to "remind"
                Dictionary<string, string> responsePair=new Dictionary<string, string>();
                responsePair.Add("originalWord", word+delimiter);
                responsePair.Add("serverModified", serverModified);
                //sending response
                return Response.AsJson(responsePair, HttpStatusCode.OK);
            });
        }

        private string MatchToColor(string word, string delimiter)
        {
            List<string> cKeywords = new List<string>() {
                "auto","break","case","char","const","continue","default","do","double","else","enum","extern","float","for","goto","if","int","long","register","return","short","signed","sizeof","static","struct","switch","typedef","union","unsigned","void","volatile","while",
            };
            string wordColor="black", delimiterColor="black";
            
            //match the delimiter to see if it's part of the special chars or just a space, tab, etc
            var regex = @"[\[\].,\/#!$%\^&\*;:{}=\-_`~()<>]$";
            var match = Regex.Match(delimiter, regex);

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