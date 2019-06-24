using System.Collections.Generic;
using System.Text.RegularExpressions;
using ColoringRepairsMicroservice.Models;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;

namespace ColoringRepairsMicroservice.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class LargeTextController : Controller
    {
        // POST: /largeText/colorText
        [HttpPost("colorText")]
        public IActionResult ColorText([FromBody]RequestModel req)
        {
            //replace all newlines strings with a placeholder (for example "\r\n"->"§", "\n"->"§", etc)
            //the idea is to eliminate them and replace the lines with divs
            req.Text = req.Text.Replace("\r\n", "§").Replace("\n", "§").Replace("\r", "§");
            string coloredText = MatchToColor(req.Text, req.Language);

            Dictionary<string, string> responsePair = new Dictionary<string, string>
            {
                { "parsedText", coloredText }
            };

            return Ok(JsonConvert.SerializeObject(responsePair)); //200
        }

        //input: large raw string, output: colored, parsed string
        private string MatchToColor(string largeText, string lang)
        {
            var regex = Resources.Delimiters.PRINTABLE;
            string wordColor = Resources.Colors.BLACK,
                   delimiterColor = Resources.Colors.BLACK;
            List<string> dictionary;

            switch (lang.ToLower())
            {
                case "java":
                    dictionary = Resources.KeyWords.JAVA_LANGUAGE;
                    break;
                case "c#":
                    dictionary = Resources.KeyWords.CSHARP_LANGUAGE;
                    break;
                default:
                    dictionary = Resources.KeyWords.C_LANGUAGE;
                    break;
            }

            int id = 0;
            char delimiter;
            string word = "", line = "", ret = "";
            for (int i = 0; i < largeText.Length; i++)
            {
                //alphanumerc char
                if ((char.IsLetter(largeText[i]) || char.IsNumber(largeText[i])))
                {
                    word += largeText[i];
                    //test if we reached the end of the text
                    if (i == largeText.Length - 1)
                    {
                        if (dictionary.Contains(word))
                        {
                            wordColor = Resources.Colors.BLUE;
                        }
                        line += "<span id=" + id++ + " style=\"color:" + wordColor + "\">" + word + "</span>";
                        ret += "<div>"+line+"</div>";
                    }
                }
                else     //reached a delimiter
                {      
                    delimiter = largeText[i];
                    if (dictionary.Contains(word))
                    {
                        wordColor = Resources.Colors.BLUE;
                    }
                    if (word != "") //word is empty if the delimiter is first in the composite text
                    {
                        line += "<span id=" + id++ + " style=\"color:" + wordColor + "\">" + word + "</span>";
                        wordColor = Resources.Colors.BLACK;
                    }
                    //delimiter is new line symbol
                    if (largeText[i].ToString() == "§")
                    {
                        if (line.Length == 0)
                        {
                            ret+= "<div><br></div>";
                        }
                        else
                        {
                            ret += "<div>"+line+"</div>";
                            line = "";
                        }
                    }
                    //delimiter is normal
                    else
                    {
                        if (Regex.Match(delimiter.ToString(), regex).Success)
                        {
                            delimiterColor = Resources.Colors.GREEN;
                        }
                        line += "<span id=" + id++ + " style=\"color:" + delimiterColor + "\">" + delimiter + "</span>";
                        delimiterColor = Resources.Colors.BLACK;
                    }
                    word = "";
                }
            }

            return ret;
        }
    }
}
