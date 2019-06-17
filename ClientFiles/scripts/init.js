document.addEventListener("DOMContentLoaded", setDefaultValues);
document.getElementById("newProjectBtn").addEventListener("click", showNewProjectDiag);
document.getElementById("showLoginBtn").addEventListener("click", showLoginBox);
document.getElementsByClassName("backToWelcomeDiag")[0].addEventListener("click", hideNewProjDiag);
document.getElementById("userProjNameInput").addEventListener("blur", setCheckBoxForProjInput);
document.getElementsByClassName("selectProjectType")[0].addEventListener("blur", setCheckBoxForTypeSelection);
document.getElementsByClassName("selectProjectType")[0].addEventListener("change", setCheckBoxForTypeSelection);
document.getElementsByClassName("selectProjectType")[0].addEventListener("change", updateScaffoldsForLanguage);
document.getElementsByClassName("CSharpScaffold")[0].addEventListener("change", updateScaffoldsForLanguage);
document.getElementById("userFirstFileInput").addEventListener("blur", setCheckboxForOptInput);
document.getElementById("okSelectProjType").addEventListener("click",okPressedOnProjSelect);

//variable used to memorize project language
var projectLang;

//on page load events (more accurately, when the DOM is loaded, without waiting on stylesheets, images or subframes )
function setDefaultValues() {
	//set default project language and options asociated in the New Project Menu
	projectLang = getProjectType();
	let optionalFileInput = document.getElementById("userFirstFileInput");
	if (projectLang == "c#") {
		let cSharpOptions = document.getElementsByClassName("cSharpOption");
		for (let i = 0; i < cSharpOptions.length; i++) {
			cSharpOptions[i].style.display = "block";
		}
		if (document.getElementsByClassName("CSharpScaffold")[0].value == "empty") {
			optionalFileInput.style.display = "inline";
			optionalFileInput.previousElementSibling.style.display = "inline";
			optionalFileInput.nextElementSibling.style.display = "inline";
		}
	}
	else {
		optionalFileInput.style.display = "inline";
		optionalFileInput.previousElementSibling.style.display = "inline";
		optionalFileInput.nextElementSibling.style.display = "inline";
		document.getElementsByClassName("CSharpScaffold")[0].value = "empty";
	}

	//toggle logged functionality
	if (getUserFromJWT() != null) { //user logged and saved in local/session storage
		localStorage.length > 0 ? document.getElementById("displayedAvatar").src = localStorage.getItem('avatar')
			: document.getElementById("displayedAvatar").src = sessionStorage.getItem('avatar');
		hideGroup("login");
	}
	else { //not logged
		hideGroup("logout");
	}
	//settings on the welcome and initial select project screen
	document.getElementsByClassName("welcome")[0].style.display = "block";
	document.getElementById("projNameCheckbox").style.display = "none";
	document.getElementById("selectTypeCheckbox").style.display = "none";
	document.getElementById("projOptCheckbox").style.display = "none";

	//project root must be hidden until user exits initial "select project" screen to avoid showing placeholder root
	document.getElementById("solExplorerUL").style.display = "none";
	//make various large containers draggable
	dragElement(document.getElementById("toolbar"));
	dragElement(document.getElementById("solutionWindow"));
	dragElement(document.getElementById("loadFileSelectorWindow"));
	//servers warm-up
	warmUpMicroservices();
}

//navigation in 'welcome' window
function showNewProjectDiag() {
	//document.getElementsByClassName("welcome")[0].style.display = "none";
	document.getElementsByClassName("newProject")[0].style.display = "block";
	document.getElementById("userProjNameInput").focus();
}
function showLoginBox() {
	document.getElementById("loginBox").style.display = "block";
	document.getElementById("userName").focus();
}

//navigation in 'new project' window
function hideNewProjDiag() {
	document.getElementsByClassName("newProject")[0].style.display = "none";
	//document.getElementsByClassName("welcome")[0].style.display = "block";
}

//hide a group of buttons and labels and replace them with the opposite
function hideGroup(group) {
	let loginBtn = document.getElementById("showLoginBtn"),
		warnLabel = document.getElementById("small-label"),
		loginInfo = document.getElementById("loginInfo"),
		logoutBtn = document.getElementById("logoutBtn"),
		loadBtn = document.getElementById("loadProjectBtn"),
		toolbarLoginBtn = document.getElementById("toolbar_Login"),
		toolbarLogout = document.getElementById("toolbar_Logout"),
		toolbarLoginInfo = document.getElementById("toolbar_LoginInfo"),
		toolbarSaveBtn = document.getElementById("toolbar_SaveBtn"),
		toolbarLoadBtn = document.getElementById("toolbar_LoadBtn"),
		displayedAvatar = document.getElementById("displayedAvatar"),
		optionsBtn = document.getElementById("loginOptionsBtn"),
		toolbarOptions = document.getElementById("toolbar_Options");

	if (group == "login") {
		//welcome screen
		loginBtn.style.display = "none";
		warnLabel.style.display = "none";
		logoutBtn.style.display = "inline";
		loginInfo.style.display = "inline";
		optionsBtn.style.display = "inline";
		loadBtn.classList.remove("disabledBtn");
		loginInfo.innerHTML = "You are logged as " + getUserFromJWT();
		//clones in the toolbar
		toolbarLoginBtn.style.display = "none";
		toolbarOptions.style.display = "inline";
		toolbarLogout.style.display = "inline";
		toolbarLoginInfo.style.display = "inline";
		toolbarLoginInfo.innerHTML = "You are logged as " + getUserFromJWT();
		toolbarSaveBtn.style.display = "inline";
		toolbarLoadBtn.style.display = "inline";
		displayedAvatar.style.display = "block";
	} else if (group == "logout") {
		//welcome screen
		loginBtn.style.display = "block";
		warnLabel.style.display = "block";
		logoutBtn.style.display = "none";
		loginInfo.style.display = "none";
		optionsBtn.style.display = "none";
		loadBtn.classList.add("disabledBtn");
		//clones in the toolbar
		toolbarLoginBtn.style.display = "inline";
		toolbarOptions.style.display = "none";
		toolbarLogout.style.display = "none";
		toolbarLoginInfo.style.display = "none";
		toolbarSaveBtn.style.display = "none";
		toolbarLoadBtn.style.display = "none";
		displayedAvatar.style.display = "none";
	}
}

