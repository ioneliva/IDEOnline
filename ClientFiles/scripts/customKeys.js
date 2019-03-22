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
		globalCursor = getCursorPosition("inputTextWindow");
		//case 1: deletion would cause current node to remain empty		 <node><x|><node> -> <node|node> -> <node>
		if (cursoPozInsideElement == 1 && node.textContent.length == 1) {
			console.log("case 1");
			e.preventDefault();
			if (nextNode && prevNode) {
				prevNode.textContent += nextNode.textContent;
				nextNode.parentNode.removeChild(nextNode);
			}
			thisSpanNode.parentNode.removeChild(thisSpanNode);
			setCursorPosition(globalCursor - 1);
		}
		//case 2: deletion would cause previous node to remain empty, but leave the current one untouched	  <node><x><|node> -> <node|node> -> <node>
		if (cursoPozInsideElement == 0 && prevNode && prevNode.textContent.length == 1) {
			console.log("case 2");
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
		//case 3: deletion would cause line to merge with previous line
		if (cursoPozInsideElement == 0 && !(prevNode instanceof HTMLSpanElement) && node.parentNode.parentNode.previousSibling) {
			console.log("case 3, backspace");
			let lastNeighboringElement = node.parentNode.parentNode.previousSibling.lastChild;
			if (lastNeighboringElement instanceof HTMLBRElement) {		//previous line is empty
				console.log("case 3:1");
				e.preventDefault()
				lastNeighboringElement.parentNode.appendChild(thisSpanNode);
				lastNeighboringElement.parentNode.removeChild(lastNeighboringElement);
				node.parentNode.parentNode.nextSibling.parentNode.removeChild(node.parentNode.parentNode.nextSibling);
			} else
				if (node.firstChild instanceof HTMLBRElement) {		//current line is empty
					console.log("case 3:2");
					e.preventDefault();
					node.parentNode.parentNode.removeChild(node.parentNode);
				} else {	//standard case, both current and previous line contain something
					console.log("case 3:3");
					e.preventDefault();
					lastNeighboringElement.textContent += node.textContent;
					thisSpanNode.parentNode.removeChild(thisSpanNode);
					//todo: if node remains empty, remove node
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
//we force the browser to regard <node>Enter<node> as a single node, so it gets analyzed by the server in a single pass
//normally the server would have to communicate twice for the node before and after the line break, which is slower and can cause significant problems in case of delay 
function handleEnter(e) {
	let node, cursoPozInsideElement, globalCursor, preText, postText, end;
	node = window.getSelection().focusNode;
	cursoPozInsideElement = window.getSelection().focusOffset;

	postText = node.textContent.substring(cursoPozInsideElement, end);
	if (postText != "") {	//the default handles the case where Enter is pressed at the end of the line corectly. We handle the case where it's anywhere else
		e.preventDefault();
		end = node.textContent.length;
		preText = node.textContent.substring(0, cursoPozInsideElement);
		node.textContent = preText + "\n" + postText;
	}
}
//we recreate de default Gecko(FF, Chrome) browser structure after the nodes above return from the server, decorated with color
function formatStructure(node) {
	//we set it up so "node" is the text node inside de node before the delimiter /n		<|pre></n><post>
	//in case Enter was pressed at the begining of the line, "node" will be the delimiter text "/n"		<|/n><post>
	let preNode = node.parentNode;
	let delimiter = node.parentNode.nextSibling;
	let postNode = node.parentNode.nextSibling.nextSibling;
	let inputWindow = document.getElementById("inputTextWindow");
	let el1 = document.createElement("div");	//this div will wrap around the current line
	let el2 = document.createElement("div");	//this div will contain next line
	
	//case 1: no row divs created yet (the very first row). Envelop row in a div, up to and including pre node. Create next div, move post node to next div
	if (node.parentNode.parentNode.id == "inputTextWindow") {
		console.log(" Enter CASE 1");
		//1:1: Enter pressed somewhere in the middle of the line
		if (node.textContent != "\n") {
			console.log("1:1");
			while (inputWindow.firstChild != preNode && inputWindow.firstChild) {
				el1.appendChild(inputWindow.firstChild);
			}
			el1.appendChild(preNode);
			delimiter.parentNode.removeChild(delimiter);
		}
		//1:2: Enter pressed at the very start of the line
		if (node.textContent == "\n") {
			console.log("1:2");
			let brNode = document.createElement("BR");
			el1.appendChild(brNode);
			node.parentNode.parentNode.removeChild(node.parentNode);
		}
		//common code to both 1:1 and 1:2 cases
		inputWindow.insertBefore(el1, inputWindow.firstChild);
		el2.appendChild(el1.nextSibling);
		while (el1.nextSibling) {
			el2.appendChild(el1.nextSibling);
		}
		inputWindow.insertBefore(el2, el1.nextSibling);
	} else {
		//case 2: not first row, previous row divs exist. Create next div, remove post node from curent div, move it to the new div along with anything that comes after
		if (node.parentNode.parentNode.parentNode.id == "inputTextWindow") {
			console.log("Enter CASE 2");
			//2:1: Enter pressed somewhere in the middle of the line
			if (node.textContent != "\n") {
				console.log("2:1");
				delimiter.parentNode.removeChild(delimiter);
				el2.appendChild(postNode);
				while (preNode.nextSibling) {
					el2.appendChild(preNode.nextSibling);
				}
				inputWindow.insertBefore(el2, preNode.parentNode.nextSibling);
			}
			//2:2: Enter pressed at the very start of the line
			if (node.textContent == "\n") {
				console.log("2:2");
				let brNode = document.createElement("BR");
				el1.appendChild(brNode);
				inputWindow.insertBefore(el1, node.parentNode.parentNode);
				node.parentNode.parentNode.removeChild(node.parentNode);
			}
		}
	}
	//set cursor position
	let range = document.createRange();
	if (el2.firstChild) {
		range.setEnd(el2.firstChild.firstChild, 0);

	} else {		//one of the functions doesn't use the second div, we get another reference point for it
		range.setEnd(el1.nextSibling.firstChild.firstChild, 0);
	}
	range.collapse(false);
	window.getSelection().removeAllRanges();
	window.getSelection().addRange(range);
}