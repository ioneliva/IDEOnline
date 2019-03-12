document.getElementById("inputTextWindow").addEventListener("keydown", triggerOnDown);
document.getElementById("inputTextWindow").addEventListener("keyup", triggerOnUp);

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
		handleEnter(e);
	}
    if (c === "Tab" || c=== "PageUp" || c === "PageDown" || c === "F5") {
        e.preventDefault();
    }
}

function triggerOnUp(e) {
	let c = readMyPressedKey(e);

    if (c === "PageUp") {
        setCursorPosition(0);
    }
    if (c === "PageDown") {
        let lines = 1;
        //basically we want the number of chars to the end + number of lines except the first one (same algorithm as in utilities -create range for setCursorPosition)
        let inputWindow = document.getElementById("inputTextWindow");
        for (let i = 0; i < inputWindow.childNodes.length; i++) {
            if (inputWindow.childNodes[i] instanceof HTMLDivElement && inputWindow.childNodes[i].previousSibling) {
                lines++;
            }
        }
        setCursorPosition(document.getElementById("inputTextWindow").textContent.length + lines-1);
	}
}

//if a node would be left empty, we delete it and merge the neighboring nodes (if any)
function handleBackspace(e) {
	let node = window.getSelection().focusNode,
		cursoPozInsideElement = window.getSelection().focusOffset,
		globalCursor,
		thisSpanNode = node.parentNode,
		prevNode = node.parentNode.previousSibling,
		nextNode = node.parentNode.nextSibling;

	if (node && !(node instanceof HTMLDivElement)) {
		//case 1: deletion would cause current node to remain empty		 <...><c|><...> -> <...|...>
		if (cursoPozInsideElement == 1 && node.textContent.length == 1) {
			e.preventDefault();
			globalCursor = getCursorPosition("inputTextWindow");
			if (nextNode && prevNode) {
				prevNode.textContent += nextNode.textContent;
				nextNode.parentNode.removeChild(nextNode);
			}
			thisSpanNode.parentNode.removeChild(thisSpanNode);
			setCursorPosition(globalCursor - 1);
		}
		//case 2: deletion would cause previous node to remain empty, but leave the current one untouched	  <...><b><|c...> -> <...|c...>
		if (cursoPozInsideElement == 0 && prevNode && prevNode.textContent.length == 1) {
			e.preventDefault();
			globalCursor = getCursorPosition("inputTextWindow");
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

	if (node && !(node instanceof HTMLDivElement)) {
		//case 1: deletion would cause current node to remain empty	<...><|c><...> -> <...|...>
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
		//case 2: deletion would cause the next node to become empty, but leave the current one intact	<...c|><b><a...> -> <...c|a...>
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
function handleEnter(e) {
	let node, cursoPozInsideElement, globalCursor, preText, postText, end;

	node = window.getSelection().focusNode,
	globalCursor = getCursorPosition("inputTextWindow");
	cursoPozInsideElement = window.getSelection().focusOffset;
	end = node.textContent.length;
	postText = node.textContent.substring(cursoPozInsideElement, end);

	//the default handles the case where Enter is pressed at the end of the line corectly. We handle the case where it's anywhere else
	if (postText != "") {
		preText = node.textContent.substring(0, cursoPozInsideElement);
		e.preventDefault();
		//case 1: first row, no row divs created yet
		if (node.parentNode.parentNode.id == "inputTextWindow" || node.parentNode.id =="inputTextWindow") {
			let el1 = document.createElement("div");
			let el2 = document.createElement("div");

			el1.appendChild(document.createTextNode(preText));
			el2.appendChild(document.createTextNode(postText));

			var editorWindow = document.getElementById("inputTextWindow");
			editorWindow.insertBefore(el1, editorWindow.childNodes[0]);
			editorWindow.insertBefore(el2, el1.nextSibling);

			node.parentNode.removeChild(node);
		}

		/*
		node.textContent = preText + "\n" + postText;
		setCursorPosition(globalCursor+1);*/
	}
}