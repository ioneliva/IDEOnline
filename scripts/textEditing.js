if (document.addEventListener) {                // For all major browsers, except IE<8
    document.getElementById("inputTextWindow").addEventListener("keyup", inputKeyPress);
} else if (document.attachEvent) {              // For IE<8
    document.getElementById("inputTextWindow").attachEvent("keyup", inputKeyPress);
} 

function inputKeyPress(e) {
    var c, word;
    var needToSend = false;

    c = readMyPressedKey(e);

    if (!c.match(/^[a-zA-Z0-9\_]+$/i) || isPositionalChar(c)) {
        needToSend = true;
    } 

    //keyboard shortcuts
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
    
    if (needToSend) {
        if (isPositionalChar(c) && c!="Enter") {    //these keys make the cursor jump to another position, we need to analyze the word we jump from
            restoreRange();
        }

        var newLine=false;
        //post the contents of the current focus node to word coloring microservice  
        if (c == "Enter") {
            word = window.getSelection().anchorNode.previousSibling.lastChild.nodeValue;
            newLine = true;
        } else {
            word = window.getSelection().anchorNode.nodeValue;
        }

        //console.log("posting word: "+ word);
        postRequest("POST", "http://localhost:5001/", { "word_and_delimiter": word }, function (response) {
            var output = document.getElementById("output");
            output.innerText = response; 
            var wordColoringMS = JSON.parse(response);
            if (wordColoringMS.serverResponse!="100") {
                //decorate with color spans
                insertServerHtml(wordColoringMS.serverResponse, newLine);

                //post the current state to undo/redo microservice
                var currentState = document.getElementById("inputTextWindow").innerHTML;
                postRequest("PUT", "http://localhost:5002/", { "state": currentState });
            }
        }, function (err) {
            // Word coloring microservice is down
            });
        word = ""; //get ready for the next word 
    }


}