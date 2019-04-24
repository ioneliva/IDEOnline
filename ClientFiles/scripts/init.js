var isLogged=false;

document.addEventListener("DOMContentLoaded", setDefaultValues);
document.getElementById("newProjectBtn").addEventListener("click", showNewProjectDiag);
document.getElementById("showLoginBtn").addEventListener("click", showLoginForm);
document.getElementsByClassName("backToWelcomeDiag")[0].addEventListener("click", showWelcomeDiag);
document.getElementById("okSelectProjType").addEventListener("click",okPressedOnProjSelect);

//on page load events (more accurately, when the DOM is loaded, without waiting on stylesheets or images )
function setDefaultValues() {
	if (!isLogged) {
		//TODO: check if user is logged (from page cache) and disable the button. For now, we start as unlogged
		document.getElementById("loadProjectBtn").classList.add("disabledBtn");
		document.getElementsByClassName("welcome")[0].style.display = "block";
	}
}

//navigation in 'welcome' window
function showNewProjectDiag() {
	document.getElementsByClassName("welcome")[0].style.display = "none";
	document.getElementsByClassName("newProject")[0].style.display = "block";
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

//set startup project from values entered by user
function okPressedOnProjSelect() {
	const rect = document.getElementById("userProjNameInput").getBoundingClientRect();
	let userInputProjName, userInputOptional,
		errorX = rect.left,
		errorY = rect.top + rect.height;

	userInputOptional = getOptionalFile();
	//todo optional file
	userInputProjName = getProjectName();
	if (isValidInput("project", userInputProjName)) {
		//set root on Solution Explorer window
		document.getElementById("root").lastChild.nodeValue = getProjectName();
		//hide 'new project' window
		document.getElementsByClassName("newProject")[0].style.display = "none";
	}
	else {	//user entered an invalid input
		showDiagError(userInputProjName + " is not a valid name for a project!", errorX, errorY);
	}
}
