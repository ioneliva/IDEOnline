document.getElementById("inputTextWindow").addEventListener("keydown", keydown);

//note: if the user keeps a key pressed, it triggers a multitude of "keydown" events, but only one "keyup" event
function keydown(e) {

    c = readMyPressedKey(e);
    var cursoPozInsideElement = window.getSelection().focusOffset;
    var globalCursor = getCursorPosition("inputTextWindow");

    if (c == "Backspace") {
        if (cursoPozInsideElement == oldNode.textContent.length == 1
            && !(oldNode instanceof HTMLDivElement)) {      // <...><c|> -> <...|>
            e.preventDefault();
            var nodeToDelete = oldNode.parentNode;
            nodeToDelete.parentNode.removeChild(nodeToDelete);
            setCursorPosition(globalCursor - 1);
        }
        if (cursoPozInsideElement == 0 && oldNode.parentNode.previousSibling
            && oldNode.parentNode.previousSibling.textContent.length == 1 && !(oldNode instanceof HTMLDivElement)) { // <...><b><|c...> -> <...|><c...>
            e.preventDefault();
            var nodeToDelete = oldNode.parentNode.previousSibling;
            nodeToDelete.parentNode.removeChild(nodeToDelete);
            setCursorPosition(globalCursor - 1);
        }
    }
    if (c == "Delete") {
        if (cursoPozInsideElement == 0 && oldNode.textContent.length == 1
            && oldNode.parentNode.nextSibling && !(oldNode instanceof HTMLDivElement)) {  //<|c><...> -> <|...>
            e.preventDefault();
            var nodeToDelete = oldNode.parentNode;
            nodeToDelete.parentNode.removeChild(nodeToDelete);
            setCursorPosition(globalCursor);
        }
        if (cursoPozInsideElement == oldNode.textContent.length
            && oldNode.parentNode.nextSibling && oldNode.parentNode.nextSibling.textContent.length == 1
            && !(oldNode instanceof HTMLDivElement)) {     //<...c|><b><a...> -> <...c|><a...>
            e.preventDefault();
            var nodeToDelete = oldNode.parentNode.nextSibling;
            nodeToDelete.parentNode.removeChild(nodeToDelete);
            setCursorPosition(globalCursor);
        }
    }
    //note to self -discovered a strange inconsistency/bug. When pressing tab sometimes the tab space is smaller than it should be, despite the html behind containing a proper tab tag
    //this has nothing to do with my code, as far as I can tell, it's a strange browser or css behaviour
    if (c == "Tab") {
        e.preventDefault();
        var globalCursorPoz = getCursorPosition("inputTextWindow");
        var cursoPozInsideElement = window.getSelection().focusOffset;
        var end = oldNode.textContent.length;
        preText = oldNode.textContent.substring(0, cursoPozInsideElement);
        postText = oldNode.textContent.substring(cursoPozInsideElement, end);
        oldNode.textContent = preText + "\t" + postText;
        setCursorPosition(globalCursorPoz + 1);
    }
    if (c == "PageUp") {
        e.preventDefault();
        setCursorPosition(0);
    }
    if (c == "PageDown") {
        e.preventDefault();
        var lines = 0;
        //basically we want the number of chars to the end + number of lines except the first one (same algorithm as in utilities -create range for setCursorPosition)
        for (var i = 0; i < document.getElementById("inputTextWindow").childNodes.length; i++) {
            lines++;
        }
        setCursorPosition(document.getElementById("inputTextWindow").textContent.length + lines - 1);
    }
    if (c == "F5") {
        e.preventDefault();
    }
}
