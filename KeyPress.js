var word = "";
var tabPageNo = 1;

if (document.addEventListener) {                // For all major browsers, except IE 8 and earlier
    document.getElementById("inputTextWindow").addEventListener("keypress", inputKeyPress);
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
    var c, delimiter;

    c = readMyPressedKey(e);

    if (c === "Backspace" && word) {
        word = word.substring(0, word.length - 1);
        delimiter = "";
    } else { //keyboard shortcuts
        if (c == "z" && e.ctrlKey) { //undo
            //request previous state
            postRequest("GET", "http://localhost:5002/undo", {"":""} , function (response) {
                document.getElementById("inputTextWindow").innerHTML = response;
            }, function (err) {
                // Do/Undo microservice is down
                });
        } else {
            if (c == "y" && e.ctrlKey) { //redo
                //request next state
                postRequest("GET", "http://localhost:5002/redo", { "": "" }, function (response) {
                    document.getElementById("inputTextWindow").innerHTML = response;
                }, function (err) {
                        // Do/Undo microservice is down
                    })
            }else { //non printable
                if (isNonPrintableSymbol(c)) {
                    delimiter = c;
                } else {
                    if (c.match(/^[a-zA-Z0-9\_]+$/i)) { //alphanumeric
                        word += c; //build a word
                    } else {
                        delimiter = c;
                    }
                }
            }
        }
    }
}
    
    if (delimiter) {
        //post the word+delimiter to word coloring microservice  
        postRequest("POST", "http://localhost:5001/", { "word": word, "delimiter": delimiter }, function (response) {
            var output = document.getElementById("output");
            output.innerText = response; //easy debugging, we show the server response on page
            //get values as strings (server responds with a Json)
            var wordColoringMS = JSON.parse(response);
            if (wordColoringMS.originalWord.length > 0 && wordColoringMS.serverModified.length > 0) {
                if (c === "Enter") {
                    //decorate with color spans
                    replace(wordColoringMS.originalWord, wordColoringMS.serverModified, true);
                }else {
                    //decorate with color spans
                    replace(wordColoringMS.originalWord, wordColoringMS.serverModified, false);
                }
                //post the current state to undo/redo microservice
                var currentState = document.getElementById("inputTextWindow").innerHTML;
                postRequest("PUT", "http://localhost:5002/", { "state": currentState });
            }
        }, function (err) {
            // Word coloring microservice is down
            });
        word = ""; //get ready for the next word 
    }
}

function isNonPrintableSymbol(c) {
    ret = false;
    if (c === "Shift" || c === "Alt" || c === "Enter" || c === "F1" || c === "F2" || c === "F3"
        || c === "F4" || c === "F5" || c === "F6" || c === "F7" || c === "F8" || c === "F9" || c === "F10"
        || c === "F11" || c === "F12" || c === "ArrowLeft" || c === "ArrowDown" || c === "ArrowRight" || c === "ArrowUp"
        || c === "Insert" || c === "Delete" || c === "Home" || c === "End" || c === "PageUp" || c === "PageDown") {
        ret = true;
    }
    return ret;
}

function readMyPressedKey(event) {
    var ret="";
    if (event.key) { //the new recommneded way (won't work in Safari)
        ret = event.key;
    } else {
        if (window.event && event.keyCode) { // IE and legacy                    
            ret = event.keyCode;
        } else if (event.which) { // Netscape/Firefox/Opera                   
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
        if (xhr.readyState ==4 && xhr.status === 200) {
            successCallback(xhr.response);
        }
    });

    xhr.addEventListener("error", errorCallback);

    var postJSONState = JSON.stringify(body);
    xhr.send(postJSONState);
}


//replace first parameter with second in the focus node. If the third parameter is true, Enter was pressed and we need to replace it in last the node above the current one
function replace(search, replace, newline) {
    var range = document.createRange();
    var sel = window.getSelection();
    var currentFocus = sel.focusNode;
    if (!currentFocus) {
        return;
    }

    if (newline == true) {
        if (currentFocus.previousSibling != null && currentFocus.previousSibling.lastChild.nodeValue != null) {
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
            range.insertNode(fragment);
            if (lastNode) {
                range.setStartBefore(currentFocus); //set cursor position
                range.collapse(true);
                sel.removeAllRanges();
                sel.addRange(range);
            }
        }else {//no text was entered, just multiple presses on the Enter key
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
        range.insertNode(fragment);
        if (lastNode) {
            range.setStartAfter(lastNode); //set cursor position
            range.collapse(true);
            sel.removeAllRanges();
            sel.addRange(range);
        }
    }

}
