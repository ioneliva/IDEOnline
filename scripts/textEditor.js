var oldNode;
var prevKey;

document.getElementById("inputTextWindow").addEventListener("keydown", keydown);
document.getElementById("inputTextWindow").addEventListener("keyup", keyUp);

//on key down
function keydown() {
    oldNode = window.getSelection().focusNode;  //used to remember source node when keys make the cursor jump on keyup
}

//on key up
function keyUp(e) {
    let c;

    c = readMyPressedKey(e);

    //keyboard combinations
    if (c === "z" && e.ctrlKey) { //undo
        postRequest("GET", "http://localhost:5002/undo", null, function (response) {
            document.getElementById("inputTextWindow").innerHTML = response;
        }, function (err) {
            // Do/Undo microservice is down
        });
    } else {
        if (c === "y" && e.ctrlKey) { //redo
            postRequest("GET", "http://localhost:5002/redo", null, function (response) {
                document.getElementById("inputTextWindow").innerHTML = response;
            }, function (err) {
                // Do/Undo microservice is down
            });
        }
    }

    //delimiter keys like (/*;backspace, etc.. or keys that trigger cursor movement like arrow keys or Home,End,PgUp, etc
	//also detect if user spams cursor movement keys repeatedly, we avoid sending requests to servers for every repetition
	if (!isAlphaNumeric(c) || isStructureModifying(c) || (isPositionalChar(c) && (!isPositionalChar(prevKey)))) {
		let cursorPosition = getCursorPosition("inputTextWindow");

		//send data to server
		if (oldNode.nodeValue) {
			let wordComposite = oldNode.nodeValue;
			//console.log("sending to server " + wordComposite);
			postRequest("POST", "http://localhost:5001/", { "word_and_delimiter": wordComposite }, function (response) {
				let output = document.getElementById("output");
				output.innerText = response;

				let wordColoringMS = JSON.parse(response);
				if (wordColoringMS.serverResponse != "100") {
					//decorate with color spans
					replaceNodeWithHTML(oldNode, wordColoringMS.serverResponse);
					//put cursor back at the correct position
					if (c != "Enter") {
						setCursorPosition(cursorPosition);
					}
					//post the current state to undo/redo microservice
					let currentState = document.getElementById("inputTextWindow").innerHTML;
					postRequest("PUT", "http://localhost:5002/", { "state": currentState });
				}
			}, function (err) {
				// Word coloring microservice is down
			});
		}
	}
    prevKey = c;
}