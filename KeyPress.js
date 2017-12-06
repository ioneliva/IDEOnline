var word = "";
var tabPageNo = 1;

document.getElementById("inputTextWindow").addEventListener("keypress", inputKeyPress);
document.getElementById("activeTab").addEventListener("click", clickOnTab); //init, this is the default tab present
document.getElementById("newTab").addEventListener("click", clickOnTab);
document.getElementById("closeButton").addEventListener("click", closeTab);

function clickOnTab() {
    if (this.className == "tab newTab") {
        //old active tab becomes innactive
        var active = document.getElementById("activeTab");
        if (active) { 
            active.id = "oldTab";
            active.className = "tab";
        } else {    //if there is no active tab, the user actually closed all the tabs manually
            console.log("all tabs closed!");
        }
        //trasform this into active tab
        this.id = "activeTab";
        this.className = "tab activeTab";
        //transform inner div
        this.firstChild.innerHTML = "file" + tabPageNo + ".css";      //not working???
        //console.log(this.firstChild.innerHTML);
        //add a close button
        var closeBtn = document.createElement("button");
        closeBtn.id = "closeButton";
        closeBtn.className = "closeButton";
        closeBtn.innerHTML = "x";
        //add the button to firstchild. Not working because we can't get first child
        //this.firstChild.appendChild(closeBtn);
        tabPageNo++;

        //add the + tab again
        var newTab = document.createElement("div");
        newTab.id = "newPage";
        newTab.className = "tab newTab";
        var innerTab = document.createElement("div");
        innerTab.className = "inner-tab";
        innerTab.innerHTML = "+";
        newTab.appendChild(innerTab);
        document.getElementById("tabs").appendChild(newTab);
        newTab.addEventListener("click", clickOnTab);
    }
    else { //user clicked on an old tab
        //find current active tab
        var active = document.getElementById("activeTab");
        //make it inactive
        active.id = "oldTab";
        active.className = "tab";
        //set the tab clicked as active
        this.id = "activeTab";
        this.className = "tab activeTab";
    }
}

function closeTab() {
    //remove all listeners on element and parents to avoid memory leak
    this.parentElement.parentElement.removeEventListener("click", clickOnTab);
    this.removeEventListener("click", closeTab);
    //remove parent
    parent = this.parentElement.parentElement.parentElement; //xButton <- innerTab <- Tab <-All Tabs 
    parent.removeChild(parent.firstChild); //removed inner tab (and the x button)
    parent.removeChild(parent.firstChild); //removed the tab
}

function inputKeyPress(e) {
    var c;

    //get the code for last key pressed. (unicode a=97, b=98, etc)
    if (window.event) { // IE                    
        c = e.keyCode;
    } else if (e.which) { // Netscape/Firefox/Opera                   
        c = e.which;
    }
    //convert character code to corresponding string from unicode, will be removed later in favor of unicode comparison TODO
    c = String.fromCharCode(c);

    var xhr = new XMLHttpRequest();//used for posting

    if (c.match(/[a-zA-Z0-9]+/)) { //problem here with backspace, word registeres chars that are deleted TODO treat the case backspace is used
        word += c; //build a word
    }
    else {
        //we have a delimiter read in c, post the word+delimiter. On server side we analize the delimiter as well    
            xhr.open("POST", "http://localhost:5001/", true); //third parameter set to true represents async communication
            xhr.setRequestHeader('Content-Type', 'application/json');
            var postJSON = JSON.stringify({ "word": word, "delimiter": c }); 
            xhr.send(postJSON);
            //console.log("sent post: " + postJSON);

        //get answer from server
        xhr.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) { // HTTP 200 OK
                var output = document.getElementById("output");
                output.innerText = this.responseText; 
                //get values as strings (server responds with a Json)
                var obj = JSON.parse(this.responseText);
                // console.log("received response: " + obj.serverModified);
                replace(obj.originalWord, obj.serverModified);
            }
            else {
                // server returned an error. Ignoring (for now)
            }
        };

        word = ""; //get ready for the next word
    }


}

//replace first parameter with second
function replace(search, replace) {
    var sel = window.getSelection();
    if (!sel.focusNode) {
        return;
    }

    var startIndex = sel.focusNode.nodeValue.indexOf(search);
    var endIndex = startIndex + search.length;
    console.log("searching |" + search + "| in |" + sel.focusNode.nodeValue + "|");
    console.log("startIndex=" + startIndex);
    console.log("endIndex=" + endIndex);
    if (startIndex === -1) {
        return;
    }
    //console.log("focus node: ", sel.focusNode.nodeValue);
    var range = document.createRange();
    //Set the range to contain search text
    range.setStart(sel.focusNode, startIndex);
    range.setEnd(sel.focusNode, endIndex);
    //Delete search text
    range.deleteContents();
    //Insert replace text
    var el = document.createElement("div"); //placeholder div, we pull the elements from it into the fragment
    el.innerHTML = replace;
    var fragment = document.createDocumentFragment(), node, lastNode;
    while (node = el.firstChild) {
        lastNode = fragment.appendChild(node);
    }
    var firstNode = fragment.firstChild;
    range.insertNode(fragment);
    if (lastNode) {
        range.setStartAfter(lastNode); //set cursor position
        range.collapse(true);  
        sel.removeAllRanges();
        sel.addRange(range);
    }

}
