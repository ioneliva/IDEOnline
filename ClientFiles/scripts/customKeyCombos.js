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
	sendRequest("GET", apiGateway+"/doUndo/undo", null, function (response) {
		document.getElementById("inputTextWindow").innerHTML = response;
	}, function (err) {
		// Do/Undo microservice is down
	});
}

function handleRedo() {
	sendRequest("GET", apiGateway + "/doUndo/redo", null, function (response) {
		document.getElementById("inputTextWindow").innerHTML = response;
	}, function (err) {
		// Do/Undo microservice is down
	});
}

//default cut in contentEditable div, when applied to a single point does nothing. In classic editors, it cuts the whole line it was triggered on. Overwriting...
function handleCut(e) {
	let sel = window.getSelection(),
		selCollapsed = sel.isCollapsed,
		node = sel.focusNode,
		editorWindowId = "inputTextWindow";
	//set a delay(1 ms seems fine) so we get the data after the oncut event happenened, default handler captures values before the event triggered (similar to a onkeydown event)
	setTimeout(function () {
		let node = window.getSelection().focusNode,
			next;
		//cut was called on a selection, allowing the default action, but
		//make sure the remaining nodes respect our defined structure <focusNode|><node> -> <focusNode|node>
		if (node.parentNode.id != "inputTextWindow" && !selCollapsed) {
			if (node.parentNode.nextSibling && node.parentNode.nextSibling.nodeType == node.parentNode.nodeType && node.textContent != "") {
				let cursorPosition = getCursorPosition("inputTextWindow");
				next = node.parentNode.nextSibling;
				node.textContent += next.textContent;
				next.parentNode.removeChild(next);
				//set cursor
				setCursorPosition(cursorPosition);
			}
			//update the number of lines
			updateLineNumbering();
		}
	}, 1);
	//cut was called on a single point
	if (sel && selCollapsed && node && node.id != editorWindowId) {
		e.preventDefault();
		while (node.parentNode && node.parentNode.id != editorWindowId) {
			node = node.parentNode;
		}
		if (node instanceof HTMLDivElement) {	//normal case, multiple lines already created
			e.clipboardData.setData('text', node.textContent.toString());
			//preparing to set cursor on div above (or below if we are on the first line)
			let range;
			if (node.previousSibling) {	//normal case, positioned anywhere, but not on the first line
				range = document.createRange();
				if ((node.previousSibling instanceof HTMLDivElement) && !(node.previousSibling.firstChild instanceof HTMLBRElement)) {
					range.setEnd(node.previousSibling.firstChild, 0);
				} else {
					range.setEndAfter(node.previousSibling.firstChild);
				}
			} else if (node.nextSibling) {	//no previous sibbling, we are on the first line
				range = document.createRange();
				if ((node.nextSibling instanceof HTMLDivElement) && !(node.nextSibling.firstChild instanceof HTMLBRElement)) {
					range.setEnd(node.nextSibling.firstChild, 0);
				} else {
					range.setEndAfter(node.previousSibling.firstChild);
				}
			}
			//removing line
			node.parentNode.removeChild(node);
			//setting cursor
			if (range) {
				range.collapse(false);
				sel.removeAllRanges();
				sel.addRange(range);
			}
		} //first line of text, no other rows created yet
		else {
			let editorWindow = document.getElementById(editorWindowId);
			while (editorWindow.firstChild && editorWindow.firstChild.textContent != "") {
				e.clipboardData.setData('text', editorWindow.firstChild.toString());
				editorWindow.removeChild(editorWindow.firstChild);
			}
			setCursorPosition(0);
		}
		updateLineNumbering(-1);
	}
}

function handlePaste() {
	//not implemented yet. We set it so it doesn't destroy the line numbering at least
	updateLineNumbering();
}