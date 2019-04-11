var tabPageNo = 1;

document.getElementById("activeTab").addEventListener("click", clickOnTab);
document.getElementById("newTab").addEventListener("click", clickOnTab);
document.getElementById("closeButton").addEventListener("click", closeTab);

function clickOnTab() {
    if (this.className == "tab newTab") { //user clicked on the + tab
        //old active tab becomes innactive
        let activeTab = document.getElementById("activeTab");
        if (activeTab) {
            activeTab.id = "oldTab";
            activeTab.className = "tab";
		}
		//hide old editor window
		let activeWindow = document.getElementsByClassName("activeEditorWindow")[0];
		activeWindow.className = "hiddenEditorWindow";
		//transform this "+" tab into active tab
		createActiveTabFrom(this);
        //create and attach a new editor window to newly formed tab
		attachNewEditorFor(this);
        //recreate and attach the "+" tab again, after the last tab
		createPlusTab();
    }
    else { //user clicked on an old tab
        //find current active tab and active editor window
		let activeTab = document.getElementById("activeTab");
		let activeWindow = document.getElementsByClassName("activeEditorWindow")[0];
        //make them inactive
        activeTab.id = "oldTab";
		activeTab.className = "tab";
		activeWindow.className = "hiddenEditorWindow";
        //set the tab clicked and linked editor window as active
        this.id = "activeTab";
		this.className = "tab activeTab";
		//note -the linked editor window has the id of the file name text inside tab
		document.getElementById(this.firstElementChild.firstElementChild.innerHTML).className ="activeEditorWindow";
	}
	//after a tab is switched we need to recalculate the number of lines in that window
	updateLineNumbering();
}

//create a new editor window and attach it, linking it to the parameter
function attachNewEditorFor(tab) {
	let newEditor = document.createElement("div");
	//set id for editor window to match the name user selected in the linked tab
	let id = tab.firstElementChild.firstElementChild.innerHTML;
	newEditor.id = id;
	//set the rest of the attributes for the editor window
	newEditor.className = "activeEditorWindow";
	newEditor.contentEditable = "true";
	newEditor.setAttribute("spellcheck", false);
	newEditor.setAttribute("type", "text");
	document.getElementById("content").insertBefore(newEditor, document.getElementById("content").firstChild);
	//listeners on the editor window, responsable for all the functionality
	newEditor.addEventListener("keyup", keyUp);
	newEditor.addEventListener("keydown", triggerOnDown);
	newEditor.addEventListener("keydown", triggerOnDownCombos);
	newEditor.addEventListener("cut", handleCut);
	newEditor.addEventListener("paste", handlePaste);
}

//create the plus tab (representing a button for creating a new tab)
function createPlusTab() {
	let newTab = document.createElement("div");
	newTab.id = "newPage";
	newTab.className = "tab newTab";
	let innerTab = document.createElement("div");
	innerTab.className = "inner-tab";
	let par = document.createElement("p");
	par.innerHTML = "+";
	innerTab.appendChild(par);
	newTab.appendChild(innerTab);
	document.getElementById("tabs").appendChild(newTab);
	newTab.addEventListener("click", clickOnTab);
}

//transform the "+" into an active tab, with the default tab structure
function createActiveTabFrom(plusTab) {
	plusTab.id = "activeTab";
	plusTab.className = "tab activeTab";
	//transform inner div	(name values are hardcoded for now, to filexx.cs, until save function is functional)
	let par = document.createElement("p");
	par.innerHTML = "file" + tabPageNo + ".cs";
	plusTab.firstElementChild.removeChild(plusTab.firstElementChild.firstElementChild);
	plusTab.firstElementChild.appendChild(par);
	//add a close button
	addCloseButtonTo(plusTab);
	tabPageNo++;
}

//add a close button to parameter container, with event listeners
function addCloseButtonTo(container) {
	let closeBtn = document.createElement("button");
	closeBtn.id = "closeButton";
	closeBtn.className = "closeButton";
	closeBtn.innerHTML = "x";
	closeBtn.addEventListener("click", closeTab);
	//add the button to firstchild
	container.firstElementChild.appendChild(closeBtn);
}

//closing a tab (and the editor window linked to it)
function closeTab() {
	let allTabs = this.parentElement.parentElement.parentElement;	//parent hierarchy looks like this  xButton <- innerTab <- Tab <-All Tabs 
    let tab = this.parentElement.parentElement;

	//if the user closes the last tab present on the page, show an empty editor window that can't pe edited
	if (tab.previousElementSibling == null && tab.nextElementSibling.className == "tab newTab") {
		//TODO: Later, when I decide on a background for "no interface present"
	}
    //if user is trying to close the active tab, make previous tab the active one. If there is no previous, next tab becomes active
	if (tab.className == "tab activeTab") {
		if (tab.previousElementSibling != null) {
            tab.previousElementSibling.id = "activeTab";
			tab.previousElementSibling.className = "tab activeTab";
			//make editor window linked to the previous tab the active one
			let editorToBecomeActive = document.getElementById(tab.previousElementSibling.firstElementChild.firstElementChild.innerHTML);
			editorToBecomeActive.className = "activeEditorWindow";
		} else {
			if (tab.previousElementSibling == null && tab.nextElementSibling.className != "tab newTab") {
                tab.nextElementSibling.id = "activeTab";
				tab.nextElementSibling.className = "tab activeTab";
				let editorToBecomeActive = document.getElementById(tab.nextElementSibling.firstElementChild.firstElementChild.innerHTML);
				editorToBecomeActive.className = "activeEditorWindow";
            }
        }
	}
	//remove editor window attached to tab
	let editor = document.getElementById(tab.firstElementChild.firstElementChild.innerHTML);
    //remove all listeners on tab and parents to avoid memory leak
    tab.removeEventListener("click", clickOnTab);
	this.removeEventListener("click", closeTab);
	//remove listeners on editor window, for the same reason
	editor.removeEventListener("keyup", keyUp);
	editor.removeEventListener("keydown", triggerOnDown);
	editor.removeEventListener("keydown", triggerOnDownCombos);
	editor.removeEventListener("cut", handleCut);
	editor.removeEventListener("paste", handlePaste);
	//remove attached editor
	editor.parentElement.removeChild(editor);
    //remove parent tab
	allTabs.removeChild(tab);
}

//get current active editor window, as a Node
function getEditor() {
	return document.getElementsByClassName("activeEditorWindow")[0];
}