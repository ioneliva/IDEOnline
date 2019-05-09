using Nancy;
using Nancy.Extensions;
using Nancy.IO;
using Newtonsoft.Json.Linq;
using System.Collections;
using System.Collections.Generic;

namespace DoUndoMicroservice.Modules
{
    public class DoUndoModule : NancyModule
    {
        private static Stack<string> undoStack;
        private static Stack<string> redoStack;

        //static constructor needed to initialize static fields for the first time. Only invoked once at runtime.
        static DoUndoModule()
        {
            undoStack = new Stack<string>();
            redoStack = new Stack<string>();
        }

        //Nancy module normal work
        public DoUndoModule()
        {
            //undo request
            Get("/undo", _ =>
            {
                string previousState = "";
                if (undoStack.Count > 1)    //stack.peek() returns exception if there aren't any elements left, and stack.pop() can set it 0,so we test it
                {
                    redoStack.Push(undoStack.Pop());    //remove last state from undo stack, place it in redo stack
                    previousState = undoStack.Peek();
                }
                else
                {
                    if (undoStack.Count == 1)
                    {
                        redoStack.Push(undoStack.Peek());
                        undoStack.Pop();
                    }
                }
                Response response = Response.AsText(previousState, contentType: "text/plain", encoding: System.Text.Encoding.UTF8);
                response.StatusCode = HttpStatusCode.OK; //200

                return response;
            });

            //redo request
            Get("/redo", _ =>
            {
                string nextState = "";
                if (redoStack.Count > 0)    //no problems here, peek() is before pop(), will never try to peek at 0 elements
                {
                    nextState = redoStack.Peek();
                    undoStack.Push(redoStack.Pop());    //remove the last state from redo, place in undo

                } else          //user pressed redo when there was nothing left to redo
                {
                    return HttpStatusCode.NotAcceptable;
                }
                Response response = Response.AsText(nextState, contentType: "text/plain", encoding: System.Text.Encoding.UTF8);
                response.StatusCode = HttpStatusCode.OK;

                return response;
            });

            //request to add a new state to the stack
            Put("/", _ =>
            {
                JObject clientMessage = JObject.Parse(RequestStream.FromStream(Request.Body).AsString());

                //request asking for server statistics
                Dictionary<string, string> responsePair = new Dictionary<string, string>();
                if (clientMessage["statusRequest"] != null)
                {
                    responsePair.Add("serverStart", GlobalStatistics.getServerStartTime().ToString());
                    return Response.AsJson(responsePair, HttpStatusCode.OK);
                }

                //normal put request
                string state = clientMessage["state"].ToString();
                undoStack.Push(state);
                return HttpStatusCode.Accepted; //202
            });
        }
    }
}
