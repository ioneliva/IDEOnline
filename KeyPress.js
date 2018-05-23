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

    if (window.event && e.keyCode) { // IE                    
        c = e.keyCode;
    } else if (e.which) { // Netscape/Firefox/Opera                   
        c = e.which;
    }

    //console.log("pressed " + c);
    //c = String.fromCharCode(c).toLowerCase();

    var xhr = new XMLHttpRequest();//used for posting

    switch (true) {
        case (c == 8 && word.length > 0):
            console.log("pressed backspace");
            word = word.substring(0, word.length - 1);
            break;
        case (c == 46 && word.length > 0):
            console.log("pressed delete");
            word = word.substr(1);
            break;
        case ((c >= 48 && c <= 57)||(c>=65 && c<=90)):
            console.log("pressed alphanumeric ");
            word += convert(c); //build a word
            break;
        case (c == 16 || c == 17 || c == 18                    //shift,ctr,alt 
                            ||(c>=112 && c<=123 )):            //F1-F12
            break;
        default:   //separator
            {
                console.log("pressed separator " + c);
                //console.log("text total: "+document.getElementById("inputTextWindow").innerText );

                //post the word+delimiter. On server side we analize the delimiter as well    
                xhr.open("POST", "http://localhost:5001/", true); //third parameter set to true represents async communication
                xhr.setRequestHeader('Content-Type', 'application/json');
                c = convert(c);
                var postJSON = JSON.stringify({ "word": word, "delimiter": c });
                xhr.send(postJSON);
                console.log("sent post: " + "word:" + word + ",delimiter:" + c);

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

//convert KeyCode into string symbol (String.fromCharCode() does not work for chars >=144 like ,/}[] etc)
//for values under 92 it uses the formula below. For above 96 it uses the keycode (apparently...)
//Firefox has exception keycodes for some symbols I will treat separate here
function convert(keyCode) {
    var chr;
    switch (keyCode) {
        case 222: chr = "'";
            break;
        case 220: chr = "\\";
            break;
        case 219: chr = "[";
            break;
        case 221: chr = "]";
            break;
        case 171: chr = "-";
    }
    let chrCode = keyCode - 48 * Math.floor(keyCode / 48);         
    chr = String.fromCharCode((96 <= keyCode) ? chrCode : keyCode);
    return chr.toLowerCase();
}


//replace first parameter with second
function replace(search, replace) {
    var sel = window.getSelection();
    var currentFocus = sel.focusNode;
    if (!currentFocus) {
        return;
    }

    if (currentFocus.nodeValue == null) { //pressed enter, need to focus on previous div, on the last word, as the current one would be empty
        if (currentFocus.previousSibling.lastChild.nodeValue != null) {
            //console.log("PREV SIBBLING IS " + currentFocus.previousSibling.lastChild);
            var startIndex = currentFocus.previousSibling.lastChild.nodeValue.indexOf(search);
        }
        else {//no text was entered, just a bunch of presses on the enter key
            return;
        }
    }
    else {
        var startIndex = currentFocus.nodeValue.indexOf(search);
    }
    var endIndex = startIndex + search.length;
    //console.log("replacing |" + search + "| in |" + currentFocus.nodeValue + "|");
    //console.log("startIndex=" + startIndex);
    //console.log("endIndex=" + endIndex);
    if (startIndex === -1) {
        return;
    }
    //console.log("focus node: ", sel.focusNode.nodeValue);
    var range = document.createRange();
    //Set the range to contain search text
    range.setStart(currentFocus, startIndex);
    range.setEnd(currentFocus, endIndex);
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
