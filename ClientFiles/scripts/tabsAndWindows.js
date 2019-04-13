document.getElementsByClassName("activeTab")[0].addEventListener("click", clickOnTab);
document.getElementById("closeButton").addEventListener("click", closeTab);

//simple functions used so we don't have to remember the custom format for ids
function formatForEditorId(str) {
	return str + "_editor";
}
function formatForTabId(str) {
	return str + "_tab";
}

//tab switching
function clickOnTab() {
	//if this is already the active tab, don't do anything
	if (!this.classList.contains("activeTab")) {
		//set the tab clicked and linked editor window as active (also setting the old active ones as inactive)
		setActiveTab(this);
		setActiveEditor(document.getElementById(formatForEditorId(this.firstElementChild.firstElementChild.innerHTML)));
		//after a tab is switched, recalculate the number of lines in that window
		updateLineNumbering();
	}
}

//create a tab
function createTabFor(fileName) {
	let newTab = document.createElement("div"),
		innerTab = document.createElement("div"),
		p = document.createElement("p"),
		closeBtn = document.createElement("button");

	//create structure for Tab
	newTab.id = formatForTabId(fileName);
	innerTab.className = "inner-tab";
	p.appendChild(document.createTextNode(fileName));
	closeBtn.innerHTML = "x";
	closeBtn.id = "closeButton";
	closeBtn.className = "closeButton";
	//listener for close button
	closeBtn.addEventListener("click", closeTab);
	//attach the structure parts
	innerTab.appendChild(p);
	innerTab.appendChild(closeBtn);
	newTab.appendChild(innerTab);
	//listener for this tab
	newTab.addEventListener("click", clickOnTab);
	//put the new tab before the others
	let tabsParent = document.getElementById("tabs");
	tabsParent.insertBefore(newTab, tabsParent.firstChild);

	return newTab;
}

//create a new editor window and attach it, linking it to the parameter
function attachNewEditorFor(tab) {
	let newEditor = document.createElement("div");

	//set id for editor window to match the name in the linked tab
	newEditor.id = formatForEditorId(tab.firstElementChild.firstElementChild.innerHTML);
	//set the rest of the attributes for the editor window
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
	
	return newEditor;
}

//get editor linked to a tab
function getEditorLinkedTo(tab) {
	//example: tab.id== "123.cs_tab", editor linked to it has id=="123.cs_editor"
	let editorId = formatForEditorId(tab.id.slice(0, -4));
	return document.getElementById(editorId);
}

//set tab as active tab
function setActiveTab(tab) {
	//do something only if the tab is not already the active tab
	if (!tab.classList.contains("activeTab")) {
		//old active tab becomes innactive
		let activeTab = document.getElementsByClassName("activeTab")[0];
		if (activeTab) {
			activeTab.className = "tab";
		}
		//make this tab the active tab
		tab.className = "tab activeTab";
	}
}

//set editor as active editor window
function setActiveEditor(editor) {
	let activeWindow = document.getElementsByClassName("activeEditorWindow")[0];
	activeWindow.className = "hiddenEditorWindow";
	editor.className = "activeEditorWindow";
	//recalculate line numbering for the new active editor
	updateLineNumbering();
}

//close a tab (and the editor window linked to it)
function closeTab() {
	let allTabs = this.parentElement.parentElement.parentElement;	//parent hierarchy looks like this  xButton <- innerTab <- Tab <-All Tabs 
    let tab = this.parentElement.parentElement;

	//if the user closes the last tab present on the page, show an empty editor window that can't pe edited
	if (!tab.previousElementSibling && !tab.nextElementSibling) {
		console.log("closed last tab");
		//TODO: Later, when I decide on a background for "no interface present"
	}
    //if user is trying to close the active tab, make previous tab the active one. If there is no previous, next tab becomes active
	if (tab.className == "tab activeTab") {
		if (tab.previousElementSibling != null) {
			tab.previousElementSibling.className = "tab activeTab";
			//make editor window linked to the previous tab the active one
			let editorToBecomeActive = document.getElementById(formatForEditorId(tab.previousElementSibling.firstElementChild.firstElementChild.innerHTML));
			editorToBecomeActive.className = "activeEditorWindow";
		} else {
			if (tab.previousElementSibling == null && tab.nextElementSibling) {
				tab.nextElementSibling.className = "tab activeTab";
				let editorToBecomeActive = document.getElementById(formatForEditorId(tab.nextElementSibling.firstElementChild.firstElementChild.innerHTML));
				editorToBecomeActive.className = "activeEditorWindow";
            }
        }
	}
	//remove editor window attached to tab
	let editor = document.getElementById(formatForEditorId(tab.firstElementChild.firstElementChild.innerHTML));
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