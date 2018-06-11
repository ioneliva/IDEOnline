var oldRange;
var newRange;
var cursorPosition;

if (document.addEventListener) {                // For all major browsers, except IE<8
    document.getElementById("inputTextWindow").addEventListener("keydown", saveOldRange);
    document.getElementById("inputTextWindow").addEventListener("keyup", handleKeyboard);
} else if (document.attachEvent) {              // For IE<8
    document.getElementById("inputTextWindow").attachEvent("keydown", saveOldRange);
    document.getElementById("inputTextWindow").attachEvent("keyup", handleKeyboard);
} 

//on key down
function saveOldRange() {
    oldRange = saveRange();
}

//on key up
function handleKeyboard(e) {
    var c, word;

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

    //delimiter keys like (/*; etc.. or keys that trigger cursor movement like arrow keys or Home
    if (!c.match(/^[a-zA-Z0-9\_]+$/i) || isPositionalChar(c)) {
        if (isPositionalChar(c)) {
            newRange = saveRange();
            switch (c) {
                case "Enter": {
                    restoreRange(oldRange);
                    console.log(oldRange.toString());
                }
                    break;
                case "Home": {
                    
                }
                    break;
                case "End": {
                    
                }
                    break;
            }
        }
        cursorPosition = getCursorPosition("inputTextWindow");
        word = window.getSelection().focusNode.nodeValue;
        console.log("cursor at " + cursorPosition);
        console.log("sending word "+word);
        sendData(word);
    }
}

//send data under cursor position to server. Receive answer, modify state, send state to server for storage in undo stack
function sendData(data) {
        postRequest("POST", "http://localhost:5001/", { "word_and_delimiter": data }, function (response) {
            var output = document.getElementById("output");
            output.innerText = response;
            var wordColoringMS = JSON.parse(response);
            if (wordColoringMS.serverResponse != "100") {
                //decorate with color spans
                insertServerHtml(wordColoringMS.serverResponse);

                //put cursor back at it's correct position
                setCurrentCursorPosition(cursorPosition);

                //post the current state to undo/redo microservice
                var currentState = document.getElementById("inputTextWindow").innerHTML;
                postRequest("PUT", "http://localhost:5002/", { "state": currentState });
            }
        }, function (err) {
            // Word coloring microservice is down
        });
}