using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Nancy;
using System.Text;
using Nancy.ModelBinding;
using Nancy.Extensions;



namespace WordColorMicroservice.Modules
{
    public class ColorModule:NancyModule
    {
        public ColorModule()
        {
            Get("/", _ => Response.AsFile("Content/clientPage.html", "text/html")
            );

            //simple post request handle. returning the post request body, just for testing. For now
            Post("/", _ =>
            {
                var body = this.Request.Body; //this is the actual post content
                int length = (int)body.Length; // this is a dynamic variable, needs cast every time
                byte[] data = new byte[length];
                body.Read(data, 0, length);
                string postBoddy = System.Text.Encoding.Default.GetString(data);
                return "<span style=\"color: green\">" + postBoddy + "</span>";
            });
        }
    }
}

