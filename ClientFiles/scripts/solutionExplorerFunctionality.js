//Note for this entire file - variable clickedItem is a global initialized in solutionExplorerUI representing target for menu

//event listeners for menu options clicks
document.getElementById("openInTab").addEventListener("mousedown", openInTab);
document.getElementById("addFile").addEventListener("mousedown", createFile);
document.getElementById("addDir").addEventListener("mousedown", createDirectory);
document.getElementById("rename").addEventListener("mousedown", rename);
document.getElementById("delete").addEventListener("mousedown", del);

//open selected file into tab and editor
function openInTab(file) {
	if (clickedItem && (file instanceof MouseEvent)) {
		file = clickedItem;
	}
	let parent = file.parentElement.parentElement.previousElementSibling.id,
		tab = document.getElementById(formatForTabId(file.id, parent));

	if (file.classList.contains("file")) {
		if (tab && file.classList.contains("inTab")) {		//if this file is already present in tabs, we only open that tab
			setActiveTab(tab);
			setActiveEditor(getEditorLinkedTo(tab));
		} else {		//create new tab, named as the file+fileParent (important, to distinguish between files with the same name!)
			let tab = createTabFor(file.id, parent);
			setActiveTab(tab);
			file.classList.add("inTab");
			let editor = attachNewEditorFor(tab);
			setActiveEditor(editor);
			//TODO: load contents of editor window from Save/Load Microservice
		}
	}
}

//create new directory
function createDirectory() {
	prepareUserDiag("newDir");
	document.getElementById("UserOkBtn").addEventListener("click", doCreateDir);
}
//ok/Enter pressed for new dir
function doCreateDir() {
	let li = document.createElement("li"),
		spanArrow = document.createElement("span"),
		spanDir = document.createElement("span"),
		lineIcon = document.createElement("img"),
		ul = document.createElement("ul");

	spanArrow.className  = "expand";
	spanArrow.innerHTML ="&#9658";
	spanDir.className = "interactive directory";
	lineIcon.className = "slEIcon";
	lineIcon.setAttribute("src", "imgs/folder.png");
	let userInput = getUserInput();
	if (isValidInput("directory", userInput)) {
		if (!isDuplicate(clickedItem, userInput)) {
			spanDir.id = userInput;
			spanDir.appendChild(lineIcon);
			spanDir.appendChild(document.createTextNode(userInput));
			ul.className = "nested";
			li.appendChild(spanArrow);
			li.appendChild(spanDir);
			li.appendChild(ul);
			//attach event listeners
			spanArrow.addEventListener("click", expandElementByArrow);
			spanDir.addEventListener("contextmenu", showMenu);
			spanDir.addEventListener("click", selectWithOneClick);
			spanDir.addEventListener("dblclick", expandElementByDbClick);
			//append dir to existing structure
			clickedItem.nextElementSibling.appendChild(li);
			//expand node that originated the comand
			if (!clickedItem.previousElementSibling.classList.contains("expand-down")) {
				expandElementByDbClick();
			}
			hideModal();
		}
		else {	//duplicate directory name in the same parent dir/project
			showDiagError("Wrong name, " + userInput + " already exists!");
		}
	}
	else {	//user pressed ok on an invalid input
		showDiagError(userInput + " is not a valid name for a directory!");
	}
	document.getElementById("UserOkBtn").removeEventListener("click", doCreateDir);
}

//create new file
function createFile() {
	prepareUserDiag("newFile");
	document.getElementById("UserOkBtn").addEventListener("click", doCreateFile);
}
//ok/Enter pressed for new file
function doCreateFile() {
	let li = document.createElement("li"),
		spanDecoration = document.createElement("span"),
		spanFile = document.createElement("span");

	spanDecoration.className = "decoration";
	spanDecoration.innerHTML = "&#124 ";
	spanFile.className = "interactive file";
	let userInput = getUserInput();
	if (isValidInput("file", userInput)) {
		if (!isDuplicate(clickedItem, userInput)) {
			spanFile.id = userInput;
			//spanFile.appendChild(lineIcon);
			spanFile.appendChild(document.createTextNode(userInput));
			li.appendChild(spanDecoration);
			li.appendChild(spanFile);
			//attach event listeners
			spanFile.addEventListener("contextmenu", showMenu);
			spanFile.addEventListener("click", selectWithOneClick);
			spanFile.addEventListener("dblclick", openElement);
			//append file to existing structure. If there is a directory present, we make sure to insert before it in the tree
			let nextDir = clickedItem.nextElementSibling.querySelector(".directory");
			if (nextDir) {
				nextDir.parentElement.parentElement.insertBefore(li, nextDir.parentElement);
			} else {
				clickedItem.nextElementSibling.appendChild(li);
			}
			//expand node that originated the comand
			if (!clickedItem.previousElementSibling.classList.contains("expand-down")) {
				expandElementByDbClick();
			}
			hideModal();
		}
		else {	//duplicate directory name in the same parent dir/project
			showDiagError("Wrong name, " + userInput + " already exists!");
		}
	}
	else {	//user pressed ok on an invalid input
		showDiagError(userInput + " is not a valid name for a file! try filename.extension");
	}
	document.getElementById("UserOkBtn").removeEventListener("click", doCreateFile);
}

