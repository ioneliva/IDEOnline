//Note for this entire file - variable clickedItem is a global initialized in solutionExplorerUI representing target for menu
document.getElementById("openInTab").addEventListener("mousedown", openInTab);
document.getElementById("addFile").addEventListener("mousedown", createFile);
document.getElementById("addDir").addEventListener("mousedown", createDirectory);
document.getElementById("rename").addEventListener("mousedown", rename);

//open selected file into tab and editor
function openInTab() {
	let tab = document.getElementById(formatForTabId(clickedItem.id));

	if (clickedItem.classList.contains("file")) {
		if (tab) {		//if file is already present in tabs, we only open that tab
			setActiveTab(tab);
			setActiveEditor(getEditorLinkedTo(tab));
		} else {		//create new tab, named as the file
			let tab = createTabFor(clickedItem.id);
			setActiveTab(tab);
			let editor = attachNewEditorFor(tab);
			setActiveEditor(editor);
			//TODO: load contents of editor window from Save/Load Microservice
		}
	}
}

//create new directory
function createDirectory() {
	//show modal window, ask user for a name for the dir
	//todo
	//create structure for dir
	let li = document.createElement("li"),
		spanArrow = document.createElement("span"),
		spanDir = document.createElement("span"),
		ul = document.createElement("ul");
	spanArrow.className  = "expand";
	spanArrow.innerHTML ="&#9658";
	spanDir.className  = "interactive directory";
	spanDir.id = "newDir";
	spanDir.appendChild(document.createTextNode("newDir"));
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
}

//create new file
function createFile() {
	//show modal window, ask user for a name for the file
	//todo
	let li = document.createElement("li"),
		spanDecoration = document.createElement("span"),
		spanFile = document.createElement("span");

	spanDecoration.className = "decoration";
	spanDecoration.innerHTML = "&#124 ";
	spanFile.className = "interactive file";
	spanFile.id = "file2.cs";
	spanFile.appendChild(document.createTextNode("File2.cs"));
	li.appendChild(spanDecoration);
	li.appendChild(spanFile);
	//attach event listeners
	spanFile.addEventListener("contextmenu", showMenu);
	spanFile.addEventListener("click", selectWithOneClick);
	spanFile.addEventListener("dblclick", openElement);
	//append dir to existing structure. If there is a directory present, we make sure to insert before it in the tree
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
}

//rename file or dir
function rename() {
	//display modal to ask for a name
}
