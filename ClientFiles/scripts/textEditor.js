var apiGateway = "http://localhost:5100";
var prevKey;

getEditor().addEventListener("keyup", keyUp);
//warm up function for xhr-XMLHttpRequest to server. First request took too long to execute, this solves it.
window.addEventListener('load', function () {
	sendRequest("POST", apiGateway+"/coloring", {
		"word_and_delimiter": "", "position": "",
		"enterPressed": "", "preWord": "", "preWordPos": "", "token": ""
	}, function (response) { }
	)});

//on key up
function keyUp(e) {
	let editor = getEditor(),
		c = readMyPressedKey(e);

	//delimiter keys like (/*;backspace, etc.. or keys that trigger cursor movement like arrow keys or Home,End,PgUp, etc
	//also detect if user spams cursor movement keys repeatedly, we avoid sending requests to servers for every repetition
	if (!isAlphaNumeric(c) || isPositionModifying(c) || (isArrowKey(c) && (!isArrowKey(prevKey)))) {
		let cursorPosition = getCursorPosition(editor.id);
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
		sendRequest("POST", apiGateway + "/coloring", {
			"word_and_delimiter": wordComposite, "position": cursorPosition,
			"enterPressed": enterPressed, "preWord": preWord, "preWordPos": preWordPos, "token": token
		}, function (response) {
			//parse response from Json
			let wordColoringMS = JSON.parse(response);
			//decorate with color spans, if server did not lag
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
			let currentState = editor.innerHTML;
			sendRequest("PUT", apiGateway + "/doUndo", { "state": currentState, "position": getCursorPosition(editor.id) });
		}, function (err) {
			// Word coloring microservice is down
			console.log("Word coloring error:" + err);
		});

	}
    prevKey = c;
}