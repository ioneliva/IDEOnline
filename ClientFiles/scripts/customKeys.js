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
		//case 3: deletion would cause line to merge with previous line
		if (cursoPozInsideElement == 0 && !prevNode && node.parentNode.parentNode.previousSibling) {
			node.parentNode.parentNode.previousSibling.lastChild.textContent += node.textContent;
			thisSpanNode.parentNode.removeChild(thisSpanNode);
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
		//case 3: deleteion would cause line to merge with next line
		if (cursoPozInsideElement == node.textContent.length && !nextNode && node.parentNode.parentNode.nextSibling) {
			node.parentNode.parentNode.nextSibling.firstChild.textContent = node.textContent + node.parentNode.parentNode.nextSibling.firstChild.textContent;
			thisSpanNode.parentNode.removeChild(thisSpanNode);
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
	let node = window.getSelection().focusNode;
	let cursoPozInsideElement = window.getSelection().focusOffset;
	let end = node.textContent.length;
	let postText = node.textContent.substring(cursoPozInsideElement, end);

	if (postText != "") {	//the default handles the case where Enter is pressed at the end of the line corectly. We handle the case where it's anywhere else
		let preText = node.textContent.substring(0, cursoPozInsideElement);
		let inputWindow = document.getElementById("inputTextWindow");
		e.preventDefault();

		//case 1: no row divs created yet (the very first row). Envelop row in a div, up to and including pre text. Create next div, move posttext to next div
		if (node.parentNode.parentNode.id == "inputTextWindow") {
			//envelope node in div
			let el1 = document.createElement("div");
			node.textContent = postText;
			while (inputWindow.firstChild != node.parentNode && inputWindow.firstChild) {
				el1.appendChild(inputWindow.firstChild);
			}
			el1.appendChild(document.createTextNode(preText));
			inputWindow.insertBefore(el1, inputWindow.firstChild);

			let el2 = document.createElement("div");
			el2.appendChild(el1.nextSibling);
			while (el1.nextSibling) {
				el2.appendChild(el1.nextSibling);
			}
			inputWindow.insertBefore(el2, el1.nextSibling);		//insert next div in
		}
		else {
			//case 2 not first row, previous row divs exist. Create next div, remove posttext from curent div, move it to next div along with anything that comes after
			if (node.parentNode.parentNode.parentNode.id == "inputTextWindow") {
				let el2 = document.createElement("div");
				node.textContent = preText;
				el2.appendChild(document.createTextNode(postText));
				while (node.parentNode.nextSibling) {
					el2.appendChild(node.parentNode.nextSibling);
				}

				inputWindow.insertBefore(el2, node.parentNode.parentNode.nextSibling);
			}
		}
	}
}