var word = "";
document.getElementById("inputTextWindow").addEventListener("keypress", inputKeyPress);

function inputKeyPress(e) {
    var c;

    //get the code for last key pressed. (unicode a=97, b=98, etc)
    if (window.event) { // IE                    
        c = e.keyCode;
    } else if (e.which) { // Netscape/Firefox/Opera                   
        c = e.which;
    }
    //convert character code to corresponding string from unicode, will be removed later in favor of unicode comparison TODO
    c = String.fromCharCode(c);

    var xhr = new XMLHttpRequest();//used for posting

    if (c.match(/[a-zA-Z0-9]+/)) { //problem here with backspace, word registeres chars that are deleted TODO treat the case backspace is used
        word += c; //build a word
    }
    else {
        //we have a delimiter read in c, post the word+delimiter. On server side we analize the delimiter as well    
            xhr.open("POST", "http://localhost:5001/", true); //third parameter set to true represents async communication
            xhr.setRequestHeader('Content-Type', 'application/json');
            var postJSON = JSON.stringify({ "word": word, "delimiter": c }); 
            xhr.send(postJSON);
            //console.log("sent post: " + postJSON);

        //get answer from server
        xhr.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) { // HTTP 200 OK
                var output = document.getElementById("output");
                output.innerText = this.responseText; 
                //get values as strings (server responds with a Json)
                var obj = JSON.parse(this.responseText);
                // console.log("received response: " + obj.serverModified);
                replace(obj.originalWord, obj.serverModified);
            }
            else {
                // server returned an error. Ignoring (for now)
            }
        };

        word = ""; //get ready for the next word
    }


}

//replace first parameter with second
function replace(search, replace) {
    var sel = window.getSelection();
    if (!sel.focusNode) {
        return;
    }
 
    var startIndex = sel.focusNode.nodeValue.indexOf(search);
    var endIndex = startIndex + search.length;
    if (startIndex === -1) {
        return;
    }
    //console.log("focus node: ", sel.focusNode.nodeValue);
    var range = document.createRange();
    //Set the range to contain search text
    range.setStart(sel.focusNode, startIndex);
    range.setEnd(sel.focusNode, endIndex);
    //Delete search text
    range.deleteContents();
    //Insert replace text
    var el = document.createElement("div"); //placeholder div, we pull the elements from it into the fragment
    el.innerHTML = replace;
    var fragment = document.createDocumentFragment(), node, lastNode;
    while (node = el.firstChild) {
        lastNode = fragment.appendChild(node);
    }
    var firstNode = fragment.firstChild;
    range.insertNode(fragment);
    if (lastNode) {
        range.setStartAfter(lastNode); //set cursor position
        range.collapse(true);  
        sel.removeAllRanges();
        sel.addRange(range);
    }

}
