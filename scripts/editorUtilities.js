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
        //console.log("range wants to jump here: " + window.getSelection().anchorNode.nodeValue);
        if (window.getSelection) {//Moz,Opera, IE>9
            var sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(savedRange);
            //console.log("but we force it here: " + window.getSelection().anchorNode.nodeValue);
        } else if (document.selection && range.select) {//IE<8
            range.select();
        }
    }
}

//get caret position (within a node, not the whole text! ex. <aa><b|bb><c> will return 1)
function getCursorPosition() {
    var sel, range;
    if (window.selection) {
        sel = window.getSelection();
        if (sel.rangeCount) {
            range = sel.getRangeAt(0);
            return range.endOffset;
        }
    }
}

//set caret position
function setCursorPositionAt(pos) {
    var sel, range;
    if (window.selection) {
        sel = window.getSelection;
        sel.removeAllRanges();
        range = document.createRange();
        range.endOffset = pos;
        range.collapse(false);
        sel.addRange(range);
    }
}

//replace focused node with the first parameter. Second parameter is a work-around because range doesn't get saved properly on newline
function insertServerHtml(html, newLine) {
    var range = document.createRange();
    var sel;


    if (window.getSelection) { //Moz,Opera IE>9
        sel = window.getSelection();

        if (sel.getRangeAt && sel.rangeCount) {

            if (newLine) {
                range.selectNode(sel.anchorNode.previousSibling.lastChild);
            } else {
                range.selectNode(sel.anchorNode);                               //set range to envelop selection
            }

            //range.deleteContents() deletes only the contents, no matter if you wrap the range around the html element. Default broser behaviour, can't be overwritten
            //we bypass it by deleting it from the DOM
            if (sel.anchorNode.parentNode instanceof HTMLDivElement) {
                range.deleteContents();
            } else { //parent is span, we are in the node text insdide it
                var nodeToDelete = document.getElementById(sel.anchorNode.parentNode.getAttribute("id"));
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
  
            if (lastNode) {
                range.setStartAfter(lastNode);                      //set cursor position
                range.collapse(true);                               //true -collapse to start, false-to end
                sel.removeAllRanges();
                sel.addRange(range);
            }
        }
    } else if (document.selection && document.selection.type != "Control") { //IE<8
        document.selection.createRange().pasteHTML(html);
    }
}


