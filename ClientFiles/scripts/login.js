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
	return document.getElementById("userName").value;
}
function getPasswd() {
	return document.getElementById("userPasswd").value;
}
//get values from input fields in Register form
function getRegisterUsername() {
	return document.getElementById("registerUserName").value;
}
function getRegisterPasswd() {
	return document.getElementById("registerUserPasswd").value;
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
	//send user and passwd to microservice
	//on success ,memorize token received, use in in all future coms
}
//ok pressed on Register form
function okPressedOnRegister() {
	//send user and passw to microservice as new values
	//on success, meessage "you are ok, go back and login"
}

//cancel button pressed on Login/Register
function hideLoginForm() {
	document.getElementById("loginBox").style.display="none";
}
function hideRegisterForm() {
	document.getElementById("registerBox").style.display = "none";
	showLoginForm();
}

//avatar selection
function selectAvatarPic() {
	var file = this.files[0],
		mime = ["image/jpeg", "image/svg+xml", "image/png", "image/gif"],
		fileReader = new FileReader();
	document.getElementById("fileSelectorErrorMessage").style.display = "none";

	//check valid file type
	if (mime.indexOf(file.type) === -1) {
		document.getElementById("fileSelectorErrorMessage").style.display = "block";
		document.getElementById("fileSelectorErrorMessage").innerText = "Only jpg, svg, png and gif files allowed";
		return;
	}
	//check if file doesn't exceed maximum allowed size (2mb set)
	if (file.size > 2 * 1024 * 1024) {
		document.getElementById("fileSelectorErrorMessage").style.display = "block";
		document.getElementById("fileSelectorErrorMessage").innerText = "Size must not exceed 2MB";
		return;
	}
	//all ok, set image
	fileReader.onload = function () {
		document.getElementsByClassName("avatar")[0].src = fileReader.result;
	}
	fileReader.readAsDataURL(file);
}

