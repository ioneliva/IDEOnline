//filter
function isPositionalChar(c) {
    ret = false;
    if (c == "Enter" || c === "ArrowLeft" || c === "ArrowDown" || c === "ArrowRight" || c === "ArrowUp"
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
//save current range
function saveRange() {
    if (window.getSelection) { //Moz,Opera, IE>9
        var sel = window.getSelection();
        if (sel.getRangeAt && sel.rangeCount) {
            var clone = sel.getRangeAt(0).cloneRange();
            return clone;
        }
    } else if (document.selection && document.selection.createRange) { //IE<8
        savedRange = document.selection.createRange();
    }
}

//replace current range with the saved one
function restoreRange(savedRange) {
    if (savedRange) {
        //console.log("range wants to jump here: " + window.getSelection().focusNode.nodeValue);
        if (window.getSelection) {//Moz,Opera, IE>9
            var sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(savedRange);
            //console.log("but we force it here: " + window.getSelection().focusNode.nodeValue);
        } else if (document.selection && range.select) {//IE<8
            range.select();
        }
    }
}

//get current cursor position
function getCursorPosition(parentId) {
    var selection = window.getSelection(),
        charCount = -1,
        node;

    if (selection.focusNode) {
        node = selection.focusNode;
        charCount = selection.focusOffset;

        while (node) {
            if (node.id === parentId) {
                break;
            }

            if (node.previousSibling) {
                node = node.previousSibling;
                charCount += node.textContent.length;
            } else {
                node = node.parentNode;
                if (node === null) {
                    break;
                }
            }
        }
    }
    return charCount;
}

//recursive, get range end offset in element for wanted cursor position
function createRange(node, chars, range) {
    if (!range) {
        range = document.createRange()
        range.selectNode(node);
        range.setStart(node, 0);
    }

    if (chars.count === 0) {
        range.setEnd(node, chars.count);
    } else if (node && chars.count > 0) {
        if (node.nodeType === Node.TEXT_NODE) {
            if (node.textContent.length < chars.count) {
                chars.count -= node.textContent.length;
            } else {
                range.setEnd(node, chars.count);
                chars.count = 0;
            }
        } else {
            for (var lp = 0; lp < node.childNodes.length; lp++) {
                range = createRange(node.childNodes[lp], chars, range);

                if (chars.count === 0) {
                    break;
                }
            }
        }
    }
    return range;
}

//set cursor position after chars characters in contentEditable window
function setCurrentCursorPosition(chars) {
    if (chars >= 0) {
        var selection = window.getSelection();

        range = createRange(document.getElementById("inputTextWindow"), { count: chars });

        if (range) {
            range.collapse(false);
            selection.removeAllRanges();
            selection.addRange(range);
        }
    }
}

//replace focused node with the first parameter
function insertServerHtml(html) {
    var range = document.createRange();
    var sel;

    if (window.getSelection) { //Moz,Opera IE>9
        sel = window.getSelection();

        if (sel.getRangeAt && sel.rangeCount) {

            range.selectNode(sel.focusNode);                               //set range to envelop selection

            //range.deleteContents() deletes only the contents, no matter if you wrap the range around the html element. Default broser behaviour, can't be overwritten
            //we bypass it by deleting it from the DOM
            if (sel.focusNode.parentNode instanceof HTMLDivElement) {
                range.deleteContents();
            } else { //parent is span, we are in the node text insdide it
                var nodeToDelete = document.getElementById(sel.focusNode.parentNode.getAttribute("id"));
                nodeToDelete.remove();
            }

            var el = document.createElement("div");                 //the div is a carrier for our element, determined by the html code
            el.innerHTML = html;
            var frag = document.createDocumentFragment();
            var node, lastNode;
            while ((node = el.firstChild)) {
                lastNode = frag.appendChild(node);                  //The returned value is the appended child
            }
            range.insertNode(frag);

            /*
            if (lastNode) {
                range.setStartAfter(lastNode);                      //set cursor position
                range.collapse(true);                               //true -collapse to start, false-to end
                sel.removeAllRanges();
                sel.addRange(range);
            }
            */
        }
    } else if (document.selection && document.selection.type != "Control") { //IE<8
        document.selection.createRange().pasteHTML(html);
    }
}


