//filters
function isAlphaNumeric(c) {
	let ret = false;
	if (c.match(/^[a-zA-Z0-9\_]+$/i)) {
		ret = true;
	}
	return ret;
}
function isArrowKey(c) {
    let ret = false;
    if (c === "ArrowLeft" || c === "ArrowDown" || c === "ArrowRight" || c === "ArrowUp") {
        ret = true;
    }
    return ret;
}
function isPositionModifying(c) {
	let ret = false;
	if (c === "Enter" || c === "Tab" || c==="Backspace" || c==="Delete" || c=="PageUp" || c=="PageDown" || c=="Home" || c=="End") {
		ret = true;
	}
	return ret;
}
function isSpecialChar(c) {
	let ret = false;
	if (c == "PageUp" || c == "PageDown" || c == "Home" || c == "End") {
		ret = true;
	}
	return ret;
}

//read key on event
function readMyPressedKey(event) {
    let ret = "";
    if (event.key) {                                //the new recommneded way (won't work in Safari)
        ret = event.key;
    } else {
        if (window.event && event.keyCode) {        //IE and legacy                    
            ret = event.keyCode;
        } else if (event.which) {                   //Moz/Opera                   
            ret = event.which;
        }
    }
    return ret;
}

//send xhr request to server (http protocol request)
function sendRequest(verb, url, body, successCallback, errorCallback) {
    let xhr = new XMLHttpRequest();
    xhr.open(verb, url);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Accept', 'application/json');

    xhr.addEventListener("load", function onLoad() {
        if (xhr.readyState == 4 && xhr.status === 200) {
            successCallback(xhr.response);
        }
    });
    xhr.addEventListener("error", errorCallback);

    let postJSONState = JSON.stringify(body);
    xhr.send(postJSONState);
}

//get current cursor position
function getCursorPosition(containerId) {
    let sel = window.getSelection(),
        pos = -1,
        currentNode;

    if (sel.focusNode) {
        currentNode = sel.focusNode;
        pos = sel.focusOffset;

        while (currentNode) {
            if (currentNode.id == containerId) {
                break;
            }

            if (currentNode.previousSibling) {
                if (currentNode.parentNode.id == containerId && currentNode instanceof HTMLDivElement) {        //we are positioned on a div row inside the container, but not the first row
                    pos++;
                }
                currentNode = currentNode.previousSibling;
                pos += currentNode.textContent.length;
            } else {
                currentNode = currentNode.parentNode;
                if (currentNode === null) {
                    break;
                } 
            }
        }
    }
    return pos;
}

//set cursor position after pos characters in contentEditable window 
//or set cursor for some special keys with overwritten functionality
function setCursorPosition(pos) {
	let sel = window.getSelection(),
		editor = getEditor(),
		range;
	if (Number.isInteger(pos) && pos >= 0) {
		range = createRange("for_cursor_position", editor, { count: pos });
	} else {
		let node;
		range = document.createRange();
		switch (pos) {
			case "PageUp": 
				node = editor;
				while (node && (node.nodeType != Node.TEXT_NODE)) {
					node = node.firstChild;
				}
				range.setEnd(node, 0);
				break;
			case "PageDown": {
				node = editor;
				while (node && (node.nodeType != Node.TEXT_NODE)) {
					node = node.lastChild;
				}
				range.setEnd(node, node.textContent.length);
			}
				break;
			case "Home": {
				node = sel.focusNode;
				while (!(node instanceof HTMLDivElement) && (node.parentNode.id != editor.id)) {
					node = node.parentNode;
				}
				range.setEnd(node.firstChild,0);
			}
				break;
			case "End": {
				node = sel.focusNode;
				while (!(node instanceof HTMLDivElement) && (node.parentNode.id != editor.id)) {
					node = node.parentNode;
				}
				range.setEnd(node.lastChild.lastChild, node.lastChild.lastChild.textContent.length);
			}
				break;
		}
	}
	if (range) {
		range.collapse(false);      //true -collapse to start, false-to end
		sel.removeAllRanges();
		sel.addRange(range);
	}
}

//create range, depending on context
function createRange(purpose, currentNode, pos, range) {
	if (currentNode) {
		if (!range) {
			range = document.createRange();
			range.selectNode(currentNode);
			range.setStart(currentNode, 0);
			range.setEnd(currentNode, 0);
		}

		if (currentNode.nodeType === Node.TEXT_NODE || currentNode instanceof HTMLBRElement) {
			if (currentNode.textContent.length < pos.count) {
				pos.count -= currentNode.textContent.length;
			} else {
				switch (purpose) {
					case "for_cursor_position":
						if (currentNode instanceof HTMLBRElement) {
							range.setEndBefore(currentNode);
						} else {
							range.setEnd(currentNode, pos.count);
						}
						break;
					case "for_replace":
						selectIntoRange(currentNode, range, "for_replace");
						break;
					case "for_token":
						selectIntoRange(currentNode, range, "for_token");
						break;
				}
				pos.count = -1; //signal for loop we found the end node, it's safe to exit early
			}
		} else {
			let i;
			for (i = 0; i < currentNode.childNodes.length; i++) {
				if (currentNode.id == getEditor().id && currentNode.childNodes[i] instanceof HTMLDivElement
					&& currentNode.childNodes[i].previousSibling) {     //interior div, except the first one
					pos.count--;
				}
				range = createRange(purpose, currentNode.childNodes[i], pos, range);

				if (pos.count == -1) {
					break;
				}
			}
		}
    }
    return range;
}

