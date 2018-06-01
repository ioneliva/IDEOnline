using Nancy;
using System.Collections.Generic;
using Nancy.Extensions;
using Nancy.IO;
using System.Text.RegularExpressions;
using Newtonsoft.Json.Linq;

namespace WordColorMicroservice.Modules
{
    public class ColorModule : NancyModule
    {
        private static int id;

        public ColorModule()
        {
            Post("/", _ =>
            {
                JObject clientMessage = JObject.Parse(RequestStream.FromStream(Request.Body).AsString());
                string word = clientMessage["word"].ToString();
                string delimiter = clientMessage["delimiter"].ToString();

                string responseMessage = MatchToColor(word, delimiter);

                if (responseMessage.Length > 0)
                {
                    Dictionary<string, string> responsePair = new Dictionary<string, string>();
                    responsePair.Add("serverResponse", responseMessage);
                    return Response.AsJson(responsePair, HttpStatusCode.OK);
                }
                else
                {
                    return HttpStatusCode.Continue;                }
            });
        }

        private string MatchToColor(string word, string delimiter)
        {
            string ret="";

            string wordColor = Resources.Colors.BLACK;
            string delimiterColor = Resources.Colors.BLACK;

            //match the delimiter to see if it's part of the special chars or just a space, tab, etc
            if (Resources.Delimiters.NONPRINTABLE.Contains(delimiter))
            {
                delimiter = "";
            }
            var regex = Resources.Delimiters.PRINTABLE;
            var match = Regex.Match(delimiter, regex);

            if (match.Success){
                delimiterColor = Resources.Colors.GREEN;
            }

            //match the word
            if (Resources.KeyWords.C_LANGUAGE.Contains(word.ToLower())){
                wordColor = Resources.Colors.BLUE;
            }

            id++; //this unique id is assigned to each <span> block. Used to refer to each block individually if needed 

            if ((word.Length>0) && (delimiter.Length>0)){
                ret= "<span id=" + id + " style=\"color:" + wordColor + "\">" + word + "</span><span style=\"color:" + delimiterColor + "\">" + delimiter + "</span>";
            }
            if ((word.Length ==0) && (delimiter.Length > 0)){
                ret = "<span id=" + id + " style=\"color:" + delimiterColor + "\">" + delimiter + "</span>";
            }
            if ((word.Length > 0) && (delimiter.Length == 0)){
                ret= "<span id=" + id + " style=\"color:" + wordColor + "\">" + word + "</span>";
            }
            return ret;
        }

    }
}