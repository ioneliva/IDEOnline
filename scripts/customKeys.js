document.getElementById("inputTextWindow").addEventListener("keydown", triggerOnDown);
document.getElementById("inputTextWindow").addEventListener("keyup", triggerOnUp);

//note: if the user keeps a key pressed, it triggers a multitude of "keydown" events, but only one "keyup" event
//so keys that modify existing structure on multiple triggers, like Backspace and Del need to be handled on KeyDown
function triggerOnDown(e) {
    c = readMyPressedKey(e);
    var node = window.getSelection().focusNode;
    var cursoPozInsideElement = window.getSelection().focusOffset;
     //problema e aici.se incearca getcursor fara focus
    var globalCursor = getCursorPosition("inputTextWindow");

    //toDo -when we deletede EVERYTHING and cursor is set to 0, doesn't work properly. Modify setCursor() function
    if (c == "Backspace") {
        if (cursoPozInsideElement ==1 && node.textContent.length == 1
                && node!=null && !(node instanceof HTMLDivElement)) {      // <...><c|> -> <...|>
            e.preventDefault();
            var nodeToDelete = node.parentNode;
            nodeToDelete.parentNode.removeChild(nodeToDelete);
            setCursorPosition(globalCursor - 1);
        }
        if (cursoPozInsideElement == 0 && node.parentNode.previousSibling
                && node.parentNode.previousSibling.textContent.length == 1 && !(node instanceof HTMLDivElement)) { // <...><b><|c...> -> <...|><c...>
            e.preventDefault();
            var nodeToDelete = node.parentNode.previousSibling;
            nodeToDelete.parentNode.removeChild(nodeToDelete);
            setCursorPosition(globalCursor - 1);
        }
    }
    if (c == "Delete") {
        if (cursoPozInsideElement == 0 && node.textContent.length == 1
                && node.parentNode.nextSibling && !(node instanceof HTMLDivElement)) {  //<|c><...> -> <|...>
            e.preventDefault();
            var nodeToDelete = node.parentNode;
            nodeToDelete.parentNode.removeChild(nodeToDelete);
            setCursorPosition(globalCursor);
        }
        if (cursoPozInsideElement == node.textContent.length
                && node.parentNode.nextSibling && node.parentNode.nextSibling.textContent.length == 1
                && !(node instanceof HTMLDivElement)) {     //<...c|><b><a...> -> <...c|><a...>
            e.preventDefault();
            var nodeToDelete = node.parentNode.nextSibling;
            nodeToDelete.parentNode.removeChild(nodeToDelete);
            setCursorPosition(globalCursor);
        }
    }

    if (c == "Tab" || c== "PageUp" || c == "PageDown" || c == "F5") {
        e.preventDefault();
    }
}

function triggerOnUp(e) {
    c = readMyPressedKey(e);
    var node = window.getSelection().focusNode;

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
        var lines = 0;
        //basically we want the number of chars to the end + number of lines except the first one (same algorithm as in utilities -create range for setCursorPosition)
        for (var i = 0; i < document.getElementById("inputTextWindow").childNodes.length; i++) {
            lines++;
        }
        setCursorPosition(document.getElementById("inputTextWindow").textContent.length + lines - 1);
    }
}
