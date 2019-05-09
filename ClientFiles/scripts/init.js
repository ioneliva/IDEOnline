//global variables used for statistics
var wordColorMicroserviceState = "down", wordRepairMicroserviceState = "down", undoMicroserviceState = "down",
	loginMicroserviceState = "down", saveMicroserviceState = "down", runMicroserviceState = "down",
	startTime, wordColorStartDate, wordColorWarmUpPing, wordColorLastAccessed, wordColorPing,
	undoRedoStartDate, undoRedoWarmUpPing, undoRedoLastAccessed, undoRedoPing,
	loginStartDate, loginWarmUpPing, loginLastAccessed, loginPing;

document.addEventListener("DOMContentLoaded", setDefaultValues);
document.getElementById("newProjectBtn").addEventListener("click", showNewProjectDiag);
document.getElementById("showLoginBtn").addEventListener("click", showLoginBox);
document.getElementsByClassName("backToWelcomeDiag")[0].addEventListener("click", hideNewProjDiag);
document.getElementById("userProjNameInput").addEventListener("blur", setCheckBoxForProjInput);
document.getElementsByClassName("selectProjectType")[0].addEventListener("blur", setCheckBoxForTypeSelection);
document.getElementsByClassName("selectProjectType")[0].addEventListener("change", setCheckBoxForTypeSelection);
document.getElementById("userFirstFileInput").addEventListener("blur", setCheckboxForOptInput);
document.getElementById("okSelectProjType").addEventListener("click",okPressedOnProjSelect);

//on page load events (more accurately, when the DOM is loaded, without waiting on stylesheets, images or subframes )
function setDefaultValues() {
	if (getUserFromJWT() != null) { //user logged and saved in local storage
		document.getElementById("displayedAvatar").src = localStorage.getItem('avatar');
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
	//make toolbar dragable
	dragElement(document.getElementById("toolbar"));
	//make solution explorer dragable
	dragElement(document.getElementById("solutionWindow"));

	//servers warm-up
	warmUpMicroservices();
}

//sending an empty request to all microservices. We want a ping and server start time
//and, more importantly, we also want to warm-up the microservice(auto stores data into RAM and cache, makes further requests a lot faster)
function warmUpMicroservices() {
	//word coloring
	startTime = new Date();
	sendRequest("POST", apiGateway + "/coloring", {
		"word_and_delimiter": "", "position": "",
		"enterPressed": "", "preWord": "", "preWordPos": "", "token": ""
	}, function (response) {
		wordColorWarmUpPing = new Date() - startTime;
		wordColorMicroserviceState = "running";
		setIconForMicroservice("wordColorMicroservice", "running");
		let wordColoringMS = JSON.parse(response);
		wordColorStartDate = wordColoringMS.serverStart;
	}, function (err) {
		wordColorMicroserviceState = "down";
		setIconForMicroservice("wordColorMicroservice", "down");
	});

	//undo/redo(put new state endpoint)
	startTime = new Date();
	sendRequest("PUT", apiGateway + "/doUndo", {
		"statusRequest":""
	}, function (response) {
		undoRedoWarmUpPing = new Date() - startTime;
		undoMicroserviceState = "running";
		setIconForMicroservice("undoMicroservice", "running");
		let undoRedoMS = JSON.parse(response);
		undoRedoStartDate = undoRedoMS.serverStart;
		}, function (err) {
		undoMicroserviceState = "down";
		setIconForMicroservice("undoMicroservice", "down");
	});

	//login(authentification endpoint)
	startTime = new Date();
	fetch(apiGateway + "/auth", {
		method: 'POST',
		body: JSON.stringify({
			"name":"thisIsAStatusRequestFromClient"
		}),
		headers: {
			'Content-Type': 'application/json'
		}
	}).then(response => response.json()
	).then(response => {
		loginWarmUpPing = new Date() - startTime;
		loginMicroserviceState = "running";
		setIconForMicroservice("loginMicroservice", "running");
		loginStartDate = response.serverStart;
	}).catch(error => {
		if (error == "TypeError: NetworkError when attempting to fetch resource.") {
			loginMicroserviceState = "down";
			setIconForMicroservice("loginMicroservice", "down");
		}
	});
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
		displayedAvatar = document.getElementById("displayedAvatar");

	if (group == "login") {
		//welcome screen
		loginBtn.style.display = "none";
		warnLabel.style.display = "none";
		logoutBtn.style.display = "block";
		loginInfo.style.display = "block";
		loadBtn.classList.remove("disabledBtn");
		loginInfo.innerHTML = "You are logged as " + getUserFromJWT();
		//clones in the toolbar
		toolbarLoginBtn.style.display = "none";
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
		loadBtn.classList.add("disabledBtn");
		//clones in the toolbar
		toolbarLoginBtn.style.display = "inline";
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
	let userInputProjName, userInputOptional,
		projNameInputErrorX = projNameInput.left,
		projNameInputErrorY = projNameInput.top + projNameInput.height,
		projTypeErrorX = projTypeSelect.left,
		projTypeErrorY = projTypeSelect.top + projTypeSelect.height,
		projFirstFileInputX = projFirstFileInput.left,
		projFirstFileInputY = projFirstFileInput.top + projFirstFileInput.height,
		allOk = false;

	userInputProjName = getProjectName();
	userInputOptional = getOptionalFile();
	if (isValidInput("project", userInputProjName)) {
		if (isValidInput("file", userInputOptional) || !userInputOptional) {
			if (projectTypeSelected()) {
				allOk = true;
			}
			else {	//user didn't pick a project type
				showDiagError("please select a project type", projTypeErrorX, projTypeErrorY);
			}
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
		//delete old project contents
		doCloseProject();
		//set root on Solution Explorer window
		let root = document.getElementsByClassName("project")[0];
		root.lastChild.nodeValue = getProjectName();
		root.id = getProjectName();
		if (userInputOptional) {
			let fileStructure = createFileStructure(userInputOptional, root.id);
			attachFileToParent(fileStructure, root);
			openInTab(fileStructure.lastChild);
		}
		document.getElementById("solExplorerUL").style.display = "block";
		//hide 'new project' and 'welcome' window so the user can progress
		document.getElementsByClassName("newProject")[0].style.display = "none";
		document.getElementsByClassName("welcome")[0].style.display = "none";
	}
}
