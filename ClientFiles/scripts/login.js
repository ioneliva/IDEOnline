document.getElementById("loginOkBtn").addEventListener("click", okPressedOnLogin);
document.getElementById("registerOkBtn").addEventListener("click", okPressedOnRegister);
document.getElementById("loginCancelBtn").addEventListener("click", hideLoginBox);
document.getElementById("registerNew").addEventListener("click", showRegisterBox);
document.getElementById("loginBox").addEventListener("keydown", handleEscapeOnLogin);
document.getElementById("registerBox").addEventListener("keydown", handleEscapeOnRegister);
document.getElementById("registerBackBtn").addEventListener("click", hideRegisterBox);
document.getElementById("browseForFile").addEventListener("change", selectAvatarPic);
document.getElementById("logoutBtn").addEventListener("click", logout);

//get values from input fields in Login box
function getUsername() {
	return document.getElementById("userName").value.toString();
}
function getPasswd() {
	return document.getElementById("userPasswd").value.toString();
}
//get values from input fields in Register box
function getRegisterUsername() {
	return document.getElementById("registerUserName").value.toString();
}
function getRegisterPasswd() {
	return document.getElementById("registerUserPasswd").value.toString();
}
function getRegisterPasswdConfirm() {
	return document.getElementById("registerConfirmPasswd").value.toString();
}

//make Register box visible
function showRegisterBox() {
	document.getElementById("loginBox").style.display = "none";
	document.getElementById("registerBox").style.display = "block";
	document.getElementById("registerUserName").focus();
}

//Escape pressed in Login box
function handleEscapeOnLogin(e) {
	if (readMyPressedKey(e) == "Escape") {
		hideLoginBox();
	}
}
//Escape pressed on Register box
function handleEscapeOnRegister(e) {
	if (readMyPressedKey(e) == "Escape") {
		hideRegisterBox();
	}
}

//ok pressed on Login box
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

	//note: I have coded a loading screen in the html file, with class="loadingStretchBackground", respectively "loadingSymbol", but 
	//server comunication is so fast it just causes a screen flicker. To activate it set style.display="block" for both elements

	//send user and passwd to Login microservice
	if (loginMicroserviceState == "running") {
		loginMicroserviceState = "busy";
		setIconForMicroservice("loginMicroservice","busy");
	}
	let startPing = new Date();
	fetch(apiGateway + "/auth", {
		method: 'POST',
		body: JSON.stringify({
			"name": getUsername(),
			"password": getPasswd()
		}),
		headers: {
			'Content-Type': 'application/json'
		}
	}).then(response => {	//success callback
		//get statistical data about access data and ping
		loginLastAccessed = new Date();
		loginMicroserviceState = "running";
		setIconForMicroservice("loginMicroservice", "running");
		loginPing = loginLastAccessed - startPing;
		//handle user errors
		switch (response.status) {
			case 401:
				showDiagError("Error: wrong password!", passwdInputX, passwdInputY);
				break;
			case 404:
				showDiagError("Error: user name does not exist!", nameInputErrorX, nameInputErrorY);
		}
		return response.json();
		}).then(response => {	//handle response payload
			//save JWT token received from Auth server and avatar image, if user wants to be kept after browser closing
			if (document.getElementById("keepLoggedCheckbox").checked == true) {
				localStorage.setItem('JWT', JSON.stringify(response.access_token));
				if (response.userAvatar) {
					localStorage.setItem('avatar', response.userAvatar);
				}
				else { 
					localStorage.setItem('avatar', "imgs/default_avatar.png");
				}
			}
			else {
				sessionStorage.setItem('JWT', JSON.stringify(response.access_token));
			}
			hideLoginBox();
			hideGroup("login");
			//set avatar for this user
			if (response.userAvatar) {//user has custom avatar saved
				document.getElementById("displayedAvatar").src = response.userAvatar;
			}
			else { //display a stock default avatar for user
				document.getElementById("displayedAvatar").setAttribute("src", "imgs/default_avatar.png");
			}
		}).catch(error => {	//fail callback
			let errorBox = document.getElementById("loginMessageBox");
			errorBox.style.display = "block";
			if (error == "TypeError: NetworkError when attempting to fetch resource.") {
				loginMicroserviceState = "down";
				setIconForMicroservice("loginMicroservice", "down");
				errorBox.innerHTML = "Login server is down, try again later...";
			}
			else {
				document.getElementById("registerMessageBox").innerHTML = error;
			}
		});
}

