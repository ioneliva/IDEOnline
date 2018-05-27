using Nancy;
using System.Collections.Generic;
using Nancy.Extensions;
using Nancy.IO;
using System.Text.RegularExpressions;
using Newtonsoft.Json.Linq;

namespace DoUndoMicroservice.Modules
{
    public class DoUndoModule : NancyModule
    {
        public DoUndoModule()
        {
            Put("/", _ =>
            {
                //receiving post content
                JObject clientMessage = JObject.Parse(RequestStream.FromStream(Request.Body).AsString());



                string response = "";
                return Response.AsJson(response, HttpStatusCode.OK);
            });
            
        }
    }
}
