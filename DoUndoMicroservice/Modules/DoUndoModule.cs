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
            Put("/", _ =>
            {
                JObject clientMessage = JObject.Parse(RequestStream.FromStream(Request.Body).AsString());
                string state = clientMessage["state"].ToString();
                undoStack.Push(state);
                return HttpStatusCode.Accepted; //202
            });


            Post("/", _ =>
            {
                Response response=(Response)"Unrecognized message";
                response.StatusCode = HttpStatusCode.BadRequest;
                //get post from client
                string clientMessage = RequestStream.FromStream(Request.Body).AsString();

                //undo
                if (clientMessage.Equals("UNDO")) 
                {
                    string previousState="";
                    if (undoStack.Count >1) //stack.peek() returns exception if there aren't any elements left, and stack.pop() can set it 0
                    {
                        redoStack.Push(undoStack.Pop()); //remove last state from undo stack, place it in redo stack
                        previousState = undoStack.Peek();
                    }else
                    {
                        if (undoStack.Count == 1)
                        {
                            redoStack.Push(undoStack.Peek());
                        }
                    }
                    response = Response.AsText(previousState, contentType: "text/plain", encoding: System.Text.Encoding.UTF8);
                    response.StatusCode = HttpStatusCode.OK; //200
                }

                //redo
                if (clientMessage.Equals("REDO") && redoStack.Count>0) //no problems here, peek() is before pop(), will never try to peek at 0 elements
                {
                    string nextState = "";
                    nextState = redoStack.Peek();
                    undoStack.Push(redoStack.Pop());//remove the last state from redo, place in undo
                    response = Response.AsText(nextState, contentType: "text/plain", encoding: System.Text.Encoding.UTF8);
                    response.StatusCode = HttpStatusCode.OK;
                }

                //send result back to client
                return response;
            });

        }

    }
}
