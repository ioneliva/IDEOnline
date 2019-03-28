var tabPageNo = 1;

if (document.addEventListener) {                // For all major browsers, except IE<8
    document.getElementById("activeTab").addEventListener("click", clickOnTab); //init, this is the default tab
    document.getElementById("newTab").addEventListener("click", clickOnTab);
    document.getElementById("closeButton").addEventListener("click", closeTab);
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
        /*
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
        */

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