//rules for what nodes to add into range, relative to node
function selectIntoRange(node, range, purpose) {
	switch (purpose) {
        case "for_replace": {
			if ((node instanceof HTMLBRElement) && !(node.parentNode instanceof HTMLSpanElement)) { //Enter right after the first word, before server got the chance to analyze it
                range.setStartBefore(node.parentNode);
				range.setEndAfter(node.parentNode);
			} else {
				if (node.parentNode instanceof HTMLSpanElement) { //word previously analyzed by server
                    if (node.parentNode.previousSibling && !(node.parentNode.previousSibling.firstChild instanceof HTMLBRElement)) {
                        range.setStartBefore(node.parentNode.previousSibling);
                    } else {
						range.setStartBefore(node.parentNode);
                    }
                    if (node.parentNode.nextSibling && !(node.parentNode.nextSibling.firstChild instanceof HTMLBRElement)) {
                        range.setEndAfter(node.parentNode.nextSibling);
                    }
                    else {
                        range.setEndAfter(node.parentNode);
                    }
                } else if (node.parentNode instanceof HTMLDivElement) {	//word not analyzed by server yet
                    range.setStartBefore(node);
					range.setEndAfter(node);
				}
            }
		}
			break;
		case "for_token": {
			range.setStartBefore(node);
			range.setEndAfter(node);
		}
			break;
	}
}

//select nodes around position, according to rules set earlier
function selectNodesAround(pos) {
	let range = createRange("for_replace", getEditor(), { count: pos });
	return range;
}

//get the exact single word at pos
function getToken(pos) {
	let range = createRange("for_token", getEditor(), { count: pos });
	return range.toString();
}
//replace group of nodes around pos with provided html
function insertServerHtmlAtPos(pos, html) {
	let sel = window.getSelection(),
		range = selectNodesAround(pos);		//what nodes to select around pos

	//delete old contents
	if (range) {
		range.deleteContents();
		sel.removeAllRanges();
		sel.addRange(range);
	}
	//insert new html
    let el = document.createElement("div"),     //this div is a temporary carrier for our html
        frag = document.createDocumentFragment(),
        aLittleHTML;
    el.innerHTML = html;
    
    while ((aLittleHTML = el.firstChild)) {
        frag.appendChild(aLittleHTML);
    }
    range.insertNode(frag);
}

//check for server lag
function serverLagged(originalToken, serverToken) {
	let ret = true;
	if (originalToken == serverToken) {
		ret = false;
	}
	return ret;
}

//get number of user input lines in the editor window
function getNumberOfLines() {
	let node = getEditor().firstChild;
	let count = 1;

	if (!node) {
		return 0;	//new file editor window, no content
	}
	if ((node instanceof HTMLSpanElement) || (node.nodeType === Node.TEXT_NODE)) { //no divs created, window has only 1 row
		return count;
	}
	else if (node instanceof HTMLDivElement) { //rows created
		while (node.nextSibling) {
			count++;
			node = node.nextSibling;
		}
	}
	return count;
}

//update lines numbering element to reflect dynamic changes in the editor
function updateLineNumbering(count) { //count is an optional parameter
	let lineNumbering = document.getElementById("lineNumbering");

	if (count) {	//parameter passed, representing addition or substraction of lines
		if (count > 0) {		//add count lines
			let brElement = document.createElement("BR"),
				obj = document.createTextNode("1");

			if (!lineNumbering.firstChild) {
				lineNumbering.appendChild(document.createTextNode("0"));
				lineNumbering.appendChild(document.createElement("BR"));
			}
			else {
				let i = parseInt(lineNumbering.lastChild.previousSibling.textContent);
				obj = document.createTextNode(parseInt(i) + 1);
			}
			lineNumbering.appendChild(obj);
			lineNumbering.appendChild(brElement);
		}
		if (count < 0 && lineNumbering.lastChild) {		//remove count lines
			let i;
			for (i = count; i < 0 && lineNumbering.lastChild; i++) {
				lineNumbering.lastChild.parentNode.removeChild(lineNumbering.lastChild);    //remove number
				lineNumbering.lastChild.parentNode.removeChild(lineNumbering.lastChild);    //remove <br> tag
			}
		}
	}
	else {	//parameter not passed, do a full re-check of lines
		count = getNumberOfLines();

		while (lineNumbering.lastChild && parseInt(lineNumbering.lastChild.previousSibling.textContent) > count) {
			lineNumbering.lastChild.parentNode.removeChild(lineNumbering.lastChild);
			lineNumbering.lastChild.parentNode.removeChild(lineNumbering.lastChild);
		}
		let i = 0;
		while ((lineNumbering.lastChild && parseInt(lineNumbering.lastChild.previousSibling.textContent) < count)
			|| (!lineNumbering.lastChild) && (i < count)) {
			if (lineNumbering.lastChild) {
				i = parseInt(lineNumbering.lastChild.previousSibling.textContent);
			}
			i++;
			let obj = document.createTextNode(parseInt(i));
			lineNumbering.appendChild(obj);
			lineNumbering.appendChild(document.createElement("BR"));
		}
	}
}