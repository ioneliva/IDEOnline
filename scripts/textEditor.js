var oldRange;
var newRange;

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

    //non-combination keys
    if (!c.match(/^[a-zA-Z0-9\_]+$/i) || isPositionalChar(c)) {
        if (isPositionalChar(c) && c != "Enter") {    //these keys make the cursor jump to another position, we need to analyze the word we jump from
            newRange = saveRange();
            restoreRange(oldRange);
        }

        var newLine = false;
    
        if (c == "Enter") {
            word = window.getSelection().anchorNode.previousSibling.lastChild.nodeValue;
            newLine = true;
        } else {
            word = window.getSelection().anchorNode.nodeValue;
        }

        sendData(word, newLine);
    } 
}

//send data under cursor position to server. Receive answer, modify state, send state to server for storage in undo stack
function sendData(data, newLine) {
        postRequest("POST", "http://localhost:5001/", { "word_and_delimiter": data }, function (response) {
            var output = document.getElementById("output");
            output.innerText = response;
            var wordColoringMS = JSON.parse(response);
            if (wordColoringMS.serverResponse != "100") {
                //decorate with color spans
                insertServerHtml(wordColoringMS.serverResponse, newLine);

                /*
                //restore old cursor position
                var sel = window.getSelection();
                sel.collapse(document.getElementById("inputTextWindow").firstChild.firstChild, 1);
                */

                //post the current state to undo/redo microservice
                var currentState = document.getElementById("inputTextWindow").innerHTML;
                postRequest("PUT", "http://localhost:5002/", { "state": currentState });
            }
        }, function (err) {
            // Word coloring microservice is down
        });
}