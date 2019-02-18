var oldNode;
var prevKey;

if (document.addEventListener) {                // For all major browsers, except IE<8
    document.getElementById("inputTextWindow").addEventListener("keydown", saveOldNode);
    document.getElementById("inputTextWindow").addEventListener("keyup", handleKeyboard);
} else if (document.attachEvent) {              // For IE<8
    document.getElementById("inputTextWindow").attachEvent("keydown", saveOldNode);
    document.getElementById("inputTextWindow").attachEvent("keyup", handleKeyboard);
} 

//on key down
function saveOldNode() {
    oldNode = window.getSelection().focusNode;
}

//on key up
function handleKeyboard(e) {
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