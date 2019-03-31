document.getElementById("inputTextWindow").addEventListener("keydown", triggerOnDownCombos);
document.getElementById("inputTextWindow").addEventListener("cut", handleCut);
document.getElementById("inputTextWindow").addEventListener("paste", handlePaste);

function triggerOnDownCombos(e) {
	let c = readMyPressedKey(e);

	//undo
	if (c === "z" && e.ctrlKey) {
		handleUndo();
	}
	 //redo
	if (c === "y" && e.ctrlKey) {
		handleRedo();
	}
	//save
	if (c === "s" && e.ctrlKey) {
		//todo
	}
}

function handleUndo() {
	sendRequest("GET", "http://localhost:5002/undo", null, function (response) {
		document.getElementById("inputTextWindow").innerHTML = response;
	}, function (err) {
		// Do/Undo microservice is down
	});
}

function handleRedo() {
	sendRequest("GET", "http://localhost:5002/redo", null, function (response) {
		document.getElementById("inputTextWindow").innerHTML = response;
	}, function (err) {
		// Do/Undo microservice is down
	});
}

function handleCut() {
	let sel = window.getSelection(),
		node, text = "";
	console.log("doing cut");

	 //if no user selection, no point in doing anything, selection made is a single point
	if (sel.isCollapsed /*|| Word coloring MS is down*/) {
		return;
	}

	let cursorPosition = getCursorPosition("inputTextWindow");
	if (invertedSelection(sel)) {
		text = sel.focusNode.textContent.slice(0, sel.focusOffset) + sel.anchorNode.textContent.slice(sel.anchorOffset, sel.anchorNode.textContent.length);
		node = document.createTextNode(text);
		sel.focusNode.parentNode.insertBefore(node, sel.focusNode);
		sel.focusNode.parentNode.removeChild(sel.focusNode);
		sel.anchorNode.parentNode.removeChild(sel.anchorNode);
		// in case of inverted selection, we need to set setting cursor
		setCursorPosition(cursorPosition);
	} else {
		text = sel.anchorNode.textContent.slice(0, sel.anchorOffset) + sel.focusNode.textContent.slice(sel.focusOffset, sel.focusNode.textContent.length);
		node = document.createTextNode(text);
		sel.focusNode.parentNode.insertBefore(node, sel.focusNode.nextSibling);
		sel.focusNode.parentNode.removeChild(sel.focusNode);
		sel.anchorNode.parentNode.removeChild(sel.anchorNode);
	}
	//problem? after the replace, the resulting node is not colored

	//todo: update the line numbering. Figure a function to recalculate everything
}

//if a range has its' end set before the start (like an inverted selection), it will collapse itself. Clever ideea from Tim Dawn on Stackoverflow
function invertedSelection(sel) {
	let	range = document.createRange(),
		inverted = false;
		
		if (!sel.isCollapsed) {		
			range.setStart(sel.anchorNode, sel.anchorOffset);
			range.setEnd(sel.focusNode, sel.focusOffset);
			inverted = range.collapsed;
			range.detach();
		}
	return inverted;
}

function handlePaste() {
//not implemented yet
}