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
                List<string> nonPrintable = new List<string>(){
                    "Alt","Control","Shift","Enter","F1","F2","F3","F4","F5","F6","F7","F8","F9","F10","F11","F12","ArrowLeft","ArrowDown","ArrowRight",
                    "ArrowUp","Insert","Delete","Home","End","PageUp","PageDown"
                };
                if (nonPrintable.Contains(delimiter))
                {
                    delimiter = "";   
                }
                string serverModified = MatchToColor(word, delimiter);
                //the post is async, so the client doesn't know which word is actually processed. We form a pair containing the original word to "remind"
                Dictionary<string, string> responsePair=new Dictionary<string, string>();
                responsePair.Add("originalWord", word+delimiter);
                responsePair.Add("serverModified", serverModified);
                //sending response
                return Response.AsJson(responsePair, HttpStatusCode.OK);
            });
        }

        private string MatchToColor(string word, string delimiter)
        {
            string ret="";
            List<string> cKeywords = new List<string>() {
                "auto","break","case","char","const","continue","default","do","double","else","enum","extern","float","for","goto","if","int","long","register",
                "return","short","signed","sizeof","static","struct","switch","typedef","union","unsigned","void","volatile","while",
            };
            string wordColor="black", delimiterColor="black";
            
            //match the delimiter to see if it's part of the special chars or just a space, tab, etc
            var regex = @"[\[\].,\/#!$%\^&\*;:{}=\-_`~()<>]$";
            var match = Regex.Match(delimiter, regex);

            if (match.Success){
                delimiterColor = "green";
            }
            //match the word
            if (cKeywords.Contains(word.ToLower())){
                wordColor = "blue";
            }
            if ((word.Length>0) && (delimiter.Length>0))
            {
                ret= "<span style=\"color:" + wordColor + "\">" + word + "</span><span style=\"color:" + delimiterColor + "\">" + delimiter + "</span>";
            }
            if ((word.Length ==0) && (delimiter.Length > 0))
            {
                ret = "<span style=\"color:" + delimiterColor + "\">" + delimiter + "</span>";
            }
            if ((word.Length > 0) && (delimiter.Length == 0))
            {
                ret= "<span style=\"color:" + wordColor + "\">" + word + "</span>";
            }
            return ret;
        }

    }
}