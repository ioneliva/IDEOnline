using Nancy;
using System.Collections.Generic;
using Nancy.Extensions;
using Nancy.IO;
using System.Text.RegularExpressions;
using Newtonsoft.Json.Linq;
using System;
using System.Text;

namespace WordColorMicroservice.Modules
{
    public class ColorModule : NancyModule
    {
        public ColorModule()
        {
            Post("/", _ =>
            {
                //receiving post content
                JObject clientMessage = JObject.Parse(RequestStream.FromStream(Request.Body).AsString());
                string unprocessedText = clientMessage["unprocessedText"].ToString();

                //forming the proper html tags around the words for the client
                string processedText = Process(unprocessedText);

                Dictionary<string, string> responsePair=new Dictionary<string, string>();
                responsePair.Add("processedText", processedText);
                //sending response
                return Response.AsJson(responsePair, HttpStatusCode.OK);
            });
        }

        private string Process(string text)
        {
            const string DELIMITERCOLOR = "green";
            const string KEYWORDCOLOR = "blue";
            string ret = "";
            List<string> cKeywords = new List<string>() {
                "auto","break","case","char","const","continue","default","do","double","else","enum","extern","float","for","goto","if","int","long","register",
                "return","short","signed","sizeof","static","struct","switch","typedef","union","unsigned","void","volatile","while",
            };
            List<char> delimiters = new List<char>(){
                '@', '\"', '\'', '\\', '[', ']', '.', ',', '/', '#', '!', '$', '%', '^', '&', '*', ';', ':', '{', '}', '=', '-', '+', '_', '`', '~', '(', ')', '<', '>'
            };
            List<string> nonPrintable = new List<string>(){
                    "Alt","Control","Shift","Enter","F1","F2","F3","F4","F5","F6","F7","F8","F9","F10","F11","F12","ArrowLeft","ArrowDown","ArrowRight",
                    "ArrowUp","Insert","Delete","Home","End","PageUp","PageDown"
            };

            StringBuilder sb = new StringBuilder(text);
            for (int i = 0; i < delimiters.Count; i++){
                sb.Replace(delimiters[i].ToString(), "<span style=\"color:" + DELIMITERCOLOR + "\">" + delimiters[i].ToString() + "</span>");
            }
            for (int i = 0; i < cKeywords.Count; i++)
            {
                sb.Replace(cKeywords[i], "<span style=\"color:" + KEYWORDCOLOR + "\">" + cKeywords[i] + "</span>");
            }
            ret = sb.ToString();

            return ret;
        }
    }
}