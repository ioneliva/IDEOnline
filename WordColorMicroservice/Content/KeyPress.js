var word = "";
function inputKeyPress(e) {
    var c;

    //get the code for last key pressed. (unicode a=97, b=98, etc)
    if (window.event) { // IE                    
        c = e.keyCode;
    } else if (e.which) { // Netscape/Firefox/Opera                   
        c = e.which;
    }
    //convert character code to corresponding string from unicode, will be removed later, read TODO below
    c = String.fromCharCode(c);

    //valid chars for a word are [0-9a-zA-Z]+directional arrows+backspace
    /*make regex expression based on char unicode. Numbers+letters+special characters are [48-57],[65-90],[97-122]. Also need to add rules so you can't declare a variable like 0abc. As of now, backspace is considered invalid...
    for now, we'll go with converting them'
    */
    var wordComponent = /^[0-9a-zA-Z]+$/; //backspace is \b, ^ marks start of word, + represents "any number of iterations", $marks the end of the matching string
    if (!c.match(wordComponent) && c!="\b" && word!="") {
    //post
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "http://localhost:58579/", true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(word);
    //get answer from post
    xhr.onload = function () {
        var output = document.getElementById("output");
        output.innerText =  this.responseText;
    }
    //TODO** 
    //replacing the word in text with the word we got from server  "reserved"->"<span style="color: green">reserved</span>". For now we just return the word as it is, for testing
    word = "";
    } else {
    //build a word
    word += c;
    }


}