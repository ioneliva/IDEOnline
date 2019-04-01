document.getElementById("inputTextWindow").addEventListener("keydown", triggerOnDown);

//note: if the user keeps a key pressed, it triggers a multitude of "keydown" events, but only one "keyup" event
//so keys that modify existing structure on multiple triggers, like Backspace and Del need to be handled on KeyDown
function triggerOnDown(e) {
	let c = readMyPressedKey(e);

	if (c === "Backspace") {
		handleBackspace(e);
    }
	if (c === "Delete") {
		handleDelete(e);
	}
	if (c === "Tab") {
		handleTab();
    }
    if (c === "Enter") {
        handleEnter();
    }

    if (c === "Tab" || c=== "PageUp" || c === "PageDown" || c==="Home" || c==="End" || c === "F5") {
        e.preventDefault();
	}
}

//if a node would be left empty, we delete it and merge the neighboring nodes (if any)
//default for both backspace and delete leaves empty span containers behind, we fix that
//note this is the event BEFORE the deletion, so "node" would be node before deletion action happened
function handleBackspace(e) {
	let node = window.getSelection().focusNode,
		cursoPozInsideElement = window.getSelection().focusOffset,
		globalCursor,
		thisSpanNode = node.parentNode,
		prevNode = node.parentNode.previousSibling,
		nextNode = node.parentNode.nextSibling;

	//user made a selection(with mouse or keyboard shift+arrow key) and pressed Backspace on it. Need to update line count
	if (!window.getSelection().isCollapsed) {
		let linesBeforeDeletion = getNumberOfLines();
		setTimeout(function () {	//set a small delay to access the variable states after the Backspace fired
			let linesAfterDeletion = getNumberOfLines();
			updateLineNumbering("-" + (linesBeforeDeletion - linesAfterDeletion));
			return;	//exit here, this is a special case and it is slower than the rest, we want it executing as fast as possible
		}, 1);
	}
    //deleted a line, need to update line count. Selection is point selection.(this is faster than updating the whole document, so it's preferable to the handler above)
	if (node.firstChild instanceof HTMLBRElement
			|| (node.parentNode instanceof HTMLSpanElement && !node.parentNode.previousSibling && cursoPozInsideElement == 0)) {
		updateLineNumbering(-1);
	}

	if (node && !(node instanceof HTMLDivElement)) {
		globalCursor = getCursorPosition("inputTextWindow");
		//case 1: deletion would cause current node to remain empty		 <node><x|><node> -> <node|node> -> <node>
        if (cursoPozInsideElement == 1 && node.textContent.length == 1 && prevNode && (thisSpanNode instanceof HTMLSpanElement)) {
			e.preventDefault();
			if (nextNode) {
				prevNode.textContent += nextNode.textContent;
				nextNode.parentNode.removeChild(nextNode);
			}
			thisSpanNode.parentNode.removeChild(thisSpanNode);
			setCursorPosition(globalCursor - 1);
		}
        //case 2: deletion would cause previous node to remain empty, but leave the current one untouched	  <node><x><|node> -> <node|node> -> <node>
        if (cursoPozInsideElement == 0 && prevNode && prevNode.textContent.length == 1 && !(node.firstChild instanceof HTMLBRElement)) {
			e.preventDefault();
			if (prevNode.previousSibling) {
				prevNode.previousSibling.textContent += node.textContent;
				prevNode.parentNode.removeChild(prevNode);
				thisSpanNode.parentNode.removeChild(thisSpanNode);
			} else {
				prevNode.parentNode.removeChild(prevNode);
			}
			setCursorPosition(globalCursor - 1);
		}
	}
}

function handleDelete(e) {
	let node = window.getSelection().focusNode,
		cursoPozInsideElement = window.getSelection().focusOffset,
		globalCursor,
		thisSpanNode = node.parentNode,
		prevNode = node.parentNode.previousSibling,
		nextNode = node.parentNode.nextSibling;

	//user made a selection(with mouse or keyboard shift+arrow key) and pressed Delete on it. Need to update line count
	if (!window.getSelection().isCollapsed) {
		let linesBeforeDeletion = getNumberOfLines();
		setTimeout(function () {
			let linesAfterDeletion = getNumberOfLines();
			updateLineNumbering("-" + (linesBeforeDeletion - linesAfterDeletion));
			return;	//as in case of Backspace, we exit early and prevent the analysis of the rest of the conditions below, to speed up execution
		}, 1);
	}
	//deleted a line, need to update line count element. Selection is point selection
	if (cursoPozInsideElement == node.textContent.length
		&& ((node.parentNode instanceof HTMLSpanElement && !node.parentNode.nextElementSibling && node.parentNode.parentNode.nextSibling)
			|| (node.parentNode instanceof HTMLDivElement && !node.nextSibling && node.parentNode.nextSibling) || (node instanceof HTMLDivElement))) {
		updateLineNumbering(-1);
	}

	if (node && !(node instanceof HTMLDivElement)) {
		//case 1: deletion would cause current node to remain empty	<node><|x><node> -> <node|node> -> <node>
		if (cursoPozInsideElement == 0 && node.textContent.length == 1 && thisSpanNode.nextSibling) {
			e.preventDefault();
			globalCursor = getCursorPosition("inputTextWindow");
			if (prevNode) {
				prevNode.textContent += nextNode.textContent;
				nextNode.parentNode.removeChild(nextNode);

			}
			thisSpanNode.parentNode.removeChild(thisSpanNode);
			setCursorPosition(globalCursor);
		}
		//case 2: deletion would cause the next node to become empty, but leave the current one intact	<node|><x><node> -> <node|node> -> <node>
		if (cursoPozInsideElement == node.textContent.length && nextNode && nextNode.textContent.length == 1) {
			e.preventDefault();
			globalCursor = getCursorPosition("inputTextWindow");
			if (nextNode.nextSibling) {
				node.textContent += nextNode.nextSibling.textContent;
				nextNode.nextSibling.parentNode.removeChild(nextNode.nextSibling);
			}
			nextNode.parentNode.removeChild(nextNode);
			setCursorPosition(globalCursor);
		}
	}
}

//default tab scrolls through page elements, we fix it to act like a tex Tab
function handleTab() {
	let node, cursoPozInsideElement, globalCursor, preText, postText, end;

	node = window.getSelection().focusNode;
	globalCursor = getCursorPosition("inputTextWindow");
	cursoPozInsideElement = window.getSelection().focusOffset;

	end = node.textContent.length;
	preText = node.textContent.substring(0, cursoPozInsideElement);
	postText = node.textContent.substring(cursoPozInsideElement, end);
	node.textContent = preText + "\t" + postText;
	setCursorPosition(globalCursor + 1);
}

//on Enter we need to update line count element
function handleEnter() {
	updateLineNumbering(+1);
}