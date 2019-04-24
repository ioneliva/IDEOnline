var isLogged=false;

document.addEventListener("DOMContentLoaded", setDefaultValues);
document.getElementById("newProjectBtn").addEventListener("click", showNewProjectDiag);
document.getElementById("showLoginBtn").addEventListener("click", showLoginForm);
document.getElementsByClassName("backToWelcomeDiag")[0].addEventListener("click", showWelcomeDiag);
document.getElementById("userProjNameInput").addEventListener("blur", setCheckBoxForProjInput);
document.getElementById("userFirstFileInput").addEventListener("blur", setCheckboxForOptInput);
document.getElementById("okSelectProjType").addEventListener("click",okPressedOnProjSelect);

//on page load events (more accurately, when the DOM is loaded, without waiting on stylesheets or images )
function setDefaultValues() {
	if (!isLogged) {
		//TODO: check if user is logged (from page cache) and disable the button. For now, we start as unlogged
		document.getElementById("loadProjectBtn").classList.add("disabledBtn");
		document.getElementsByClassName("welcome")[0].style.display = "block";
		document.getElementById("projNameCheckbox").style.display = "none";
		document.getElementById("projOptCheckbox").style.display = "none";
	}
}

//navigation in 'welcome' window
function showNewProjectDiag() {
	document.getElementsByClassName("welcome")[0].style.display = "none";
	document.getElementsByClassName("newProject")[0].style.display = "block";
	document.getElementById("userProjNameInput").focus();
}
function showLoginForm() {
	//TODO: login form is not finished yet
	document.getElementsByClassName("loginBox")[0].style.display="block";
}

//navigation in 'new project' window
function showWelcomeDiag() {
	document.getElementsByClassName("newProject")[0].style.display = "none";
	document.getElementsByClassName("welcome")[0].style.display = "block";
}

//get values from input fields in 'new project' window
function getProjectName() {
	return document.getElementById("userProjNameInput").value;
}
function getProjectType() {
	return document.getElementsByClassName("selectProjectType")[0].value;
}
function getOptionalFile() {
	return document.getElementById("userFirstFileInput").value;
}

//checkbox colors for valid/invalid checkboxes
function setCheckboxValid(checkbox) {
	if (checkbox.classList.contains("invalid")) {
		checkbox.classList.remove("invalid");
	}
	checkbox.innerHTML = "&#" + 10004 + ";";
	checkbox.classList.add("valid");
}
function setCheckboxInvalid(checkbox) {
	if (checkbox.classList.contains("valid")) {
		checkbox.classList.remove("valid");
	}
	checkbox.innerHTML = "&#"+10071+";";
	checkbox.classList.add("invalid");
}

//set checkbox valid or invalid for project input field
function setCheckBoxForProjInput() {
	document.getElementById("projNameCheckbox").style.display = "inline";
	if (getProjectName() && isValidInput("project", getProjectName())) {
		setCheckboxValid(document.getElementById("projNameCheckbox"));
	}
	else {
		setCheckboxInvalid(document.getElementById("projNameCheckbox"));
	}
}

//set checkbox valid or invalid for optional input field
function setCheckboxForOptInput() {
	document.getElementById("projOptCheckbox").style.display = "inline";
	if (!getOptionalFile() || isValidInput("file", getOptionalFile())) {
		setCheckboxValid(document.getElementById("projOptCheckbox"));
	}
	else {
		setCheckboxInvalid(document.getElementById("projOptCheckbox"));
	}
}

//set startup project from values entered by user
function okPressedOnProjSelect() {
	const projNameInput = document.getElementById("userProjNameInput").getBoundingClientRect(),
			projFirstFileInput = document.getElementById("userFirstFileInput").getBoundingClientRect();
	let userInputProjName, userInputOptional,
		projNameInputErrorX = projNameInput.left,
		projNameInputErrorY = projNameInput.top + projNameInput.height,
		projFirstFileInputX = projFirstFileInput.left,
		projFirstFileInputY = projFirstFileInput.top + projFirstFileInput.height,
		allOk = false;

	userInputProjName = getProjectName();
	userInputOptional = getOptionalFile();
	if (isValidInput("project", userInputProjName)) {
		if (isValidInput("file", userInputOptional) || !userInputOptional) {
			allOk = true;
		}
		else {	//user enter an invalid value for optional startup file
			showDiagError(userInputOptional + " is not a valid name for a file! try filename.extension", projFirstFileInputX, projFirstFileInputY);
		}
	}
	else {	//user entered an invalid input for project name
		showDiagError(userInputProjName + " is not a valid name for a project!", projNameInputErrorX, projNameInputErrorY);
	}

	//tests passed, all values entered are valid
	if (allOk) {
		//set root on Solution Explorer window
		let root = document.getElementById("root");
		root.lastChild.nodeValue = getProjectName();
		root.id = getProjectName();
		if (userInputOptional) {
			let fileStructure = createFileStructure(userInputOptional, root.id);
			attachFileToParent(fileStructure, root);
			openInTab(fileStructure.lastChild);
		}
		//hide 'new project' window so the user can progress
		document.getElementsByClassName("newProject")[0].style.display = "none";
	}
}
