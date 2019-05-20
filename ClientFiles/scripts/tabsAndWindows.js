//simple functions used so we don't have to remember the custom format for ids
//example: file.id=="123.cs_Parent", tab.id== "123.cs_Parent_tab", editor linked to it has id=="123.cs_Parent_editor"
function formatForFileId(fileName, parentName) {	//input file name, parent name
	return fileName + "_" + parentName;				//output file.id
}
function formatForTabId(fileId) {					//input file.id
	return fileId + "_tab";							//output tab.id
}
function formatForEditorId(tabId) {					//input tab.id
	return tabId.slice(0, -4) + "_editor";			//output editor.id
}
function getFileNameFromFileId(fileId) {			//input id ="123.cs_Parent"
	let _charIndex = fileId.lastIndexOf("_");
	return fileId.slice(0, _charIndex);				//output  "123.cs"
}
function getFileIdFromTabId(tabId) {				//input tab.id
	return tabId.slice(0, -4);						//output file.id
}
function getEditorForFile(fileId) {		//input id= "123.cs_Parent"
	let editorObject = document.getElementById(fileId + "_editor");
	return editorObject;			//output: object representing the editor linked to the file id
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

//create a tab for a file
function createTabFor(fileId) {
	let newTab = document.createElement("div"),
		innerTab = document.createElement("div"),
		p = document.createElement("p"),
		closeBtn = document.createElement("button");

	//create structure for Tab
	newTab.id = formatForTabId(fileId);
	innerTab.className = "inner-tab";
	p.appendChild(document.createTextNode(getFileNameFromFileId(fileId)));
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
	//modify file in solution explorer to signal it is opened in tab
	fileId = fileId.replace(/\./g, "\\.");
	solExplFile = document.getElementById("solExplorerUL").querySelector("#" + fileId);
	solExplFile.classList.add("inTab");

	return newTab;
}

//create a new editor window and attach it, linking it to the parameter tab
function attachNewEditorFor(tab) {
	let newEditor = document.createElement("div"),
		contentSection = document.getElementById("content");

	//if this is the only editor added, remove placeholder
	let placeHolder = document.getElementById("initialFile.cs_placeholder_editor");
	if (placeHolder) {
		contentSection.removeChild(contentSection.firstElementChild);
	}
	//set id for editor window to match the id of the linked tab
	newEditor.id = formatForEditorId(tab.id);
	//set the rest of the attributes for the editor window
	newEditor.contentEditable = "true";
	newEditor.setAttribute("spellcheck", false);
	newEditor.setAttribute("type", "text");
	//get contents (locally) if file was modified previously and closed in this session
	let contents = getFileContents(getFileIdFromTabId(tab.id));
	if (contents != "") {
		newEditor.innerHTML = contents;
	}
	contentSection.insertBefore(newEditor, contentSection.firstChild);
	//listeners on the editor window, responsable for all the functionality
	newEditor.addEventListener("keyup", keyUp);
	newEditor.addEventListener("keydown", triggerOnDown);
	newEditor.addEventListener("keydown", triggerOnDownCombos);
	newEditor.addEventListener("cut", handleCut);
	newEditor.addEventListener("paste", handlePaste);
	
	return newEditor;
}

//attach empty placeholder editor (needed to keep the 'content' div from colapsing when empty)
function attachPlaceholderEditor() {
	let newEditor = document.createElement("div"),
		content = document.getElementById("content"),
		lineNumbering = document.getElementById("lineNumbering");;
	newEditor.id = "initialFile.cs_placeholder_editor";
	newEditor.className = "activeEditorWindow";
	newEditor.contentEditable = "false";
	content.insertBefore(newEditor, content.firstChild);
	while (lineNumbering.firstChild) {
		lineNumbering.removeChild(lineNumbering.firstChild);
	}
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

//change name for tab and editor linked to it to match a new fileId
function renameTab(tab, newFileNameId) {
	let editor = getEditorLinkedTo(tab);

	tab.querySelector("p").textContent = getFileNameFromFileId(newFileNameId);
	tab.id = formatForTabId(newFileNameId);
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
		attachPlaceholderEditor();
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
	//save contents of editor for future opening of it in this session
	saveFileForSession(getFileIdFromTabId(tab.id), editor.innerHTML);
	//remove attached editor
	editor.parentElement.removeChild(editor);
	//signal solution window this tab is closed
	let fileId = getFileIdFromTabId(tab.id);
	document.getElementById(fileId).classList.remove("inTab");
    //remove parent tab
	allTabs.removeChild(tab);
}

//get current active editor window, as a Node
function getEditor() {
	return document.getElementsByClassName("activeEditorWindow")[0];
}