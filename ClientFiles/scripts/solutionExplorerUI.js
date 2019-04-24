var clickedItem, mouseOriginalX, mouseOriginalY;

//listeners
let expandableElement = document.getElementsByClassName("expand");
let interactiveElements = document.getElementsByClassName("interactive");
let i;
for (i = 0; i < expandableElement.length; i++) {
	expandableElement[i].addEventListener("click", expandElementByArrow);
}
for (i = 0; i < interactiveElements.length; i++) {
	interactiveElements[i].addEventListener("contextmenu", showMenu);
	interactiveElements[i].addEventListener("click", selectWithOneClick);
	interactiveElements[i].addEventListener("dblclick", openElement);
}
window.addEventListener("resize", hideMenu);
document.addEventListener("mousedown", hideMenu);
document.addEventListener("keydown", hideMenuOnEscape);

//expand/collapse expandable element by clicking the arrow symbol
function expandElementByArrow(e) {
	let target = e.target || e.srcElement;
	target.nextElementSibling.nextElementSibling.classList.toggle("active");
	target.classList.toggle("expand-down");
}

//get item clicked (save it for later use)
function getClickedItem(e) {
	clickedItem = e.target || e.srcElement;
	//user tried to iteract with a decorative element, like the icon
	if (clickedItem.classList.contains("slEIcon")) {
		clickedItem = clickedItem.parentElement;
	}
	return clickedItem;
}

//expand/collapse expandable element by double clicking it with the mouse
function expandElementByDbClick(element) {
	if (!element) {
		element = clickedItem;
	}
	element.nextElementSibling.classList.toggle("active");
	element.previousElementSibling.classList.toggle("expand-down");
}

//open file in tab on double click (or expand directory tree)
function openElement(e) {
	clickedItem = getClickedItem(e);
	if (clickedItem.classList.contains("file")) {
		openInTab(clickedItem);
	} else {
		if (clickedItem.classList.contains("project") || clickedItem.classList.contains("directory")) {
			expandElementByDbClick();
		}
	}
}

//select item in solution explorer (similar to a selection with the mouse or holdig Shift key)
function selectItem(item) {
	let range = document.createRange(),
		sel = window.getSelection();

	if (item && (item instanceof HTMLSpanElement)) {
		range.setStartBefore(item);
		range.setEndAfter(item);
		sel.removeAllRanges();
		sel.addRange(range);
	}
}

//highlight item on single left click
function selectWithOneClick(e) {
	clickedItem = getClickedItem(e);
	selectItem(clickedItem);
}

//events for right clicking in Solution explorer
document.getElementById("solutionWindow").oncontextmenu = function () {
	//highlight the element that was right clicked
	selectItem(clickedItem);
	//disable default browser menu for Solution explorer container
	return false
};

//show custom menu replacing the default (on right click)
function showMenu(e) {
	let menu = document.getElementById("solutionMenu"),
		options = document.getElementsByClassName("options"),
		i;

	clickedItem = getClickedItem(e);
	for (i = 0; i < options.length; i++) {
		options[i].style.display = "none";
	}
	//customize menu, depending on what element was right clicked in Solution explorer
	if (clickedItem.classList.contains("project")) {
		setMenuForProject();
	} else {
		if (clickedItem.classList.contains("file")) {
			setMenuForFile();
		} else {
			if (clickedItem.classList.contains("directory")) {
				setMenuForDir();
			}
		}
	}
	//remember original click location, to display modal windows in the same spot
	mouseOriginalX = e.pageX,
	mouseOriginalY = e.pageY;
	//make menu visible, bring it at mouse coords
	menu.style.display = "block";
	setElementPosition(menu, mouseOriginalX, mouseOriginalY);
}

//bring element at mouse coords, relative to boundries of window
function setElementPosition(element, mouseCoordX, mouseCoordY) {
	let elementWidth = element.offsetWidth,
		elementHeight = element.offsetHeight;

	if ((mouseCoordX + elementWidth) > window.innerWidth) {	//menu would break out of bounds to the right
		//for modal dialogue windows, cluster the containing elements to the right
		if (element.classList.contains("modal-simple")) {
			document.getElementById("modalText").style.float = "right";
			document.getElementById("UserOkBtn").style.float = "right";
			document.getElementById("UserCancelBtn").style.float = "right";
			document.getElementsByClassName("modalCloseBtn")[0].style.float = "right";
		}
		element.style.left = (mouseCoordX - elementWidth) + "px";
	}
	else {
		//similar to above, but we float them left
		if (element.classList.contains("modal-simple")) {
			document.getElementById("modalText").style.float = "left";
			document.getElementById("UserOkBtn").style.float = "left";
			document.getElementById("UserCancelBtn").style.float = "left";
			document.getElementsByClassName("modalCloseBtn")[0].style.float = "left";
		}
		element.style.left = mouseCoordX + "px";
	}
	if ((mouseCoordY + elementHeight) > window.innerHeight) {	//menu would break out of bonds to the bottom
		element.style.top = (mouseCoordY - elementHeight) + "px";
	}
	else {
		element.style.top = mouseCoordY + "px";
	}
}

//menu items for projects
function setMenuForProject() {
	document.getElementById("closeProject").style.display = "block";
	document.getElementById("saveProject").style.display = "block";
	document.getElementById("loadProject").style.display = "block";
	document.getElementById("rename").style.display = "block";
	document.getElementById("run").style.display = "block";
	document.getElementById("addFile").style.display = "block";
	document.getElementById("addDir").style.display = "block";
}
//menu items for files
function setMenuForFile() {
	document.getElementById("openInTab").style.display = "block";
	document.getElementById("rename").style.display = "block";
	document.getElementById("delete").style.display = "block";
}
//menu items for directories
function setMenuForDir() {
	document.getElementById("rename").style.display = "block";
	document.getElementById("addFile").style.display = "block";
	document.getElementById("addDir").style.display = "block";
	document.getElementById("delete").style.display = "block";
}

//hide menu when user clicks away
function hideMenu() {
	document.getElementById("solutionMenu").style.display = "none";
}
//hide menu when user presses Esc
function hideMenuOnEscape(e) {
	if (readMyPressedKey(e) == "Escape") {
		hideMenu();
	}
}

// Make the solution Window draggable, inspired from w3schools https://www.w3schools.com/howto/howto_js_draggable.asp
dragElement(document.getElementById("solutionWindow"));
function dragElement(elmnt) {
	let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
	if (document.getElementById(elmnt.id + "Header")) {
		// if present, the header is where you move the DIV from:
		document.getElementById(elmnt.id + "Header").onmousedown = dragMouseDown;
	} else {
		// otherwise, move the DIV from anywhere inside the DIV:
		elmnt.onmousedown = dragMouseDown;
	}

	function dragMouseDown(e) {
		e = e || window.event;
		e.preventDefault();
		// get the mouse cursor position at startup:
		pos3 = e.clientX;
		pos4 = e.clientY;
		document.onmouseup = closeDragElement;
		// call a function whenever the cursor moves:
		document.onmousemove = elementDrag;
	}

	function elementDrag(e) {
		e = e || window.event;
		e.preventDefault();
		// calculate the new cursor position:
		pos1 = pos3 - e.clientX;
		pos2 = pos4 - e.clientY;
		pos3 = e.clientX;
		pos4 = e.clientY;
		// set the element's new position:
		elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
		elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
	}

	function closeDragElement() {
		// stop moving when mouse button is released:
		document.onmouseup = null;
		document.onmousemove = null;
	}
}