//get values from input fields in 'new project' window
function getProjectName() {
	return document.getElementById("userProjNameInput").value;
}
function getProjectType() {
	return document.getElementsByClassName("selectProjectType")[0].value;
}
function getProjectTemplate() {
	return document.getElementsByClassName("CSharpScaffold")[0].value;
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

//set checkbox valid or invalid for project type selection
function setCheckBoxForTypeSelection() {
	document.getElementById("selectTypeCheckbox").style.display = "inline";
	if (projectTypeSelected()) {
		setCheckboxValid(document.getElementById("selectTypeCheckbox"));
	}
	else {
		setCheckboxInvalid(document.getElementById("selectTypeCheckbox"));
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

//set language based on user selection. Also set options visible based on that selection
function updateScaffoldsForLanguage() {
	let optionalFileInput = document.getElementById("userFirstFileInput"),
		cSharpOptions = document.getElementsByClassName("cSharpOption");
	projectLang = getProjectType();

	if (projectLang == "c#") {
		if (document.getElementsByClassName("CSharpScaffold")[0].value != "empty") {
			optionalFileInput.style.display = "none";
			optionalFileInput.previousElementSibling.style.display = "none";
			optionalFileInput.nextElementSibling.style.display = "none";
			document.getElementById("userFirstFileInput").value = "";
		}
		else {
			optionalFileInput.style.display = "inline";
			optionalFileInput.previousElementSibling.style.display = "inline";
			optionalFileInput.nextElementSibling.style.display = "inline";
		}
		for (let i = 0; i < cSharpOptions.length; i++) {
			cSharpOptions[i].style.display = "block";
		}
	} else {
		optionalFileInput.style.display = "inline";
		optionalFileInput.previousElementSibling.style.display = "inline";
		optionalFileInput.nextElementSibling.style.display = "inline";
		for (let i = 0; i < cSharpOptions.length; i++) {
			cSharpOptions[i].style.display = "none";
		}
		document.getElementsByClassName("CSharpScaffold")[0].value = "empty";
	}
}

//check if user selected a value for project type
function projectTypeSelected() {
	let selection = document.getElementsByClassName("selectProjectType")[0],
		ret=true;
	let selectedValue = selection.options[selection.selectedIndex].value;
	if (selectedValue == "") {
		ret = false;
	}

	return ret;
}

//set startup project from values entered by user
function okPressedOnProjSelect() {
	const projNameInput = document.getElementById("userProjNameInput").getBoundingClientRect(),
		projFirstFileInput = document.getElementById("userFirstFileInput").getBoundingClientRect(),
		projTypeSelect = document.getElementsByClassName("selectProjectType")[0].getBoundingClientRect();
	let projectName = getProjectName(), optionalFileName = getOptionalFile(),
		projNameInputErrorX = projNameInput.left,
		projNameInputErrorY = projNameInput.top + projNameInput.height,
		projTypeErrorX = projTypeSelect.left,
		projTypeErrorY = projTypeSelect.top + projTypeSelect.height,
		projFirstFileInputX = projFirstFileInput.left,
		projFirstFileInputY = projFirstFileInput.top + projFirstFileInput.height,
		allOk = false;

	if (isValidInput("project", projectName)) {
		if (isValidInput("file", optionalFileName) || !optionalFileName) {
			if (projectTypeSelected()) {
				allOk = true;
			}
			else {	//user didn't pick a project type
				showDiagError("please select a project type", projTypeErrorX, projTypeErrorY);
			}
		}
		else {	//user enter an invalid value for optional startup file
			showDiagError(optionalFileName + " is not a valid name for a file! try filename.extension", projFirstFileInputX, projFirstFileInputY);
		}
	}
	else {	//user entered an invalid input for project name
		showDiagError(projectName + " is not a valid name for a project!", projNameInputErrorX, projNameInputErrorY);
	}

	//tests passed, all values entered are valid
	if (allOk) {
		//delete old project contents
		doCloseProject();
		//empty project option
		let template = document.getElementsByClassName("CSharpScaffold")[0].value;
		if (template == "empty") {
			createEmptyProject(projectName, optionalFileName);
		}
		//project with scaffolding option
		else {
			createTemplateProject(getProjectTemplate(), projectName);
		}
	}
}
