//Note for this entire file - variable clickedItem is a global initialized in solutionExplorerUI representing target for menu

//event listeners for hiding dialogue window
window.addEventListener("keydown", handleKeyboardForRename);
window.addEventListener("resize", hideModal);
//event listeners for menu options clicks
document.getElementById("openInTab").addEventListener("mousedown", openInTab);
document.getElementById("addFile").addEventListener("mousedown", createFile);
document.getElementById("addDir").addEventListener("mousedown", createDirectory);
document.getElementById("rename").addEventListener("mousedown", rename);
document.getElementById("delete").addEventListener("mousedown", del);

//user pressed Esc or Enter
function handleKeyboardForRename(e) {
	if (readMyPressedKey(e) == "Escape") {
		document.getElementById("userDiag").style.display = "none";
	} else {
		if (readMyPressedKey(e) == "Enter") {
			document.getElementById("UserOkBtn").click();
		}
	}
}
//hide modal when user clicks outside the dialogue (or on the modalCloseBtn)
function hideModal(e) {
	let tg = event.target || e.target || window.event.target;
	if (tg != document.getElementById("userDiag") && tg != document.getElementById("modalText") && tg != document.getElementById("UserOkBtn")
			&& tg != document.getElementById("userInput") && tg != document.getElementsByClassName("modal")[0]) {
		document.getElementById("userDiag").style.display = "none";
		document.getElementById("userInput").value = "";
	}
}

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

//prepare user dialogue for operation
function prepareUserDiag(purpose) {
	//remove listener that hides on mouse click. Because of the delay on setTimeout, it would hide the dialogue before it would appear
	window.removeEventListener("mousedown", hideModal);
	switch (purpose) {
		case "rename":
			document.getElementById("modalText").textContent = "Rename to:";
			break;
		case "newFile":
			document.getElementById("modalText").textContent = "New file name:";
			break;
		case "newDir":
			document.getElementById("modalText").textContent = "New directory name:";
	}
	let diagWindow = document.getElementById("userDiag");
	diagWindow.style.display = "block";
	//bring modal to mouse coords
	diagWindow.style.left = menuOriginX;
	diagWindow.style.top = menuOriginY;
	//cannot give focus to an element before it is moved and rendered by the page. Wait 1 ms for that
	setTimeout(function () {
		document.getElementById("userInput").focus();
		//add listener for hiding on click outside the dialogue box
		window.addEventListener("mousedown", hideModal);
	}, 1);
}

//create new directory
function createDirectory() {
	prepareUserDiag("newDir");
	document.getElementById("UserOkBtn").addEventListener("click", doCreateDir);
}
//ok pressed
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
	lineIcon.setAttribute("src","imgs/folder.png");
	let userInput = document.getElementById("userInput").value;
	if (userInput.length > 0) {
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
		document.getElementById("userDiag").style.display = "none";
	}
	document.getElementById("UserOkBtn").removeEventListener("click", doCreateDir);
}

//create new file
function createFile() {
	prepareUserDiag("newFile");
	document.getElementById("UserOkBtn").addEventListener("click", doCreateFile);
}
//ok pressed
function doCreateFile() {
	let li = document.createElement("li"),
		spanDecoration = document.createElement("span"),
		spanFile = document.createElement("span");
		//lineIcon = document.createElement("img");

	spanDecoration.className = "decoration";
	spanDecoration.innerHTML = "&#124 ";
	spanFile.className = "interactive file";
	//lineIcon.className = "slEIcon";
	//lineIcon.setAttribute("src", "imgs/file1.png");
	let userInput = document.getElementById("userInput").value;
	if (userInput.length > 0) {
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
		document.getElementById("userDiag").style.display = "none";
	}
	document.getElementById("UserOkBtn").removeEventListener("click", doCreateFile);
}

//rename file or dir
function rename() {
	prepareUserDiag("rename");
	document.getElementById("UserOkBtn").addEventListener("click", doRename);
}
//ok button on modal dialogue
function doRename() {
	let userInput = document.getElementById("userInput").value;
	if (userInput.length > 0) {
		clickedItem.textContent = document.getElementById("userInput").value;
		document.getElementById("userDiag").style.display = "none";
	}
	document.getElementById("UserOkBtn").removeEventListener("click", doRename);
}

//delete file or dir
function del() {	//"delete" is a reserved word
	let parent = clickedItem.parentElement;;
	if (clickedItem.classList.contains("file")) {
		parent.removeChild(clickedItem.previousElementSibling);
		parent.removeChild(clickedItem);
		parent.parentElement.removeChild(parent);
	} else {
		while (parent.firstElementChild) {
			parent.removeChild(parent.firstElementChild);
		}
		parent.parentElement.removeChild(parent);
	}
}
