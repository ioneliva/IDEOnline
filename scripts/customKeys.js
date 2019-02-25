document.getElementById("inputTextWindow").addEventListener("keydown", triggerOnDown);
document.getElementById("inputTextWindow").addEventListener("keyup", triggerOnUp);

//note: if the user keeps a key pressed, it triggers a multitude of "keydown" events, but only one "keyup" event
//so keys that modify existing structure on multiple triggers, like Backspace and Del need to be handled on KeyDown
function triggerOnDown(e) {
    var c = readMyPressedKey(e),
        node = window.getSelection().focusNode,
        cursoPozInsideElement = window.getSelection().focusOffset,
        globalCursor;

    if (c == "Backspace") {
        if (node && !(node instanceof HTMLDivElement)) {
            if (cursoPozInsideElement == 1 && node.textContent.length == 1) {      // <...><c|> -> <...|>
                e.preventDefault();
                globalCursor = getCursorPosition("inputTextWindow");
                var nodeToDelete = node.parentNode;
                nodeToDelete.parentNode.removeChild(nodeToDelete);
                setCursorPosition(globalCursor - 1);
            }
            if (cursoPozInsideElement == 0 && node.parentNode.previousSibling.textContent.length == 1) { // <...><b><|c...> -> <...|><c...>
                e.preventDefault();
                globalCursor = getCursorPosition("inputTextWindow");
                var nodeToDelete = node.parentNode.previousSibling;
                nodeToDelete.parentNode.removeChild(nodeToDelete);
                setCursorPosition(globalCursor - 1);
            }
        }
    }
    if (c == "Delete") {
        if (node && !(node instanceof HTMLDivElement)) {
            if (cursoPozInsideElement == 0 && node.textContent.length == 1
                    && node.parentNode.nextSibling) {  //<|c><...> -> <|...>
                e.preventDefault();
                globalCursor = getCursorPosition("inputTextWindow");
                var nodeToDelete = node.parentNode;
                nodeToDelete.parentNode.removeChild(nodeToDelete);
                setCursorPosition(globalCursor);
            }
            if (cursoPozInsideElement == node.textContent.length
                    && node.parentNode.nextSibling && node.parentNode.nextSibling.textContent.length == 1) {     //<...c|><b><a...> -> <...c|><a...>
                e.preventDefault();
                globalCursor = getCursorPosition("inputTextWindow");
                var nodeToDelete = node.parentNode.nextSibling;
                nodeToDelete.parentNode.removeChild(nodeToDelete);
                setCursorPosition(globalCursor);
            }
        }
    }

    if (c == "Tab" || c== "PageUp" || c == "PageDown" || c == "F5") {
        e.preventDefault();
    }
}

function triggerOnUp(e) {
    var c = readMyPressedKey(e),
        node = window.getSelection().focusNode;

    //note to self -discovered a strange inconsistency/bug. When pressing tab sometimes the tab space is displayed smaller than it should be, despite the html behind containing a proper \t tag
    //this has nothing to do with my code, as far as I can tell, it's a strange browser or css behaviour
    if (c == "Tab") {
        var globalCursorPoz = getCursorPosition("inputTextWindow");
        var cursoPozInsideElement = window.getSelection().focusOffset;
        var end = node.textContent.length;
        preText = node.textContent.substring(0, cursoPozInsideElement);
        postText = node.textContent.substring(cursoPozInsideElement, end);
        node.textContent = preText + "\t" + postText;
        setCursorPosition(globalCursorPoz + 1);
    }
    if (c == "PageUp") {
        setCursorPosition(0);
    }
    if (c == "PageDown") {
        var lines = 1;
        //basically we want the number of chars to the end + number of lines except the first one (same algorithm as in utilities -create range for setCursorPosition)
        var inputWindow = document.getElementById("inputTextWindow");
        for (var i = 0; i < inputWindow.childNodes.length; i++) {
            if (inputWindow.childNodes[i] instanceof HTMLDivElement && inputWindow.childNodes[i].previousSibling) {
                lines++;
            }
        }
        setCursorPosition(document.getElementById("inputTextWindow").textContent.length + lines-1);
    }
}