//check for duplicate file name or dir in the same project
function isDuplicate(element, name) {
	let ret = false;
	//format input to escape all the "." chars. Otherwise querrySelector would iterpret ".xx" as "className xx"
	name = name.replace(/\./g, "\\.");
	//find first duplicate
	let duplicate = element.nextElementSibling.querySelector("span[id=\""+name+"\" i]"); //i represents case insensitive comparison
	if (duplicate) {
		ret = true;
	}
	return ret;
}

//rename file or dir
function rename() {
	prepareUserDiag("rename");
	document.getElementById("UserOkBtn").addEventListener("click", doRename);
}
//ok button or Enter pressed for rename 
function doRename() {
	let userInput = getUserInput(),
		inputType ="directory",
		hierarchyParent = clickedItem.parentElement.parentElement.previousElementSibling;

	if (clickedItem.classList.contains("file")) {
		inputType = "file";
	}
	if (isValidInput(inputType, userInput)) {
		if (clickedItem.classList.contains("project")			//the project can be renamed without duplicate checks
				|| !isDuplicate(hierarchyParent, userInput)		//check for duplicate names in the same dir/project
				|| userInput.toLowerCase() == clickedItem.textContent.toLowerCase()) {	//but allow self renaming duplicates ex: aaa->aAa
			//for files
			if (inputType == "file") {
				if (clickedItem.classList.contains("inTab")) {
					let tab = document.querySelector("div[id=\"" + formatForTabId(clickedItem.id, hierarchyParent.id) + "\" ]");
					if (tab) {
						renameTab(tab, userInput)
					}
				}
			}
			else { //for directories and project
				let directChild = clickedItem.nextElementSibling.firstElementChild;
				while (directChild) {	//directory is not empty
					//find direct descendant files that are open in tab
					if (directChild.firstElementChild.nextElementSibling.classList.contains("file")
							&& directChild.firstElementChild.nextElementSibling.classList.contains("inTab")) {
						let fileInTab = directChild.firstElementChild.nextElementSibling,
							tab = document.querySelector("div[id=\"" + formatForTabId(fileInTab.id, clickedItem.id) + "\" ]"),
							editor = getEditorLinkedTo(tab);

						tab.id = formatForTabId(fileInTab.id, userInput);
						editor.id = formatForEditorId(tab.id);
					}
					directChild = directChild.nextElementSibling;
				}
			}
			//rename in solution window
			clickedItem.id = userInput;
			clickedItem.lastChild.textContent = userInput;
			hideModal();
		}
		else {
			showDiagError("Wrong name, " + userInput + " already exists!");
		}
	} else {
		showDiagError(userInput + " is not a valid name for a directory!");
	}
	document.getElementById("UserOkBtn").removeEventListener("click", doRename);
}

//delete file or dir
function del() {	//"delete" is a reserved word
	prepareUserDiag("delete");
	document.getElementById("UserOkBtn").addEventListener("click", doDelete);
}
//yes button pressed for delete
function doDelete() {
	let parent = clickedItem.parentElement;
	if (clickedItem.classList.contains("file")) {	//file deletion
		//close tab and editor for file
		let hierarchyParent = clickedItem.parentElement.parentElement.previousElementSibling;
		closeTab(formatForTabId(clickedItem.id, hierarchyParent.id));
		//deleting
		parent.removeChild(clickedItem.previousElementSibling);
		parent.removeChild(clickedItem);
		parent.parentElement.removeChild(parent);
	} else {	//dir deletion
		if (clickedItem.nextElementSibling.firstElementChild) {	//directory is not empty
			let dirContents = clickedItem.nextElementSibling.querySelectorAll(".file");
			for (let i = 0; i < dirContents.length; i++) {
				//closing each file tab and editor
				let hierarchyParent = dirContents[i].parentElement.parentElement.previousElementSibling;
				closeTab(formatForTabId(dirContents[i].id, hierarchyParent.id));
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
}
