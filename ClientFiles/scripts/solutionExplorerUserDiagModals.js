document.addEventListener("keydown", handleKeyboardForUserDiag);
window.addEventListener("resize", hideModalOnResize);
document.getElementById("UserCancelBtn").addEventListener("click", hideModal);
document.getElementsByClassName("modalCloseBtn")[0].addEventListener("click", hideModal);

//hide modal dialogue
function hideModal() {
	document.getElementById("userDiag").style.display = "none";
	document.getElementById("userInput").value = "";
}

//get user input from modal dialogue
function getUserInput() {
	return document.getElementById("userInput").value;
}

//user pressed Esc or Enter
function handleKeyboardForUserDiag(e) {
	if (readMyPressedKey(e) == "Escape") {
		hideModal();
	} else {
		let okBtn = document.getElementById("UserOkBtn");
		if (readMyPressedKey(e) == "Enter" && okBtn.style.display=="block") {
			document.getElementById("UserOkBtn").click();
		}
	}
}

//hide modal when user clicks outside the dialogue
function hideModalOnResize(e) {
	let tg = e.target || window.event.target;
	if (tg != document.getElementById("userDiag") && tg != document.getElementById("modalText") && tg != document.getElementById("UserOkBtn")
			&& tg != document.getElementById("userInput") && tg != document.getElementsByClassName("modal")[0]) {
		hideModal();
	}
}

//format dialogue modal to show error. Note coords for the window are optional
function showDiagError(errText, coordX, coordY) {
	let errBox = document.getElementsByClassName("modal-simple")[0],
		msgToUser = document.getElementById("modalText");

	if (coordX && coordY) {	//coordinates parameter received
		//make sure the error box has events for closing attached. If they are already present, they simply get replaced
		document.addEventListener("keydown", handleKeyboardForUserDiag);
		window.addEventListener("resize", hideModalOnResize);
		document.getElementById("UserCancelBtn").addEventListener("click", hideModal);
		document.getElementsByClassName("modalCloseBtn")[0].addEventListener("click", hideModal);
		//display error window at passed coords
		setElementPosition(errBox, coordX, coordY);
		errBox.style.display = "block";
	}
	//if no coordinated we passed, the error modal replaces the last position of the dialogue window
	msgToUser.textContent = errText;
	msgToUser.classList.add("error");
	msgToUser.style.display = "block";
	document.getElementById("userInput").style.display = "none";
	document.getElementById("UserOkBtn").style.display = "none";
	document.getElementById("UserCancelBtn").style.display = "none";
}

//format dialogue modal to show a warning
function showDiagWarning(warnText) {
	let msgToUser = document.getElementById("modalText");
	msgToUser.textContent = warnText;
	msgToUser.style.display = "block";
	document.getElementById("userInput").style.display = "none";
	document.getElementById("UserOkBtn").style.display = "block";
	document.getElementById("UserCancelBtn").style.display = "block";
	document.getElementById("userDiag").style.display = "block";
}

//prepare user dialogue for operation
function prepareUserDiagFor(purpose) {
	let msgToUser = document.getElementById("modalText");
	//remove listener that hides the modal on mouse click. Because of the delay on setTimeout, it would hide the dialogue before it would appear
	window.removeEventListener("mousedown", hideModalOnResize);
	switch (purpose) {
		case "rename":
			msgToUser.textContent = "Rename to:";
			document.getElementById("userInput").style.display = "block";
			document.getElementById("UserOkBtn").style.display = "block";
			document.getElementById("UserCancelBtn").style.display = "none";
			break;
		case "newFile":
			msgToUser.textContent = "New file name:";
			document.getElementById("userInput").style.display = "block";
			document.getElementById("UserOkBtn").style.display = "block";
			document.getElementById("UserCancelBtn").style.display = "none";
			break;
		case "newDir":
			msgToUser.textContent = "New directory name:";
			document.getElementById("userInput").style.display = "block";
			document.getElementById("UserOkBtn").style.display = "block";
			document.getElementById("UserCancelBtn").style.display = "none";
			break;
		case "delete": {
			msgToUser.textContent = "Are you sure you want to delete this item?"
			document.getElementById("userInput").style.display = "none";
			document.getElementById("UserOkBtn").value = "YES";
			document.getElementById("UserCancelBtn").value = "NO";
			document.getElementById("UserOkBtn").style.display = "block";
			document.getElementById("UserCancelBtn").style.display = "block";
		}
	}
	msgToUser.classList.remove("error");
	let diagWindow = document.getElementById("userDiag");
	diagWindow.style.display = "block";
	//bring modal to mouse coords, relative to window boundries
	setElementPosition(diagWindow, mouseOriginalX, mouseOriginalY);
	//cannot give focus to an element before it is moved and rendered by the page. Wait 1 ms for that
	setTimeout(function () {
		document.getElementById("userInput").focus();
		//add listener for hiding on click outside the dialogue box
		window.addEventListener("mousedown", hideModalOnResize);
	}, 1);
}