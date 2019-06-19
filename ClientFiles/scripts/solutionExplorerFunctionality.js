//Note for this entire file - variable clickedItem is a global initialized in solutionExplorerUI representing target for menu

//event listeners for menu options clicks
document.getElementById("closeProject").addEventListener("mousedown", closeProject);
document.getElementById("openInTab").addEventListener("mousedown", openInTab);
document.getElementById("addFile").addEventListener("mousedown", createFile);
document.getElementById("addDir").addEventListener("mousedown", createDirectory);
document.getElementById("rename").addEventListener("mousedown", rename);
document.getElementById("delete").addEventListener("mousedown", del);
document.getElementById("run").addEventListener("mousedown", runProject);
document.getElementById("toolbar_RunBtn").addEventListener("mousedown", runProject);

//file structure for solution explorer
function createFileStructure(fileName, parentName) {
	let fileStructure = document.createElement("li"),
		spanDecoration = document.createElement("span"),
		spanFile = document.createElement("span");

	spanDecoration.className = "decoration";
	spanDecoration.innerHTML = "&#124 ";
	spanFile.className = "interactive file";
	spanFile.id = formatForFileId(fileName, parentName);
	spanFile.appendChild(document.createTextNode(fileName));
	fileStructure.appendChild(spanDecoration);
	fileStructure.appendChild(spanFile);
	//attach event listeners
	spanFile.addEventListener("contextmenu", showMenu);
	spanFile.addEventListener("click", selectWithOneClick);
	spanFile.addEventListener("dblclick", openElement);

	return fileStructure;
}

//directory structure for solution explorer
function createDirStructure(dirName) {
	let dirStructure = document.createElement("li"),
		spanArrow = document.createElement("span"),
		spanDir = document.createElement("span"),
		lineIcon = document.createElement("img"),
		ul = document.createElement("ul");

	spanArrow.className = "expand";
	spanArrow.innerHTML = "&#9658";
	spanDir.className = "interactive directory";
	lineIcon.className = "slEIcon";
	lineIcon.setAttribute("src", "imgs/folder.png");
	spanDir.id = dirName;
	spanDir.appendChild(lineIcon);
	spanDir.appendChild(document.createTextNode(dirName));
	ul.className = "nested";
	dirStructure.appendChild(spanArrow);
	dirStructure.appendChild(spanDir);
	dirStructure.appendChild(ul);
	//attach event listeners
	spanArrow.addEventListener("click", expandElementByArrow);
	spanDir.addEventListener("contextmenu", showMenu);
	spanDir.addEventListener("click", selectWithOneClick);
	spanDir.addEventListener("dblclick", expandElementByDbClick);

	return dirStructure;
}

//atach directory to existing structure in solution window
function attachDirToParent(dirStructure, parent) {
	parent.nextElementSibling.appendChild(dirStructure);
	//expand parent
	if (!parent.previousElementSibling.classList.contains("expand-down")) {
		expandElementByDbClick(parent);
	}
}

//atach file to existing structure in solution explorer
function attachFileToParent(fileStructure, parent) {
	//If there is a directory present, we make sure to insert before it in the tree
	let nextDir = parent.nextElementSibling.querySelector(".directory");
	if (nextDir) {
		nextDir.parentElement.parentElement.insertBefore(fileStructure, nextDir.parentElement);
	} else {
		parent.nextElementSibling.appendChild(fileStructure);
	}
	//expand parent
	if (!parent.previousElementSibling.classList.contains("expand-down")) {
		expandElementByDbClick(parent);
	}
}

//check for duplicate file name or dir in the same parent
function isDuplicate(inputType, element, name) {
	let ret = false;

	if (inputType == "file") {
		name = formatForFileId(name, element.id);
	}
	//format input to escape all the "." chars. Otherwise querrySelector would interpret "file extension .xx" as "className xx"
	name = name.replace(/\./g, "\\.");
	//find first duplicate
	let duplicate = element.nextElementSibling.querySelector("span[id=\"" + name + "\" i]"); //i represents case insensitive comparison
	if (duplicate) {
		ret = true;
	}
	return ret;
}

