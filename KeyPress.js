var tabPageNo = 1;

if (document.addEventListener) {                // For all major browsers, except IE 8 and earlier
    document.getElementById("inputTextWindow").addEventListener("keyup", inputKeyPress);
    //document.getElementById("inputTextWindow").addEventListener("mouseup", getCurrentPosition);
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
    var c, word;
    var needToSend = false;

    c = readMyPressedKey(e);

    if (isNonPrintableSymbol(c)) {              //non printable delimiter
        needToSend = true;
    } else {
        if (!c.match(/^[a-zA-Z0-9\_]+$/i)) {    //normal delimiter (anything not alphanumeric)
            needToSend = true;
        } 
    }

    //keyboard shortcuts
    if (c == "z" && e.ctrlKey) { //undo
        postRequest("GET", "http://localhost:5002/undo", null, function (response) {
            document.getElementById("inputTextWindow").innerHTML = response;
        }, function (err) {
            // Do/Undo microservice is down
        });
    } else {
        if (c == "y" && e.ctrlKey) { //redo
            postRequest("GET", "http://localhost:5002/redo", null, function (response) {
                document.getElementById("inputTextWindow").innerHTML = response;
            }, function (err) {
                // Do/Undo microservice is down
            });
        }
    }
    
    if (needToSend) {
        //post the contents of the current focus node to word coloring microservice  
        sel = window.getSelection();
        if (sel.anchorNode.nodeValue) {
            word = sel.anchorNode.nodeValue;
        } else if (sel.anchorNode.previousSibling && sel.anchorNode.previousSibling.lastChild) { //newline was pressed
            word = sel.anchorNode.previousSibling.lastChild.nodeValue;
        }

        postRequest("POST", "http://localhost:5001/", { "word_and_delimiter": word }, function (response) {
            var output = document.getElementById("output");
            output.innerText = response; 
            var wordColoringMS = JSON.parse(response);
            if (wordColoringMS.serverResponse!="100") {
                //decorate with color spans
                insertHtmlAtCursor(wordColoringMS.serverResponse);

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
    if (c === "Shift" || c === "Alt" || c=="Control" || c === "Enter" || c === "F1" || c === "F2" || c === "F3"
        || c === "F4" || c === "F5" || c === "F6" || c === "F7" || c === "F8" || c === "F9" || c === "F10" || c ==="Escape"
        || c === "F11" || c === "F12" || c === "ArrowLeft" || c === "ArrowDown" || c === "ArrowRight" || c === "ArrowUp"
        || c === "Insert" || c === "Delete" || c === "Home" || c === "End" || c === "PageUp" || c === "PageDown") {
        ret = true;
    }
    return ret;
}

function readMyPressedKey(event) {
    var ret="";
    if (event.key) {                                //the new recommneded way (won't work in Safari)
        ret = event.key;
    } else {
        if (window.event && event.keyCode) {        // IE and legacy                    
            ret = event.keyCode;
        } else if (event.which) {                   // Netscape/Firefox/Opera                   
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

/*
 * A bit of research for the next function -source MDN and w3schools. Usage inspired from StackOverflow
 * var selection = window.getSelection();              //range of text and objects selected with mouse drag or Shift+dirrectional keys
 * var anchor = selection.anchorNode;                  //Returns the Node in which the selection begins.
 * var focusNode = selection.focusNode;                //Returns the Node in which the selection ends.
 * var type = selection.type;                          //returns "Caret" for click or "Range" for drag
 * var singlePoint = selection.isCollapsed;            //Returns a Boolean indicating whether the selection's start and end points are at the same position.
 * var rangeX = selection.getRangeAt(index);           //method returns a range object representing one of the ranges currently selected.
    */
//replace focused node with the parameter
function insertHtmlAtCursor(html) {
    var range = document.createRange();
    var sel;
        
    if (window.getSelection) { //Moz/Chrome and modern IE
        sel = window.getSelection();
        if (sel.getRangeAt && sel.rangeCount) {
            range.selectNode(sel.anchorNode);                       //set range to envelop selection
            //console.log("the parent is: " + sel.anchorNode.parentNode);
            //console.log("Parent id = : " + sel.anchorNode.parentNode.getAttribute("id"));
            //console.log("the node is: " + sel.anchorNode);
            //console.log("the child is: " + sel.anchorNode.firstChild);

            //range.deleteContents() deletes only the contents, no matter if you wrap the range around the html element. Default broser behaviour, can't be overwritten
            //we bypass it by deleting it from the DOM
            if (sel.anchorNode.parentNode instanceof HTMLDivElement) {
                range.deleteContents();
            } else { //parent is span, we are in the node text insdide it
                var nodeToDelete = document.getElementById(sel.anchorNode.parentNode.getAttribute("id"));
                //console.log("we delete span with id=" + nodeToDelete.getAttribute("id"));
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
    } else if (document.selection && document.selection.type != "Control") { //legacy IE
        document.selection.createRange().pasteHTML(html);
    }
}
