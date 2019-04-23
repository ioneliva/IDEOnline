document.getElementsByClassName("activeTab")[0].addEventListener("click", clickOnTab);
document.getElementById("closeButton").addEventListener("click", closeTab);

//simple functions used so we don't have to remember the custom format for ids
//example: file.id=="123.cs_Parent", tab.id== "123.cs_Parent_tab", editor linked to it has id=="123.cs_Parent_editor"
function formatForEditorId(tabId) {
	return tabId.slice(0, -4) + "_editor";
}
function formatForTabId(fileName, parentName) {
	return fileName + "_" + parentName + "_tab";
}

//tab switching
function clickOnTab() {
	//if this is not already the active tab
	if (!this.classList.contains("activeTab")) {
		//set the tab clicked and linked editor window as active (also setting the old active ones as inactive)
		setActiveTab(this);
		setActiveEditor(document.getElementById(formatForEditorId(this.id)));
		//after a tab is switched, recalculate the number of lines in that window
		updateLineNumbering();
	}
}

//create a tab. Again, note the parent is part of the file tab name, to distinguish between files with same name
function createTabFor(fileName, parentName) {
	let newTab = document.createElement("div"),
		innerTab = document.createElement("div"),
		p = document.createElement("p"),
		closeBtn = document.createElement("button");

	//create structure for Tab
	newTab.id = formatForTabId(fileName, parentName);
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

	//set id for editor window to match the id of the linked tab
	newEditor.id = formatForEditorId(tab.id);
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
	let editorId = formatForEditorId(tab.id);
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
	let activeEditor = document.getElementsByClassName("activeEditorWindow")[0];
	if (activeEditor) {
		activeEditor.className = "hiddenEditorWindow";
	}
	editor.className = "activeEditorWindow";
	//recalculate line numbering for the new active editor
	updateLineNumbering();
}

//change name for tab and editor linked to it
function renameTab(tab, newName) {
	let editor = getEditorLinkedTo(tab);

	//get parent for file in tab (it doesn't change on rename)
	let tabIdWithoutSufix = tab.id.slice(0, -4);  //example: for tab id ="123.cs_Parent_tab", this would return "123.cs_Parent"
	let _charIndex = tabIdWithoutSufix.lastIndexOf("_");
	let parent = tabIdWithoutSufix.slice(_charIndex+1);

	tab.querySelector("p").textContent = newName;
	tab.id = formatForTabId(newName, parent);
	editor.id = formatForEditorId(tab.id);
}

//close a tab (and the editor window linked to it)
function closeTab(tab) {
	let allTabs;
	if (this.classList && !this.classList.contains("tab")) {	//the event originated from close tab button
		allTabs = this.parentElement.parentElement.parentElement;	//parent hierarchy looks like this  xButton <- innerTab <- Tab <-All Tabs 
		tab = this.parentElement.parentElement;
	} else { //event not originated from close tab button
		tab = document.getElementById(tab);
		if (!tab) {	//tab is already closed, nothing to do
			return;
		}
		allTabs = tab.parentElement;
	}
	//if the user closes the last tab present on the page, show an empty editor window that can't pe edited
	if (!tab.previousElementSibling && !tab.nextElementSibling) {
		//TODO: place an empty, non editable editor window to hold the content body open
	}
	else {
		//if user is trying to close the active tab, make previous tab the active one. If there is no previous, next tab becomes active
		let editorToBecomeActive;
		if (tab.className == "tab activeTab") {
			if (tab.previousElementSibling != null) {
				tab.previousElementSibling.className = "tab activeTab";
				editorToBecomeActive = document.getElementById(formatForEditorId(tab.previousElementSibling.id));
			} else {
				if (tab.previousElementSibling == null && tab.nextElementSibling) {
					tab.nextElementSibling.className = "tab activeTab";
					editorToBecomeActive = document.getElementById(formatForEditorId(tab.nextElementSibling.id));
				}
			}
			setActiveEditor(editorToBecomeActive);
		}
	}
	//remove editor window attached to tab
	let editor = document.getElementById(formatForEditorId(tab.id));
    //remove all listeners on tab and parents to avoid memory leak
	tab.removeEventListener("click", clickOnTab);
	tab.querySelector(".closeButton").removeEventListener("click", closeTab);
	//remove listeners on editor window, for the same reason
	editor.removeEventListener("keyup", keyUp);
	editor.removeEventListener("keydown", triggerOnDown);
	editor.removeEventListener("keydown", triggerOnDownCombos);
	editor.removeEventListener("cut", handleCut);
	editor.removeEventListener("paste", handlePaste);
	//remove attached editor
	editor.parentElement.removeChild(editor);
	//signal solution window this tab is closed
	//get file name from tab id  ex:filename.extension_parent_tab, we need filename.extension
	let _char = tab.id.indexOf("_"),
		fileNameInSolutionExplorer = tab.id.slice(0, _char);
	//document.getElementById(fileNameInSolutionExplorer).classList.remove("inTab");
    //remove parent tab
	allTabs.removeChild(tab);
}

//get current active editor window, as a Node
function getEditor() {
	return document.getElementsByClassName("activeEditorWindow")[0];
}