//check if input is valid, in context of the type expected
function isValidInput(inputType, input) {
	let regex,
		ret = false;

	if (inputType == "file") {
		regex = /^[a-zA-Z]+[a-zA-Z0-9\_\-]*\.[a-zA-Z]+$/i;	//alphanumeric,"_","-", ".", cannot start with a number ex: file_0.cpp
	}
	if (inputType == "project" || inputType == "directory") {
		regex = /^[a-zA-Z0-9\_\-]+$/i;		//alphanumeric,"_","-" ex: Work-Dir
	}
	if (input.match(regex) && input.length > 0) {
		ret = true;
	}
	return ret;
}

//open selected file into tab and editor
function openInTab(file) {
	if (clickedItem && (file instanceof MouseEvent)) {
		file = clickedItem;
	}
	let tab = document.getElementById(formatForTabId(file.id));

	if (file.classList.contains("file")) {
		if (tab && file.classList.contains("inTab")) {		//if this file is already present in tabs, we only open that tab
			setActiveTab(tab);
			setActiveEditor(getEditorLinkedTo(tab));
		} else {		//create new tab
			let tab = createTabFor(file.id);
			if (tab != null) {	//tab will be null if maximum number of tabs have been reached
				setActiveTab(tab);
				let editor = attachNewEditorFor(tab);
				setActiveEditor(editor);
			}
		}
	}
}

//create new directory in solution explorer
function createDirectory() {
	prepareUserDiagFor("newDir");
	document.getElementById("UserOkBtn").onclick = function doCreateDir() {
		let userInput = getUserInput(),
			dirStructure;

		if (isValidInput("directory", userInput)) {
			if (!isDuplicate("directory", clickedItem, userInput)) {
				dirStructure = createDirStructure(userInput);
				attachDirToParent(dirStructure, clickedItem);
				hideModal();
			}
			else {	//duplicate directory name in the same parent dir/project
				showDiagError("Wrong name, " + userInput + " already exists!");
			}
		}
		else {	//user pressed ok on an invalid input
			showDiagError(userInput + " is not a valid name for a directory!");
		}
		this.removeEventListener("click", doCreateDir);
	};
}

//create new file in solution explorer
function createFile() {
	prepareUserDiagFor("newFile");
	document.getElementById("UserOkBtn").onclick = function doCreateFile() {	//ok/Enter pressed
		let userInput = getUserInput(),
			fileStructure;

		if (isValidInput("file", userInput)) {
			if (!isDuplicate("file", clickedItem, userInput)) {
				fileStructure = createFileStructure(userInput, clickedItem.id);
				attachFileToParent(fileStructure, clickedItem);
				hideModal();
			}
			else {	//duplicate directory name in the same parent dir/project
				showDiagError("Wrong name, " + userInput + " already exists!");
			}
		}
		else {	//user pressed ok on an invalid input
			showDiagError(userInput + " is not a valid name for a file!");
		}
		this.removeEventListener("click", doCreateFile);
	};
}

