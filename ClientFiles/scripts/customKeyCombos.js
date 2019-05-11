getEditor().addEventListener("keydown", triggerOnDownCombos);
getEditor().addEventListener("cut", handleCut);
getEditor().addEventListener("paste", handlePaste);

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
	if (undoMicroservice.state == "running") {
		undoMicroservice.state = "busy";
		setIconForMicroservice("undoMicroservice", "busy");
	}
	let startPing = new Date();
	sendRequest("GET", apiGateway + "/doUndo/undo", null, function (response) {
		//get statistical data about access data and ping
		undoMicroservice.accessedDate = new Date();
		undoMicroservice.state = "running";
		setIconForMicroservice("undoMicroservice", "running");
		undoMicroservice.ping = undoMicroservice.accessedDate - startPing;
		//use response from microservice
		getEditor().innerHTML = response;
	}, function (err) {
		undoMicroservice.state = "down";
		setIconForMicroservice("undoMicroservice", "down");
	});
}

function handleRedo() {
	if (undoMicroservice.state == "running") {
		undoMicroservice.state = "busy";
		setIconForMicroservice("undoMicroservice", "busy");
	}
	let startPing = new Date();
	sendRequest("GET", apiGateway + "/doUndo/redo", null, function (response) {
		undoMicroservice.accessedDate = new Date();
		undoMicroservice.state = "running";
		setIconForMicroservice("undoMicroservice", "running");
		undoMicroservice.ping = undoMicroservice.accessedDate - startPing;
		getEditor().innerHTML = response;
	}, function (err) {
		undoMicroservice.state = "down";
		setIconForMicroservice("undoMicroservice", "down");
	});
}

//default cut in contentEditable div, when applied to a single point does nothing. In classic editors, it cuts the whole line it was triggered on. Overwriting...
function handleCut(e) {
	let sel = window.getSelection(),
		selCollapsed = sel.isCollapsed,
		node = sel.focusNode,
		editor = getEditor();
	//set a delay(1 ms seems fine) so we get the data after the oncut event happenened, default handler captures values before the event triggered (similar to a onkeydown event)
	setTimeout(function () {
		let node = window.getSelection().focusNode,
			next;
		//cut was called on a selection, allowing the default action, but
		//make sure the remaining nodes respect our defined structure <focusNode|><node> -> <focusNode|node>
		if (node.parentNode.id != editor.id && !selCollapsed) {
			if (node.parentNode.nextSibling && node.parentNode.nextSibling.nodeType == node.parentNode.nodeType && node.textContent != "") {
				let cursorPosition = getCursorPosition(editor.id);
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
	if (sel && selCollapsed && node && node.id != editor.id) {
		e.preventDefault();
		while (node.parentNode && node.parentNode.id != editor.id) {
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
			while (editor.firstChild && editor.firstChild.textContent != "") {
				e.clipboardData.setData('text', editor.firstChild.toString());
				editor.removeChild(editor.firstChild);
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