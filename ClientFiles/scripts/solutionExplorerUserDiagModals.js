window.addEventListener("keydown", handleKeyboardForUserDiag);
window.addEventListener("resize", hideModalOnResize);
document.getElementById("UserCancelBtn").addEventListener("click", hideModal);

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
		if (readMyPressedKey(e) == "Enter") {
			document.getElementById("UserOkBtn").click();
		}
	}
}

//hide modal when user clicks outside the dialogue
function hideModalOnResize(e) {
	let tg = event.target || e.target || window.event.target;
	if (tg != document.getElementById("userDiag") && tg != document.getElementById("modalText") && tg != document.getElementById("UserOkBtn")
			&& tg != document.getElementById("userInput") && tg != document.getElementsByClassName("modal")[0]) {
		hideModal();
	}
}

//check if user entered a valid input in menu dialogue
function isValidInput(inputType, input) {
	let regex,
		ret = false;

	if (inputType == "file") {
		regex = /^[a-zA-Z0-9\_\-]+\.[a-zA-Z]+$/i;	//alphanumeric,"_","-", "." ex: file_0.cpp
	}
	if (inputType == "directory") {
		regex = /^[a-zA-Z0-9\_\-]+$/i;		//alphanumeric,"_","-" ex: Work-Dir
	}
	if (input.match(regex) && input.length > 0) {
		ret = true;
	}
	return ret;
}

//format dialogue modal to show error
function showDiagError(errText) {
	let msgToUser = document.getElementById("modalText");
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
function prepareUserDiag(purpose) {
	let msgToUser = document.getElementById("modalText");
	//remove listener that hides on mouse click. Because of the delay on setTimeout, it would hide the dialogue before it would appear
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