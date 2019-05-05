document.getElementById("loginOkBtn").addEventListener("click", okPressedOnLogin);
document.getElementById("registerOkBtn").addEventListener("click", okPressedOnRegister);
document.getElementById("loginCancelBtn").addEventListener("click", hideLoginForm);
document.getElementById("registerNew").addEventListener("click", showRegisterForm);
document.getElementById("loginBox").addEventListener("keydown", handleEscapeOnLogin);
document.getElementById("registerBox").addEventListener("keydown", handleEscapeOnRegister);
document.getElementById("registerBackBtn").addEventListener("click", hideRegisterForm);
document.getElementById("browseForFile").addEventListener("change", selectAvatarPic);

//get values from input fields in Login form
function getUsername() {
	return document.getElementById("userName").value.toString();
}
function getPasswd() {
	return document.getElementById("userPasswd").value.toString();
}
//get values from input fields in Register form
function getRegisterUsername() {
	return document.getElementById("registerUserName").value.toString();
}
function getRegisterPasswd() {
	return document.getElementById("registerUserPasswd").value.toString();
}
function getRegisterPasswdConfirm() {
	return document.getElementById("registerConfirmPasswd").value.toString();
}

//make Register form visible
function showRegisterForm() {
	document.getElementById("loginBox").style.display = "none";
	document.getElementById("registerBox").style.display = "block";
	document.getElementById("registerUserName").focus();
}

//Escape pressed in Login form
function handleEscapeOnLogin(e) {
	if (readMyPressedKey(e) == "Escape") {
		hideLoginForm();
	}
}
//Escape pressed on Register form
function handleEscapeOnRegister(e) {
	if (readMyPressedKey(e) == "Escape") {
		hideRegisterForm();
	}
}

//ok pressed on Login form
function okPressedOnLogin() {
	const loginNameInput = document.getElementById("userName").getBoundingClientRect(),
		passwdInput = document.getElementById("userPasswd").getBoundingClientRect();
	let nameInputErrorX = loginNameInput.left,
		nameInputErrorY = loginNameInput.top + loginNameInput.height,
		passwdInputX = passwdInput.left,
		passwdInputY = passwdInput.top + passwdInput.height;

	//validate that user field is not empty
	if (getUsername() == "") {
		showDiagError("Error: user name cannot be empty!", nameInputErrorX, nameInputErrorY);
		return;
	}
	//validate password fields are not empty
	if (getPasswd() == "") {
		showDiagError("Error: password cannot be empty!", passwdInputX, passwdInputY);
		return;
	}

	//send user and passwd to Login microservice
	fetch(apiGateway + "/auth", {
		method: 'POST',
		body: JSON.stringify({
			"name": getUsername(),
			"password": getPasswd()
		}),
		headers: {
			'Content-Type': 'application/json'
		}
	}).then(response => {
		console.log("status code=" + response.status);
		switch (response.status) {
			case 401:
				showDiagError("Error: wrong password!", passwdInputX, passwdInputY);
				break;
			case 404:
				showDiagError("Error: user name does not exist!", nameInputErrorX, nameInputErrorY);
		}
		return response.json();
		}).then(response => {
		//TODO: set these values! For now only displaying them for testing
		console.log("Token:" + JSON.stringify(response.access_token));
		console.log("Expires in " + JSON.stringify(response.expires_in));
		console.log("User avatar: " + JSON.stringify(response.userAvatar));
	}).catch(error => console.error('Error:', error));
}

//ok pressed on Register form
function okPressedOnRegister() {
	const registerNameInput = document.getElementById("registerUserName").getBoundingClientRect(),
		passwdInput = document.getElementById("registerUserPasswd").getBoundingClientRect();
	let nameInputErrorX = registerNameInput.left,
		nameInputErrorY = registerNameInput.top + registerNameInput.height,
		passwdInputX = passwdInput.left,
		passwdInputY = passwdInput.top + passwdInput.height;

	//hide message box (it would remain open on the last message otherwise)
	document.getElementById("registerMessageBox").style.display = "none";

	//validate that user field is not empty
	if (getRegisterUsername() == "") {
		showDiagError("Error: user name cannot be empty!", nameInputErrorX, nameInputErrorY);
		return;
	}
	//validate password fields are not empty
	if (getRegisterPasswd() == "" || getRegisterPasswdConfirm() == "") {
		showDiagError("Error: password and confirm password cannot be empty!", passwdInputX, passwdInputY);
		return;
	}
	//validate password matches repeated password
	if (getRegisterPasswd() != getRegisterPasswdConfirm()) {
		showDiagError("Password and confirmed password must be the same!", passwdInputX, passwdInputY);
		return;
	}

	//send user, passwd and avatar to microservice as new values
	fetch(apiGateway + "/users", {
		method: 'PUT',
		body: JSON.stringify({
			"name": getRegisterUsername(),
			"password": getRegisterPasswd(),
			"avatar": avatarBase64
		}),
		headers: {
			'Content-Type': 'application/json'
		}
	}).then(function (response) {
		switch (response.status) {
			case 200: {
				document.getElementById("registerMessageBox").style.display = "block";
				document.getElementById("registerMessageBox").innerHTML="Success, you may go back and login..."
			}
			break;
			case 409:
				showDiagError("Error: user name already exists!", nameInputErrorX, nameInputErrorY);
			break;
			case 400:
				document.getElementById("registerMessageBox").innerHTML = "Bad request, your input values are not valid!";
		}
	}).catch(error => document.getElementById("registerMessageBox").innerHTML = "Server error:" + error);
}

//cancel button pressed on Login/Register
function hideLoginForm() {
	document.getElementById("loginBox").style.display="none";
}
function hideRegisterForm() {
	document.getElementById("registerBox").style.display = "none";
	showLoginForm();
}

//variable for a base64 string representation of the avatar image
var avatarBase64;

//avatar selection
function selectAvatarPic() {
	let file = this.files[0],
		mime = ["image/jpeg", "image/svg+xml", "image/png", "image/gif"],
		fileReader = new FileReader();
	document.getElementById("fileSelectorErrorMessage").style.display = "none";

	//check valid file type
	if (mime.indexOf(file.type) === -1) {
		document.getElementById("fileSelectorErrorMessage").style.display = "block";
		document.getElementById("fileSelectorErrorMessage").innerText = "Only jpg, svg, png and gif files allowed";
		return;
	}
	//check if file doesn't exceed maximum allowed size (1mb set)
	if (file.size > 1024 * 1024) {
		document.getElementById("fileSelectorErrorMessage").style.display = "block";
		document.getElementById("fileSelectorErrorMessage").innerText = "Size must not exceed 1 MB";
		return;
	}
	//all ok, set image
	fileReader.onload = function () {
		document.getElementsByClassName("avatar")[0].src = fileReader.result;
		avatarBase64 = fileReader.result;
	}
	fileReader.readAsDataURL(file);
}

