//filters
function isAlphaNumeric(c) {
	let ret = false;
	if (c.match(/^[a-zA-Z0-9\_]+$/i)) {
		ret = true;
	}
	return ret;
}
function isPositionalChar(c) {
    let ret = false;
    if (c === "ArrowLeft" || c === "ArrowDown" || c === "ArrowRight" || c === "ArrowUp"
        || c === "Home" || c === "End" || c === "PageUp" || c === "PageDown") {
        ret = true;
    }
    return ret;
}
function isStructureModifying(c) {
	let ret = false;
	if (c === "Enter" || c === "Tab" || c==="Backspace" || c==="Delete") {
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
function postRequest(verb, url, body, successCallback, errorCallback) {
    let xhr = new XMLHttpRequest();
    xhr.open(verb, url);
    xhr.setRequestHeader('Content-Type', 'application/json; charset = utf - 8');
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

/*
 * A bit of research for the next functions -source MDN and w3schools.
 * var selection = window.getSelection();              //range of text and objects selected with mouse drag or Shift+dirrectional keys
 * var anchor = selection.anchorNode;                  //Returns the Node in which the selection begins.
 * var focusNode = selection.focusNode;                //Returns the Node in which the selection ends.
 * var type = selection.type;                          //returns "Caret" for click or "Range" for drag
 * var singlePoint = selection.isCollapsed;            //Returns a Boolean indicating whether the selection's start and end points are at the same position.
 * var rangeX = selection.getRangeAt(index);           //method returns a range object representing one of the ranges currently selected.
    */

//get current cursor position
//the formula I dicovered intuitively (pen and paper examples) is number of chars to the cursor plus number of interior divs, excepting the first 
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
function setCursorPosition(pos) {
	if (pos >= 0) {
		let sel = window.getSelection(),
			range = createRange(false, document.getElementById("inputTextWindow"), { count: pos });

		if (range) {
			range.collapse(false);      //true -collapse to start, false-to end
			sel.removeAllRanges();
			sel.addRange(range);
		}
	}
}

//if parameter forReplace is false, creates range for setting cursor position
//if parameter forReplace is true, creates range encompasing multiple nodes
function createRange(forReplace, currentNode, pos, range) {
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
				if (forReplace) {	//range for selecting a group of nodes
					selectIntoRange(currentNode, range);
				} else {			//range to get cursor position
					if (currentNode instanceof HTMLBRElement) {
						range.setEndBefore(currentNode);
					} else {
						range.setEnd(currentNode, pos.count);
					}
				}
				pos.count = -1;
			}
		} else {
			let i;
			for (i = 0; i < currentNode.childNodes.length; i++) {
				if (currentNode.id == "inputTextWindow" && currentNode.childNodes[i] instanceof HTMLDivElement
					&& currentNode.childNodes[i].previousSibling) {     //interior div, except the first one
					pos.count--;
				}
				range = createRange(forReplace, currentNode.childNodes[i], pos, range);

				if (pos.count == -1) {
					break;
				}
			}
		}
    }
    return range;
}

//rules for what nodes to add into range, relative to node
function selectIntoRange(node, range) {
	if ((node instanceof HTMLBRElement) && !(node.parentNode instanceof HTMLSpanElement)) { //enter pressed right after the few word, before server got the chance to analyze it
		range.setStartBefore(node.parentNode);
		range.setEndAfter(node.parentNode);
	} else {
		if (node.parentNode instanceof HTMLSpanElement
			|| (node.parentNode instanceof HTMLDivElement && node.parentNode.id != "inputTextWindow")) { //general case, not first row
			if (node.parentNode.previousSibling) {
				range.setStartBefore(node.parentNode.previousSibling);
			} else {
				range.setStartBefore(node.parentNode);
			}
			if (node.parentNode.nextSibling) {
				if (node.parentNode.nextSibling.firstChild instanceof HTMLBRElement) {
					range.setEndAfter(node.parentNode);
				} else {
					range.setEndAfter(node.parentNode.nextSibling);
				}
			} else {
				range.setEndAfter(node.parentNode);
			}
		} else if (node.parentNode.id == "inputTextWindow") {	//general case, very first row, no other rows created yet
			range.setStartBefore(node);
			range.setEndAfter(node);
		}
	}
}

//select nodes around position, according to rules set earlier
function selectNodesAround(pos) {
	let range = createRange(true, document.getElementById("inputTextWindow"), { count: pos });
	return range;
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

/*
 * performance tests done with
var t0 = performance.now();
doSomething();
var t1 = performance.now();
console.log("Call to doSomething took " + (t1 - t0) + " milliseconds.");
*/