//decode JWT token
function parseJwt(token) {
	var base64Url = token.split('.')[1];
	var base64 = decodeURIComponent(atob(base64Url).split('').map(function (c) {
		return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
	}).join(''));

	//the returned value is a json, with the standard values for JWT (sub,jti,iat,nbf,exp...)
	return JSON.parse(base64);
}

//check if JWT is expired
function expiredJWT(token) {
	token = parseJwt(token);
	//problem if the auth server is in another time zone than the client! Not the case here
	let current_time = Date.now() / 1000,
		ret = false;

	if (token.exp < current_time) {
		//delete expired token (the browser should deletes them automatically after a while, but just to make sure)
		localStorage.removeItem('JWT');
		sessionStorage.removeItem('JWT');
		localStorage.removeItem('avatar');
		ret =true
	}

	return ret;
}

//get JWT from local or session storage
function getJWTFromStorage() {
	let ret = null;

	if (localStorage.getItem('JWT')) {
		ret = localStorage.getItem('JWT');
	}
	else if (sessionStorage.getItem('JWT')) {
		ret = sessionStorage.getItem('JWT');
	}
	return ret;
}

//get user name from JWT
function getUserFromJWT() {
	let token = getJWTFromStorage();
	if (token && !expiredJWT(token)) {
		return parseJwt(token).sub;
	}
	return null;
}

//ok pressed on Register box
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

	//note: again, a loading screen is coded, but I will not use it. See Login above to understand why
	//send user, passwd and avatar to microservice as new values
	if (loginMicroserviceState == "running") {
		loginMicroserviceState = "busy";
		setIconForMicroservice("loginMicroservice", "busy");
	}
	let startPing = new Date();
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
	}).then(function (response) {	//success callback
		//get statistical data about access data and ping
		loginLastAccessed = new Date();
		loginMicroserviceState = "running";
		setIconForMicroservice("loginMicroservice", "running");
		loginPing = loginLastAccessed - startPing;
		//handle user errors
		document.getElementById("registerMessageBox").style.display = "block";
		switch (response.status) {
			case 200: 
				document.getElementById("registerMessageBox").innerHTML = "Success, you may go back and login...";
				break;
			case 409:
				showDiagError("Error: user name already exists!", nameInputErrorX, nameInputErrorY);
				break;
			case 400:
				document.getElementById("registerMessageBox").innerHTML = "Bad request, your input values are not valid!";
				break;
			case 413:
				showDiagError("Error: user name is too long!", nameInputErrorX, nameInputErrorY);
		}
		}).catch(error => {	//fail callback
			let errorBox = document.getElementById("registerMessageBox");
			errorBox.style.display = "block";
			errorBox.style.color = "red";
			if (error == "TypeError: NetworkError when attempting to fetch resource.") {
				loginMicroserviceState = "down";
				setIconForMicroservice("loginMicroservice", "down");
				document.getElementById("registerMessageBox").innerHTML = "Login server is down, try again later...";
			} else {
				document.getElementById("registerMessageBox").innerHTML = error;
			}
		});
}

//cancel button pressed on Login/Register
function hideLoginBox() {
	document.getElementById("loginBox").style.display="none";
}
function hideRegisterBox() {
	document.getElementById("registerBox").style.display = "none";
	showLoginBox();
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
		document.getElementById("registerAvatar").src = fileReader.result;
		avatarBase64 = fileReader.result;
	}
	fileReader.readAsDataURL(file);
}

//logout button
function logout() {
	localStorage.removeItem('JWT');
	sessionStorage.removeItem('JWT');
	localStorage.removeItem('avatar');
	hideGroup("logout");
}