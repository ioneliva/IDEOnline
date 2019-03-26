var prevKey;

document.getElementById("inputTextWindow").addEventListener("keyup", keyUp);

//warm up function for xhr-XMLHttpRequest to server. First request took too long to execute, this solves it.
window.addEventListener('load', function () {
	postRequest("POST", "http://localhost:5001/", {
		"word_and_delimiter": "", "position": "",
		"enterPressed": "", "preWord": "", "preWordPos": "", "token": ""
	}, function (response) { }
	)});

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
	if (!isAlphaNumeric(c) || isPositionModifying(c) || (isArrowKey(c) && (!isArrowKey(prevKey)))) {
		let cursorPosition = getCursorPosition("inputTextWindow");
		let wordComposite, token;

		let enterPressed = false, preWord, preWordPos;
		if (c == "Enter") {
			enterPressed = true;
			preWordPos = cursorPosition - 1;
			preWord = selectNodesAround(preWordPos).toString();
		}
		wordComposite = selectNodesAround(cursorPosition).toString();
		token = getToken(cursorPosition);
		//send data to server
		postRequest("POST", "http://localhost:5001/", {
			"word_and_delimiter": wordComposite, "position": cursorPosition,
			"enterPressed": enterPressed, "preWord": preWord, "preWordPos": preWordPos, "token": token
		}, function (response) {
			let output = document.getElementById("output");
			output.innerText = response;
			//parse response from Json
			let wordColoringMS = JSON.parse(response);
			//decorate with color spans, if server did not lag. TODO: implement a recovery method for lag?
			if (!serverLagged(getToken(cursorPosition), wordColoringMS.serverToken)) {
				if (wordColoringMS.coloredWord.length > 0) {
					insertServerHtmlAtPos(wordColoringMS.position, wordColoringMS.coloredWord);
				}
				if (c == "Enter" && wordColoringMS.coloredPreWord.length > 0) {
					insertServerHtmlAtPos(wordColoringMS.coloredPreWordPosition, wordColoringMS.coloredPreWord);
				}
				//set cursor
				if (isSpecialChar(c)) {	//Home, End, PageUp, PageDown
					setCursorPosition(c);
				} else {
					setCursorPosition(parseInt(wordColoringMS.position));
				}
			}
			//post the current state to undo/redo microservice
			let currentState = document.getElementById("inputTextWindow").innerHTML;
			postRequest("PUT", "http://localhost:5002/", { "state": currentState, "position": getCursorPosition("inputTextWindow")});
		}, function (err) {
			// Word coloring microservice is down
		});

	}
    prevKey = c;
}