//rename file or dir
function rename() {
	prepareUserDiagFor("rename");
	document.getElementById("UserOkBtn").onclick = function doRename() {	//ok button or Enter pressed for rename 
		let userInput = getUserInput(),
			inputType = "directory",
			hierarchyParent = clickedItem.parentElement.parentElement.previousElementSibling;

		if (clickedItem.classList.contains("file")) {
			inputType = "file";
		}
		else {
			if (clickedItem.classList.contains("project")) {
				inputType = "project";
			}
		}
		if (isValidInput(inputType, userInput)) {
			if (clickedItem.classList.contains("project")			//the project can be renamed without duplicate checks
				|| !isDuplicate(inputType, hierarchyParent, userInput)		//check for duplicate names in the same dir/project
				|| (isDuplicate(inputType, hierarchyParent, userInput)
						&& (userInput != clickedItem.textContent)
						&& (userInput.toLowerCase() == clickedItem.textContent.toLowerCase()))) {	//but allow self renaming duplicates ex: aaa->aAa
				//for files
				if (inputType == "file") {
					//rename tab and editor for this file (if currently opened)
					if (clickedItem.classList.contains("inTab")) {
						let tab = document.querySelector("div[id=\"" + formatForTabId(clickedItem.id) + "\" ]");
						if (tab) {
							renameTab(tab, formatForFileId(userInput, hierarchyParent.id));
						}
					}
					//rename file in solution window
					clickedItem.id = formatForFileId(userInput, hierarchyParent.id);
					clickedItem.lastChild.textContent = userInput;
				}
				else { //for directories and project
					if (inputType == "project") { //signal the change to Save/Load Microservice so this project doesn't remain untracked in the database
						signalProjectRename(clickedItem.lastChild.textContent, userInput);
					}
					let directChild = clickedItem.nextElementSibling.firstElementChild;
					while (directChild) {	//directory is not empty
						//find direct descendant files
						if (directChild.firstElementChild.nextElementSibling.classList.contains("file")) {
							let descendantFile = directChild.firstElementChild.nextElementSibling;
							//changes to (any opened) tabs and editors id linked to descendant files
							if (descendantFile.classList.contains("inTab")) {
								let tab = document.querySelector("div[id=\"" + formatForTabId(descendantFile.id) + "\" ]");
								renameTab(tab, formatForFileId(getFileNameFromFileId(descendantFile.id), userInput));
							}
							//changes to direct descendant file id's
							descendantFile.id = formatForFileId(getFileNameFromFileId(descendantFile.id), userInput);
						}
						directChild = directChild.nextElementSibling;
					}
					//finally change directory name in solution window
					clickedItem.id = userInput;
					clickedItem.lastChild.textContent = userInput;
				}
				hideModal();
			}
			else {
				showDiagError("Wrong name, " + userInput + " already exists!");
			}
		} else {
			showDiagError(userInput + " is not a valid name for a" + inputType + "!");
		}
		document.getElementById("UserOkBtn").removeEventListener("click", doRename);
	};
}

//signal Save/Load Microservice about project rename
function signalProjectRename(project, newName) {
	let token = localStorage.getItem("JWT") || sessionStorage.getItem("JWT");

	if (saveMicroservice.state == "running") {
		saveMicroservice.state = "busy";
		setIconForMicroservice("saveMicroservice", "busy");
	}
	let startPing = new Date();
	fetch(apiGateway + "/projectManager/renameProject", {
		method: 'POST',
		body: JSON.stringify({
			"project": project,
			"newName": newName
		}),
		headers: {
			'Content-Type': 'application/json',
			'Authorization': "Bearer " + token
		}
	}).then(response => {	//success callback
		//get statistical data about access data and ping
		saveMicroservice.accessedDate = new Date();
		saveMicroservice.state = "running";
		setIconForMicroservice("saveMicroservice", "running");
		saveMicroservice.ping = saveMicroservice.accessedDate - startPing;
		return response.json();
	}).catch(error => {	//fail callback
		if (error == "TypeError: NetworkError when attempting to fetch resource.") {
			saveMicroservice.state = "down";
			setIconForMicroservice("saveMicroservice", "down");
		}
	});
}

