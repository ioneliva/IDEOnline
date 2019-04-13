//expand element in Solution Window
let expandableElement = document.getElementsByClassName("expand");
let i;
for (i = 0; i < expandableElement.length; i++) {
	expandableElement[i].addEventListener("click", function () {
		this.parentElement.querySelector(".nested").classList.toggle("active");
		this.classList.toggle("expand-down");
	});
}

//add event listeners for right click for elements I considered to be interactive in the solution window
let interactiveElements = document.getElementsByClassName("interactive");
for (i = 0; i < interactiveElements.length; i++) {
	interactiveElements[i].addEventListener("contextmenu", showMenu);
}

//remember item right clicked on solution window for future reference
var clickedItem;
//events for right clicking in Solution Window
document.getElementById("solutionWindow").oncontextmenu = function () {
	//highlight the element that was right clicked
	let clickedElement = event.target,
		range = document.createRange(),
		sel = window.getSelection();

	clickedItem = clickedElement;
	range.setStartBefore(clickedElement);
	range.setEndAfter(clickedElement);
	sel.removeAllRanges();
	sel.addRange(range);
	//disable default browser menu for Solution Window container
	return false
};

//show custom menu replacing the default (on right click)
function showMenu(e) {
	let menu = document.getElementById("solutionMenu"),
		clickedElement = event.target,
		options = document.getElementsByClassName("options"),
		i;
	for (i = 0; i < options.length; i++) {
		options[i].style.display = "none";
	}
	//customize menu, depending on what element was right clicked in Solution Window
	if (clickedElement.classList.contains("project")) {
		document.getElementById("closeProject").style.display = "block";
		document.getElementById("saveProject").style.display = "block";
		document.getElementById("loadProject").style.display = "block";
		document.getElementById("run").style.display = "block";
		document.getElementById("addFile").style.display = "block";
		document.getElementById("adddir").style.display = "block";
	} else {
		if (clickedElement.classList.contains("file")) {
			document.getElementById("openInTab").style.display = "block";
			document.getElementById("rename").style.display = "block";
			document.getElementById("delete").style.display = "block";
		} else {
			if (clickedElement.classList.contains("directory")) {
				document.getElementById("rename").style.display = "block";
				document.getElementById("addFile").style.display = "block";
				document.getElementById("adddir").style.display = "block";
				document.getElementById("delete").style.display = "block";
			}
		}
	}
	//make it visible, bring it at mouse coords
	menu.style.display = "block";
	menu.style.left = e.pageX + "px";
	menu.style.top = e.pageY + "px";
}

//hiding menu when user clicks away or presses Esc
window.addEventListener("mousedown", hideMenu);
window.addEventListener("keydown", checkForEscape);
function hideMenu() {
	document.getElementById("solutionMenu").style.display = "none";
}
function checkForEscape(e) {
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