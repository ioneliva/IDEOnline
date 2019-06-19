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
            string word = "", ret = "";
            char delimiter;
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

            //split the text into words+delimiters, construct the spans <word><delimiter>
            int id = 0;
            for (int i = 0; i < largeText.Length; i++)
            {
                if ((char.IsLetter(largeText[i]) || (char.IsNumber(largeText[i])))) //alphanumerc char
                {
                    word += largeText[i];
                    //test if we reached the end of the text without encountering a delimiter
                    if (i == largeText.Length - 1)
                    {
                        if (dictionary.Contains(word))
                        {
                            wordColor = Resources.Colors.BLUE;
                        }
                        ret += "<span id=" + id++ + " style=\"color:" + wordColor + "\">" + word + "</span>";
                        wordColor = Resources.Colors.BLACK;
                    }
                }
                else
                {       //reached a delimiter
                    //adding the word(up to the encountered delimiter) to the span structure
                    if (dictionary.Contains(word))
                    {
                        wordColor = Resources.Colors.BLUE;
                    }
                    if (word != "") //word is empty if the delimiter is first in the composite text
                    {
                        ret += "<span id=" + id++ + " style=\"color:" + wordColor + "\">" + word + "</span>";
                        wordColor = Resources.Colors.BLACK;
                    }
                    //adding the delimiter to the span structure
                    delimiter = largeText[i];
                    if (Regex.Match(delimiter.ToString(), regex).Success)
                    {
                        delimiterColor = Resources.Colors.GREEN;
                    }
                    ret += "<span id=" + id++ + " style=\"color:" + delimiterColor + "\">" + delimiter + "</span>";
                    delimiterColor = Resources.Colors.BLACK;

                    //getting ready for the next word from the composite text
                    word = "";
                }
            }

            return ret;
        }
    }
}
