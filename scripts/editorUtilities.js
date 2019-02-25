//filter
function isPositionalChar(c) {
    ret = false;
    if (c == "Enter" || c=="Tab" || c === "ArrowLeft" || c === "ArrowDown" || c === "ArrowRight" || c === "ArrowUp"
        || c === "Home" || c === "End" || c === "PageUp" || c === "PageDown") {
        ret = true;
    }
    return ret;
}

//read key on event
function readMyPressedKey(event) {
    var ret = "";
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

//send request to server
function postRequest(verb, url, body, successCallback, errorCallback) {
    var xhr = new XMLHttpRequest();
    xhr.open(verb, url);
    xhr.setRequestHeader('Content-Type', 'application/json; charset = utf - 8');
    xhr.setRequestHeader('Accept', 'application/json');

    xhr.addEventListener("load", function onLoad() {
        if (xhr.readyState == 4 && xhr.status === 200) {
            successCallback(xhr.response);
        }
    });
    xhr.addEventListener("error", errorCallback);

    var postJSONState = JSON.stringify(body);
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
    var sel = window.getSelection(),
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

//get range end offset in element for wanted cursor position
//formula is the invert of the above - position wanted minus number of interior divs, except the first row
function createRange(currentNode, pos, range) {
    if (!range) {
        range = document.createRange();
        range.selectNode(currentNode);
        range.setStart(currentNode, 0);
        range.setEnd(currentNode,0);
    }

    if (currentNode) {
        if (currentNode.nodeType === Node.TEXT_NODE) {
            if (currentNode.textContent.length < pos.count) {
                pos.count -= currentNode.textContent.length;
            } else {
                range.setEnd(currentNode, pos.count);
                pos.count = -1;
            }
        } else {
            for (var i = 0; i < currentNode.childNodes.length; i++) {
                if (currentNode.id == "inputTextWindow" && currentNode.childNodes[i] instanceof HTMLDivElement
                    && currentNode.childNodes[i].previousSibling) {     //interior div, except the first one
                    pos.count--;
                }
                range = createRange(currentNode.childNodes[i], pos, range);

                if (pos.count == -1) {
                    break;
                }
            }
        }
    }
    return range;
}

//set cursor position after pos characters in contentEditable window
function setCursorPosition(pos) {
    if (pos >= 0) {
        var sel = window.getSelection(),
            range = createRange(document.getElementById("inputTextWindow"), { count: pos });

        if (range) {
            range.collapse(false);      //true -collapse to start, false-to end
            sel.removeAllRanges();
            sel.addRange(range);
        }
    }
}

//replace text contents of node with html
function replaceNodeWithHTML(node, html) {
    var range = document.createRange();

    range.selectNode(node);     //set range to envelop node

    //range.deleteContents() deletes only the contents of the element, not the tags, no matter if you wrap the range around the html element. Default broser behaviour, can't be overwritten
    //we bypass it by deleting it from the DOM
    if (node.parentNode instanceof HTMLDivElement) {
        range.deleteContents();
    }
    else {      //parent is span, we are in the node text insdide it
        var nodeToDelete = document.getElementById(node.parentNode.getAttribute("id"));
        if (nodeToDelete) {     //sometimes it fail, causes a stuttering, but with no extra effect
            nodeToDelete.remove();
        }
    }

    var el = document.createElement("div"),     //this div is a temporary carrier for our html
        frag = document.createDocumentFragment(),
        aLittleHTML;
    el.innerHTML = html;
    
    while ((aLittleHTML = el.firstChild)) {
        frag.appendChild(aLittleHTML);
    }
    range.insertNode(frag);
}
