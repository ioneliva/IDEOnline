//remember item right clicked on solution window for future reference
var clickedItem, menuOriginX, menuOriginY;

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
window.addEventListener("mousedown", hideMenu);
window.addEventListener("keydown", hideMenuOnEscape);

//expand/collapse expandable element by clicking the arrow symbol
function expandElementByArrow(e) {
	let target = e.target || e.srcElement;
	target.nextElementSibling.nextElementSibling.classList.toggle("active");
	target.classList.toggle("expand-down");
}

//expand/collapse expandable element by double clicking it with the mouse
function expandElementByDbClick() {
	clickedItem.nextElementSibling.classList.toggle("active");
	clickedItem.previousElementSibling.classList.toggle("expand-down");
}

//open file in tab on double click
function openElement() {
	if (clickedItem.classList.contains("file")) {
		openInTab();
	}
	if (clickedItem.classList.contains("project") || clickedItem.classList.contains("directory")) {
		expandElementByDbClick();
	}
}

//select item in solution window (similar to a selection with the mouse or holdig Shift key)
function selectItem(item) {
	let range = document.createRange(),
		sel = window.getSelection();

	clickedItem = event.target || e.target;
	range.setStartBefore(item);
	range.setEndAfter(item);
	sel.removeAllRanges();
	sel.addRange(range);
}

//highlight item on single left click
function selectWithOneClick() {
	let item = event.target;
	selectItem(item);
}

//events for right clicking in Solution Window
document.getElementById("solutionWindow").oncontextmenu = function () {
	//highlight the element that was right clicked
	selectItem(clickedItem);
	//disable default browser menu for Solution Window container
	return false
};

//show custom menu replacing the default (on right click)
function showMenu(e) {
	let menu = document.getElementById("solutionMenu"),
		options = document.getElementsByClassName("options"),
		i;

	clickedItem = event.target;
	for (i = 0; i < options.length; i++) {
		options[i].style.display = "none";
	}
	//customize menu, depending on what element was right clicked in Solution Window
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
	//make menu visible, bring it at mouse coords
	menu.style.display = "block";
	menu.style.left = e.pageX + "px";
	menu.style.top = e.pageY + "px";
	//remember where the menu originated from (useful for small modal pop-ups we want in the same spot later)
	menuOriginX = e.pageX + "px";
	menuOriginY = e.pageY + "px";
}

//menu items for projects
function setMenuForProject() {
	document.getElementById("closeProject").style.display = "block";
	document.getElementById("saveProject").style.display = "block";
	document.getElementById("loadProject").style.display = "block";
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