//delete file or dir
function del() {	//note: "delete" is a reserved word in JavaScript
	prepareUserDiagFor("delete");
	document.getElementById("UserOkBtn").onclick = function doDelete() {	//yes button pressed for delete
		let parent = clickedItem.parentElement;
		if (clickedItem.classList.contains("file")) {	//file deletion
			//close tab and editor for file
			closeTab(formatForTabId(clickedItem.id));
			//deleting
			parent.removeChild(clickedItem.previousElementSibling);
			parent.removeChild(clickedItem);
			parent.parentElement.removeChild(parent);
		} else {	//dir deletion
			if (clickedItem.nextElementSibling.firstElementChild) {	//directory is not empty
				let dirContents = clickedItem.nextElementSibling.querySelectorAll(".file");
				for (let i = 0; i < dirContents.length; i++) {
					//closing each file tab and editor
					closeTab(formatForTabId(dirContents[i].id));
				}
			}
			//deleting
			while (parent.firstElementChild) {
				parent.removeChild(parent.firstElementChild);
			}
			parent.parentElement.removeChild(parent);
		}
		document.getElementById("UserOkBtn").removeEventListener("click", doDelete);
		hideModal();
	};
}

//close project by user (will present a warning window)
function closeProject() {
	prepareUserDiagFor("closeProject");
	document.getElementById("UserOkBtn").addEventListener("click", doCloseProject);
}

//close project by program (no user interaction, no warning)
function doCloseProject() {
	let root = document.getElementsByClassName("project")[0];
	//dir deletion, similar to delete function, except we are not deleting the root itself
	if (root.nextElementSibling.firstElementChild) {	//project not empty
		let rootContent = root.nextElementSibling.querySelectorAll(".file");
		for (let i = 0; i < rootContent.length; i++) {
			//closing each file tab and editor
			closeTab(formatForTabId(rootContent[i].id));
		}
	}
	//deleting
	while (root.nextElementSibling.firstElementChild) {
		root.nextElementSibling.removeChild(root.nextElementSibling.firstElementChild);
	}
	//rename root to a default placeholder, so we don't eliminate it from the DOM
	root.lastChild.nodeValue = "root";
	root.id = "root";
	//hide root to make it seem like it's deleted
	document.getElementById("solExplorerUL").style.display = "none";
	//the next 2 lines fire only when there is user interaction and nothing will happend otherwise
	document.getElementById("UserOkBtn").removeEventListener("click", doCloseProject);
	hideModal();
}

//run project
function runProject() {
	let runResultsWindow = document.getElementById("runResultsContent");

	//show run results window
	runResultsWindow.innerText = "please wait...compiling...";
	document.getElementById("runResults").style.display = "block";
	//block user from making another request for compile while the microservice is still processing his old one
	document.getElementById("toolbar_RunBtn").classList.add("disabledBtn");
	document.getElementById("run").classList.add("disabledBtn");

	if (runMicroservice.state == "running") {
		runMicroservice.state = "busy";
		setIconForMicroservice("runMicroservice", "busy");
	}
	let startPing = new Date();
	//swap the next commented line in to see Roslyn compiler work instead of the CLI
	//fetch(apiGateway + "/run/Roslyn", {
	fetch(apiGateway + "/run", {
		method: 'POST',
		body: JSON.stringify(fileTreeToObject(true)),	//this function is defined in saveLoad.js
		headers: {
			'Content-Type': 'application/json'
		}
	}).then(response => {	//success callback
		//get statistical data about access data and ping
		runMicroservice.accessedDate = new Date();
		runMicroservice.state = "running";
		setIconForMicroservice("runMicroservice", "running");
		runMicroservice.ping = runMicroservice.accessedDate - startPing;
		//enable elements that allow the user to make another run request
		document.getElementById("toolbar_RunBtn").classList.remove("disabledBtn");
		document.getElementById("run").classList.remove("disabledBtn");
		return response.json();
	}).then(response => {
		runResultsWindow.innerText = response.successResult;
		runResultsWindow.innerText += response.errResult;
	}).catch(error => {	//fail callback
		if (error == "TypeError: NetworkError when attempting to fetch resource.") {
			runMicroservice.state = "down";
			setIconForMicroservice("runMicroservice", "down");
			runResultsWindow.innerText = "Compile/Run Microservice is down...\nTry again later";
			document.getElementById("toolbar_RunBtn").classList.remove("disabledBtn");
			document.getElementById("run").classList.remove("disabledBtn");
		}
	});
}