var word = "";
function inputKeyPress(e) {
    var c;

    //get the code for last key pressed. (unicode a=97, b=98, etc)
    if (window.event) { // IE                    
        c = e.keyCode;
    } else if (e.which) { // Netscape/Firefox/Opera                   
        c = e.which;
    }

    //check if mouse was pressed, will use it later
    var mousePressed = 230;
    document.body.onmousedown = function () {
        mousePressed = 1;
        console.log("pressed mouse");
    }
    document.body.onmouseup = function () {
        mousePressed = 0;
        console.log("released mouse");
    }

    //convert character code to corresponding string from unicode, will be removed later in favor of unicode comparison TODO
    c = String.fromCharCode(c);

    var xhr = new XMLHttpRequest();//used for posting

    if (c.match(/[a-zA-Z]+/)) { //problem here with backspace, word registeres chars that are deleted TODO treat the case backspace is used
        word += c; //build a word
    }
    else {
        //we have a delimiter read in c, post the word
        if (!!word.trim()) { //word must not be blank, otherwise the user just pressed space/tab/enter a few times          
            xhr.open("POST", "http://localhost:58579/", true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.send(word);
            console.log("sent post (word): " + word);
        } 
        if (c.match(/[\[\].,\/#!$%\^&\*;:{}=\-_`~()<>]/)) { //if delimiter is not a blank,space,tab,etc. post it  
            xhr.open("POST", "http://localhost:58579/", true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.send(c);
            console.log("sent post (delimiter): " + c);
        }
        word = ""; //get ready for the next word
    }

    //get answer from post
    xhr.onload = function () {
        var output = document.getElementById("output");
        output.innerText = this.responseText;

        document.addEventListener("keypress", function () {
            replacer(word, this.responseText);
        });
    }

    //replace first parameter with second
    function replacer(search, replace) {
        var sel = window.getSelection();
        if (!sel.focusNode) {
            return;
        }

        var startIndex = sel.focusNode.nodeValue.indexOf(search);
        var endIndex = startIndex + search.length;
        if (startIndex === -1) {
            return;
        }
        console.log("first focus node: ", sel.focusNode.nodeValue);
        var range = document.createRange();
        //Set the range to contain search text
        range.setStart(sel.focusNode, startIndex);
        range.setEnd(sel.focusNode, endIndex);
        //Delete search text
        range.deleteContents();
        console.log("focus node after delete: ", sel.focusNode.nodeValue);
        //Insert replace text
        range.insertNode(document.createTextNode(replace));
        console.log("focus node after insert: ", sel.focusNode.nodeValue);
        //Move the caret to end of replace text
        sel.collapse(sel.focusNode, 0);
    }

    document.addEventListener("keypress", function () {
        replacer("foo", "bar");
    });

}

