var oldNode;
var prevKey;

if (document.addEventListener) {                // For all major browsers, except IE<8
    document.getElementById("inputTextWindow").addEventListener("keydown", keydown);
    document.getElementById("inputTextWindow").addEventListener("keyup", keyUp);
} else if (document.attachEvent) {              // For IE<8
    document.getElementById("inputTextWindow").attachEvent("keydown", keydown);
    document.getElementById("inputTextWindow").attachEvent("keyup", keyUp);
} 

//on key down
function keydown(e) {
    //save current node (this is the node before the key was released, used for keys that make the cursor jump to another place)
    oldNode = window.getSelection().focusNode;

    var c = readMyPressedKey(e);
    //overwrite some default browser actions
    if (c == "PageUp") {
        e.preventDefault();
        setCursorPosition(0);
    }
    if (c == "PageDown") {
        e.preventDefault();
        var lines = 0;
        //basically we want the number of chars to the end + number of lines except the first one (same algorithm as in utilities -create range for setCursorPosition)
        for (var i = 0; i < document.getElementById("inputTextWindow").childNodes.length; i++) {
            lines++;
        }
        setCursorPosition(document.getElementById("inputTextWindow").textContent.length + lines-1);
    }
    //note to self -discovered a strange inconsistency/bug. When pressing tab sometimes the tab space is smaller than it should be, despite the html behind containing a proper tab tag
    //this has nothing to do with my code, as far as I can tell, it's a strange browser or css behaviour
    if (c == "Tab") {
        e.preventDefault();
        var globalCursorPoz = getCursorPosition("inputTextWindow");
        var cursoPozInsideElement = window.getSelection().focusOffset;
        var end = oldNode.textContent.length;
        preText = oldNode.textContent.substring(0, cursoPozInsideElement);
        postText = oldNode.textContent.substring(cursoPozInsideElement, end);
        oldNode.textContent = preText + "\t" + postText;
        setCursorPosition(globalCursorPoz+1);
    }
    if (c == "F5") {
        e.preventDefault();
    }
}

//on key up
function keyUp(e) {
    var c, wordComposite;

    c = readMyPressedKey(e);

    //keyboard combinations
    if (c == "z" && e.ctrlKey) { //undo
        postRequest("GET", "http://localhost:5002/undo", null, function (response) {
            document.getElementById("inputTextWindow").innerHTML = response;
        }, function (err) {
            // Do/Undo microservice is down
        });
    } else {
        if (c == "y" && e.ctrlKey) { //redo
            postRequest("GET", "http://localhost:5002/redo", null, function (response) {
                document.getElementById("inputTextWindow").innerHTML = response;
            }, function (err) {
                // Do/Undo microservice is down
            });
        }
    }

    //delimiter keys like (/*;backspace, etc.. or keys that trigger cursor movement like arrow keys or Home,End,PgUp, etc
    //also detect if user pressed cursor movement keys repeatedly, we avoid sending requests to servers for every repetition
    if (!c.match(/^[a-zA-Z0-9\_]+$/i) || (isPositionalChar(c) && (prevKey != c))) {
        var cursorPosition = getCursorPosition("inputTextWindow");
        wordComposite = oldNode.nodeValue;

        //send data to server
        postRequest("POST", "http://localhost:5001/", { "word_and_delimiter": wordComposite }, function (response) {
            var output = document.getElementById("output");
            output.innerText = response;

            var wordColoringMS = JSON.parse(response);
            if (wordColoringMS.serverResponse != "100") {
                //decorate with color spans
                replaceNodeWithHTML(oldNode, wordColoringMS.serverResponse);
                //put cursor back at the correct position
                if (c != "Enter") {
                    setCursorPosition(cursorPosition);
                }
                //post the current state to undo/redo microservice
                var currentState = document.getElementById("inputTextWindow").innerHTML;
                postRequest("PUT", "http://localhost:5002/", { "state": currentState });
            }
        }, function (err) {
            // Word coloring microservice is down
        });

    }
    prevKey = c;
}