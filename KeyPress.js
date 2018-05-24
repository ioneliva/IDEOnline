var word = "";
var tabPageNo = 1;

if (document.addEventListener) {                // For all major browsers, except IE 8 and earlier
    document.getElementById("inputTextWindow").addEventListener("keydown", inputKeyPress);
    document.getElementById("activeTab").addEventListener("click", clickOnTab); //init, this is the default tab
    document.getElementById("newTab").addEventListener("click", clickOnTab);
    document.getElementById("closeButton").addEventListener("click", closeTab);
} else if (document.attachEvent) {              // For IE 8 and earlier versions
    document.getElementById("inputTextWindow").attachEvent("keydown", inputKeyPress);
    document.getElementById("activeTab").attachEvent("click", clickOnTab); //init, this is the default tab
    document.getElementById("newTab").attachEvent("click", clickOnTab);
    document.getElementById("closeButton").attachEvent("click", closeTab);
} 

function clickOnTab() {
    if (this.className == "tab newTab") { //user clicked on the + tab
        //old active tab becomes innactive
        var active = document.getElementById("activeTab");
        if (active) { 
            active.id = "oldTab";
            active.className = "tab";
        } 
        //trasform this + tab into active tab
        this.id = "activeTab";
        this.className = "tab activeTab";
        //transform inner div
        var par = document.createElement("p");
        par.innerHTML = "file" + tabPageNo + ".css";
        //replaceChild does not work with new "Element" functions, we do it manually
        this.firstElementChild.removeChild(this.firstElementChild.firstElementChild);
        this.firstElementChild.appendChild(par);                                    
        //add a close button
        var closeBtn = document.createElement("button");
        closeBtn.id = "closeButton";
        closeBtn.className = "closeButton";
        closeBtn.innerHTML = "x";
        if (document.addEventListener) {
            closeBtn.addEventListener("click", closeTab);
        } else if (document.attachEvent) {
            closeBtn.attachEvent("click", closeTab);
        }
        //add the button to firstchild
        this.firstElementChild.appendChild(closeBtn);
        tabPageNo++;
        //create a new editor window    TODO: figure css out. Also give it an unique id, tied to the tab above. When tab is active, window comes on top of others
        var wdw = document.createElement("div");
        wdw.contentEditable = "true";
        wdw.setAttribute("spellcheck", "false");
        wdw.setAttribute("type", "text");
        if (document.addEventListener) {
            wdw.addEventListener("keydown", inputKeyPress);
        } else if (document.attachEvent) {
            wdw.attachEvent("keydown", inputKeyPress);
        }
        document.getElementById("content").appendChild(wdw);

        //add the + tab again
        var newTab = document.createElement("div");
        newTab.id = "newPage";
        newTab.className = "tab newTab";
        var innerTab = document.createElement("div");
        innerTab.className = "inner-tab";
        var par = document.createElement("p");
        par.innerHTML = "+";
        innerTab.appendChild(par);
        newTab.appendChild(innerTab);
        document.getElementById("tabs").appendChild(newTab);
        if (document.addEventListener) {
            newTab.addEventListener("click", clickOnTab);
        } else if (document.attachEvent) {
            newTab.attachEvent("click", clickOnTab);
        }
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
    allTabs = this.parentElement.parentElement.parentElement; //xButton <- innerTab <- Tab <-All Tabs 
    tab = this.parentElement.parentElement;

    //if we are trying to close the active tab, make previous tab the active one. If there is no previous, next tab becomes active
    if (tab.className == "tab activeTab") {
        if (tab.previousElementSibling != null) {
            tab.previousElementSibling.id = "activeTab";
            tab.previousElementSibling.className = "tab activeTab";
        } else {
            if (tab.previousElementSibling == null && tab.nextElementSibling.className != "tab newTab") { 
                tab.nextElementSibling.id = "activeTab";
                tab.nextElementSibling.className = "tab activeTab";
            }
        }
    }
    //remove all listeners on element and parents to avoid memory leak
    tab.removeEventListener("click", clickOnTab);
    this.removeEventListener("click", closeTab);
    //remove parent
    allTabs.removeChild(tab);
}

function inputKeyPress(e) {
    var c;
    var xhr = new XMLHttpRequest();//used for posting
    //console.log("text total: "+document.getElementById("inputTextWindow").innerText ); this is the whole text without html markups

    if (e.key) { //the new recommneded way (won't work in Safari)
        c = e.key;
    } else {
        if (window.event && e.keyCode) { // IE and legacy                    
            c = e.keyCode;
        } else if (e.which) { // Netscape/Firefox/Opera                   
            c = e.which;
        }
    }

    if (c === "Backspace" && word.length > 0) {
        word = word.substring(0, word.length - 1);
    } else {
        if (c.match(/^[a-zA-Z0-9]+$/i) && c != "Delete" && c != "Shift" && c != "Alt" && c != "Control" && c != "F1" && c != "F5" && c != "F6" && c != "Enter"
                    && c!="ArrowLeft" && c!="ArrowDown" && c!="ArrowRight"&&c!="ArrowUp") {
            word += c; //build a word
        } else {
       //post the word+delimiter   
                xhr.open("POST", "http://localhost:5001/", true); //third parameter set to true represents async communication
                xhr.setRequestHeader('Content-Type', 'application/json');
                var postJSON = JSON.stringify({ "word": word, "delimiter": c });
                xhr.send(postJSON);
                //console.log("sent post: " + "word:" + word + ",delimiter:" + c);

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
                        // Word coloring microservice is down
                    }
                };
                word = ""; //get ready for the next word
        }
    }

}

//replace first parameter with second
function replace(search, replace) {
    var range = document.createRange();
    var sel = window.getSelection();
    var currentFocus = sel.focusNode;
    if (!currentFocus) {
        return;
    }
    if (currentFocus.nodeValue == null) { //pressed enter, need to focus on previous div, on the last word, as the current one would be empty
        if (currentFocus.previousSibling.lastChild.nodeValue != null) {
            var startIndex = currentFocus.previousSibling.lastChild.nodeValue.indexOf(search);
            if (startIndex === -1) {
                return;
            }
            var endIndex = startIndex + search.length;
            range.setStart(currentFocus.previousSibling.lastChild, startIndex);
            range.setEnd(currentFocus.previousSibling.lastChild, endIndex);
            //Delete search text
            range.deleteContents();
            //Insert replace text
            var el = document.createElement("div"); //placeholder div, we pull the elements from it into the fragment
            el.innerHTML = replace;
            var fragment = document.createDocumentFragment();
            var node, lastNode;
            while (node = el.firstChild) {
                lastNode = fragment.appendChild(node);
            }
            var firstNode = fragment.firstChild;
            range.insertNode(fragment);
            if (lastNode) {
                range.setStartAfter(currentFocus); //set cursor position
                range.collapse(true);
                sel.removeAllRanges();
                sel.addRange(range);
            }
        }
        else {//no text was entered, just a bunch of presses on the enter key
            return;
        }
    }
    else {  //normal case, replace node in the same focus
        var startIndex = currentFocus.nodeValue.indexOf(search);
        if (startIndex === -1) {
            return;
        }
        var endIndex = startIndex + search.length;
        range.setStart(currentFocus, startIndex);
        range.setEnd(currentFocus, endIndex);
        //Delete search text
        range.deleteContents();
        //Insert replace text
        var el = document.createElement("div"); //placeholder div, we pull the elements from it into the fragment
        el.innerHTML = replace;
        var fragment = document.createDocumentFragment();
        var node, lastNode;
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

}
