using Nancy;
using System.Collections.Generic;
using Nancy.Extensions;
using Nancy.IO;
using System.Text.RegularExpressions;
using Newtonsoft.Json.Linq;
using System;

namespace WordColorMicroservice.Modules
{
    public class ColorModule : NancyModule
    {
        private static int id; //this unique id is assigned to each <span> block. Used to refer to each block individually if needed 

        public ColorModule()
        {
            Post("/", _ =>
            {
                string plainWord, plainWordPosition, plainPreWord, plainPreWordPosition, coloredWord, coloredPreWord;
                bool enterPressedOnClient = false, preWordEmpty=false, postWordEmpty=false;
                Dictionary<string, string> responsePair = new Dictionary<string, string>();

                JObject clientMessage = JObject.Parse(RequestStream.FromStream(Request.Body).AsString());
                //normal key press values
                plainWord = clientMessage["word_and_delimiter"].ToString();
                plainWordPosition = clientMessage["position"].ToString();
                if (plainWord.Length>0) {
                    coloredWord = MatchToColor(plainWord);
                    responsePair.Add("coloredWord", coloredWord);
                    responsePair.Add("position", plainWordPosition);
                }
                else{
                    postWordEmpty = true;
                    responsePair.Add("coloredWord", "");
                    responsePair.Add("position", plainWordPosition);
                }

                //enter pressed extra values
                enterPressedOnClient = clientMessage.SelectToken("enterPressed").Value<bool>();
                if (enterPressedOnClient)
                {
                    plainPreWord = clientMessage["preWord"].ToString();
                    plainPreWordPosition = clientMessage["preWordPos"].ToString();
                    if (plainPreWord.Length > 0){
                        coloredPreWord = MatchToColor(plainPreWord);
                        responsePair.Add("coloredPreWord", coloredPreWord);
                        responsePair.Add("coloredPreWordPosition", plainPreWordPosition);
                    }
                    else
                    {
                        preWordEmpty = true;
                        responsePair.Add("coloredPreWord", "");
                        responsePair.Add("coloredPreWordPosition", plainPreWordPosition);
                    }
                }
                
                if (preWordEmpty && postWordEmpty){
                    return HttpStatusCode.Continue;
                }
                else{
                    return Response.AsJson(responsePair, HttpStatusCode.OK);
                }
            });
        }

        private string MatchToColor(string compositeWord)
        {
            string word="", ret = "";
            char delimiter;
            var regex = Resources.Delimiters.PRINTABLE;
            string wordColor = Resources.Colors.BLACK,
                   delimiterColor = Resources.Colors.BLACK;

            //split de composite word into word+delimiter, construct the span <word><delimiter> structure
            for (int i = 0; i < compositeWord.Length; i++)
            {
                if ((char.IsLetter(compositeWord[i]) || (char.IsNumber(compositeWord[i])))) //alphanumerc char
                {
                    word += compositeWord[i];
                    //the last symbol of the composite word is not a delimiter(that means we encountered the delimiter in the middle of the composite word, or not at all)
                    // we need to trigger the coloring
                    if (i==compositeWord.Length-1) 
                    {
                        if (Resources.KeyWords.C_LANGUAGE.Contains(word.ToLower()))
                        {
                            wordColor = Resources.Colors.BLUE;
                        }
                        ret += "<span id=" + (id++) + " style=\"color:" + wordColor + "\">" + word + "</span>";
                        wordColor = Resources.Colors.BLACK;
                    }
                }
                else{       //reached a delimiter
                    //adding the word(up to the encountered delimiter) to the span structure
                    if (Resources.KeyWords.C_LANGUAGE.Contains(word.ToLower()))
                    {
                        wordColor = Resources.Colors.BLUE;
                    }
                    if (word != "") //word is empty if the delimiter is first in the composite word
                    {
                        ret += "<span id=" + (id++) + " style=\"color:" + wordColor + "\">" + word + "</span>";
                        wordColor = Resources.Colors.BLACK;
                    }
                    //adding the delimiter to the span structure
                    delimiter = compositeWord[i];
                    if (Regex.Match(delimiter.ToString(), regex).Success)
                    {
                        delimiterColor = Resources.Colors.GREEN;
                    }
                    ret += "<span id=" + (id++) + " style=\"color:" + delimiterColor + "\">" + delimiter + "</span>";
                    delimiterColor = Resources.Colors.BLACK;

                    //getting ready for the next word from the composite
                    word = "";
                }
            } 

            return ret;
        }

    }
}