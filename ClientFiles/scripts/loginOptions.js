document.getElementById("loginOptionsBtn").addEventListener("click", showLoginOptionsMenu);
//menu hiding on resize, click away or escape
window.addEventListener("resize", hideLoginOptionsMenu);
document.addEventListener("mousedown", hideLoginOptionsMenu);
document.addEventListener("keydown", hideLoginOptionsOnEscape);
//buttons on the menu
document.getElementById("loginOptions_ChangeUsername").addEventListener("mousedown", showChangeUsernameForm);
document.getElementById("loginOptions_ChangePassword").addEventListener("mousedown", showChangePasswdForm);
document.getElementById("loginOptions_ChangeAvatar").addEventListener("mousedown", showChangeAvatarForm);
document.getElementById("loginOptions_DeleteAccount").addEventListener("mousedown", showWarningBeforeDelete);
//cancel on the forms
document.getElementById("changeCancelBtn").addEventListener("click", hideChangeDetailsForm);
//ok buttons for each functionality
document.getElementById("changeNameOkBtn").addEventListener("click", changeUserName);
document.getElementById("changePasswdNameOkBtn").addEventListener("click", changeUserPasswd);
document.getElementById("changeAvatarOkBtn").addEventListener("click", changeUserAvatar);
//browse button on select avatar
document.getElementById("changeAvatarInput").addEventListener("change", selectAvatarPicForChange);

//show options menu on left click
function showLoginOptionsMenu(e) {
	let menu = document.getElementById("loginOptionsMenu");

	setElementPosition(menu, e.pageX, e.pageY);
	menu.style.display = "block";
}

//hide menu when user clicks away
function hideLoginOptionsMenu() {
	document.getElementById("loginOptionsMenu").style.display = "none";
}
//hide menu when user presses Esc
function hideLoginOptionsOnEscape(e) {
	if (readMyPressedKey(e) == "Escape") {
		hideLoginOptionsMenu();
	}
}

//clear success and error messages in the form
function clearMessages() {
	document.getElementById("changeDetailsMessageBox").innerHTML = "";
	document.getElementById("changeDetailsErrorBox").innerHTML = "";
}

//return user changes form to default values
function resetForm() {
	clearMessages();
	for (let i = 0; i < document.getElementsByClassName("changeName").length; i++) {
		document.getElementsByClassName("changeName")[i].style.display = "none";
	}
	for (let i = 0; i < document.getElementsByClassName("changePasswd").length; i++) {
		document.getElementsByClassName("changePasswd")[i].style.display = "none";
	}
	for (let i = 0; i < document.getElementsByClassName("changeAvatar").length; i++) {
		document.getElementsByClassName("changeAvatar")[i].style.display = "none";
	}
}

//show elements of the form that belong to a specific function
function showChangeUsernameForm() {
	resetForm();
	document.getElementById("changeDetailsMessageBox").style.color = "white";
	document.getElementById("changeDetailsMessageBox").innerText = "You are logged as " + getUserFromJWT();
	document.getElementById("changeDetailsMessageBox").style.display = "block";
	for (let i = 0; i < document.getElementsByClassName("changeName").length; i++) {
		document.getElementsByClassName("changeName")[i].style.display = "block";
	}
	document.getElementById("changeUserDetailsBox").style.display = "block";
}
function showChangePasswdForm() {
	resetForm();
	for (let i = 0; i < document.getElementsByClassName("changePasswd").length; i++) {
		document.getElementsByClassName("changePasswd")[i].style.display = "block";
	}
	document.getElementById("changeUserDetailsBox").style.display = "block";
}
function showChangeAvatarForm() {
	resetForm();
	for (let i = 0; i < document.getElementsByClassName("changeAvatar").length; i++) {
		document.getElementsByClassName("changeAvatar")[i].style.display = "block";
	}
	document.getElementById("changeUserDetailsBox").style.display = "block";
}

//cancel button pressed on form
function hideChangeDetailsForm() {
	document.getElementById("changeUserDetailsBox").style.display="none";
}

//change user name
function changeUserName() {
	let errorBox = document.getElementById("changeDetailsErrorBox"),
		successBox = document.getElementById("changeDetailsMessageBox");

	//check if desired user name field is not empty
	if (document.getElementById("changeNameInput").value.toString() == "") {
		errorBox.innerHTML = "Error: user name cannot be empty!";
		errorBox.style.display = "block";
		return;
	}

	//because the user name is part of the JWT access token, special care must be taken here. Generating a new token will 
	//make the user wait for a round trip to the auth server (which may fail in the mean time and cause even more chain problems)
	//my solution is to forcefully log out the user. On login his JWT token will get refreshed automatically with the new name credentials
	//of course I'll display a warning message first and let him go back
	let warningContainer = document.getElementById("criticalWarn"),
		stretchBackground = document.getElementById("criticalWarnStretchBackground");

	formatWarningContainer("criticalWarn","initial");
	warningContainer.style.display="block";
	stretchBackground.style.display = "block";

	//user pressed cancel on the warning message
	document.getElementById("warnCancel").onclick = function () {
		formatWarningContainer("criticalWarn", "initial");
		warningContainer.style.display = "none";
		stretchBackground.style.display = "none";
		hideChangeDetailsForm();
	};

	//user agreed to continue after the warning
	document.getElementById("warnOk").onclick = function () {
		let token = localStorage.getItem("JWT") || sessionStorage.getItem("JWT"),
			newName = document.getElementById("changeNameInput").value.toString();

		if (loginMicroservice.state == "running") {
			loginMicroservice.state = "busy";
			setIconForMicroservice("loginMicroservice", "busy");
		}
		let startPing = new Date();
		//sending data to server
		fetch(apiGateway + "/users/editName", {
			method: 'POST',
			body: JSON.stringify({
				"newName": newName
			}),
			headers: {
				'Content-Type': 'application/json',
				'Authorization': "Bearer " + token
			}
		}).then(response => {	//success callback
			//get statistical data about access data and ping
			loginMicroservice.accessedDate = new Date();
			loginMicroservice.state = "running";
			setIconForMicroservice("loginMicroservice", "running");
			loginMicroservice.ping = loginMicroservice.accessedDate - startPing;
			//handle user errors
			formatWarningContainer("criticalWarn", "initial");
			warningContainer.style.display = "none";
			stretchBackground.style.display = "none";
			errorBox.style.display = "block";
			successBox.style.display = "block";
			switch (response.status) {
				case 401:
					errorBox.innerHTML = "Error: You are not authorized. Session is expired. Try to relog";
					break;
				case 409:
					errorBox.innerHTML = "Error: user name already taken!";
					break;
				case 413:
					errorBox.innerHTML = "Error: User name exceedes 20 characters!";
					break;
				case 420:
					errorBox.innerHTML = "The server failed on the update method. Sorry, try again...";
					break;
				case 200: {
					//we log the user out before showing him the success message, because he could refresh the page 
					//while the code is paused and cancel the jwt access token removal. Would possess a token he shouldn't have
					logout(); 
					warningContainer.firstElementChild.innerText = "Rename successful!"
					document.getElementById("changeDetailsMessageBox").innerText="You are not logged"; 
					formatWarningContainer("criticalWarn", "final");
					stretchBackground.style.display = "block";
					warningContainer.style.display = "block";
					document.getElementById("finalOk").onclick = function () {
						warningContainer.style.display = "none";
						stretchBackground.style.display = "none";
						hideChangeDetailsForm();
					}
				}
			}
			}).catch(error => {	//fail callback
				stretchBackground.style.display = "none";
				warningContainer.style.display = "none";
				let errorBox = document.getElementById("changeDetailsErrorBox");
				errorBox.style.display = "block";
				switch (error) {
					case "TypeError: NetworkError when attempting to fetch resource.":
						errorBox.innerHTML = "Login server is down, try again later...";
						break;
					default:
						errorBox.innerHTML = error;
				}
		});
	};
}

//change user password
function changeUserPasswd() {
	let token = localStorage.getItem("JWT") || sessionStorage.getItem("JWT"),
		errorBox = document.getElementById("changeDetailsErrorBox"),
		successBox = document.getElementById("changeDetailsMessageBox"),
		passwd = document.getElementById("changePasswdInput").value.toString(),
		confirmedPasswd = document.getElementById("changePasswdRepInput").value.toString();

	errorBox.style.display = "none";
	successBox.style.display = "none";

	//check if password fields are empty
	if (passwd == "" || confirmedPasswd == "") {
		errorBox.innerHTML = "Error: password and confirm password cannot be empty!";
		errorBox.style.display = "block";
		return;
	}
	//check if desired password and repeat password match
	if (passwd != confirmedPasswd) {
		errorBox.innerHTML = "Password and confirmed password must be the same!";
		errorBox.style.display = "block";
		return;
	}

	if (loginMicroservice.state == "running") {
		loginMicroservice.state = "busy";
		setIconForMicroservice("loginMicroservice", "busy");
	}
	let startPing = new Date();
	//send data to server
	fetch(apiGateway + "/users/editPassword", {
		method: 'POST',
		body: JSON.stringify({
			"newPassword": passwd
		}),
		headers: {
			'Content-Type': 'application/json',
			'Authorization': "Bearer " + token
		}
	}).then(function (response) {	//success callback
		//get statistical data about access data and ping
		loginMicroservice.accessedDate = new Date();
		loginMicroservice.state = "running";
		setIconForMicroservice("loginMicroservice", "running");
		loginMicroservice.ping = loginMicroservice.accessedDate - startPing;
		//handle user errors
		document.getElementById("changeDetailsMessageBox").style.display = "block";
		document.getElementById("changeDetailsErrorBox").style.display = "block";
		switch (response.status) {
			case 420: {
				errorBox.innerHTML = "The server failed on the update method. Sorry, try again...";
				errorBox.style.display = "block";
			}
				break;
			case 200: {
				successBox.innerHTML = "Success: you password was changed";
				successBox.style.display = "block";
			}
		}
	}).catch(error => {	//fail callback
		if (error == "TypeError: NetworkError when attempting to fetch resource.") {
			loginMicroservice.state = "down";
			setIconForMicroservice("loginMicroservice", "down");
			errorBox.innerHTML = "Login server is down, try again later...";
			errorBox.style.display = "block";
		}
	});
}

//change user avatar
function changeUserAvatar() {
	let token = localStorage.getItem("JWT") || sessionStorage.getItem("JWT"),
		errorBox = document.getElementById("changeDetailsErrorBox"),
		successBox = document.getElementById("changeDetailsMessageBox");

	successBox.style.display = "none";
	errorBox.style.display = "none";

	if (loginMicroservice.state == "running") {
		loginMicroservice.state = "busy";
		setIconForMicroservice("loginMicroservice", "busy");
	}
	let startPing = new Date();
	//send data to server
	fetch(apiGateway + "/users/editAvatar", {
		method: 'POST',
		body: JSON.stringify({
			"newAvatar": avatarBase64
		}),
		headers: {
			'Content-Type': 'application/json',
			'Authorization': "Bearer " + token
		}
	}).then(function (response) {	//success callback
		//get statistical data about access data and ping
		loginMicroservice.accessedDate = new Date();
		loginMicroservice.state = "running";
		setIconForMicroservice("loginMicroservice", "running");
		loginMicroservice.ping = loginMicroservice.accessedDate - startPing;
		//handle user errors
		successBox.style.display = "block";
		errorBox.style.display = "block";
		switch (response.status) {
			case 420: {
				errorBox.innerHTML = "The server failed on the update method. Sorry, try again...";
				errorBox.style.display = "block";
			}
				break;
			case 200: {
				document.getElementById("displayedAvatar").src = avatarBase64;
				successBox.innerHTML = "Success: your avatar images was changed. Relog to use it";
				successBox.style.display = "block";
			}
		}
	}).catch(error => {	//fail callback
		errorBox.style.display = "block";
		if (error == "TypeError: NetworkError when attempting to fetch resource.") {
			loginMicroservice.state = "down";
			setIconForMicroservice("loginMicroservice", "down");
			errorBox.innerHTML = "Login server is down, try again later...";
		}
	});
}

//hide or display elements of the warning box
function formatWarningContainer(containerId, state) {
	let okBtn, cancelBtn, finalOkBtn;
	if (containerId == "criticalWarn") {
			okBtn = document.getElementById("warnOk"),
			cancelBtn = document.getElementById("warnCancel"),
			finalOkBtn = document.getElementById("finalOk");
	}
	if (containerId == "criticalWarn_") {
			okBtn = document.getElementById("warnOk_"),
			cancelBtn = document.getElementById("warnCancel_"),
			finalOkBtn = document.getElementById("finalOk_");
	}

	switch (state) {
		case "initial": {
			if (containerId == "criticalWarn") {
				document.getElementById("criticalWarn").firstElementChild.innerHTML =
					"This operation will log you out. You will loose all unsaved data! Are you sure?";
			}
			if (containerId == "criticalWarn_") {
				document.getElementById("criticalWarn_").firstElementChild.innerHTML =
					"You are about to delete your account. Are you sure?";
			}
			okBtn.style.display = "inline";
			cancelBtn.style.display = "inline";
			finalOkBtn.style.display = "none";
		}
			break;
		case "final": {
			okBtn.style.display = "none";
			cancelBtn.style.display = "none";
			finalOkBtn.style.display = "block";
		}
			break;
	}
}

//avatar selection in browse for avatar
function selectAvatarPicForChange() {
	let file = this.files[0],
		mime = ["image/jpeg", "image/svg+xml", "image/png", "image/gif"],
		fileReader = new FileReader(),
		errBox = document.getElementById("changeDetailsErrorBox");

	errBox.style.display = "none";

	//check if user actually selected a file or left the field empty
	if (document.getElementById("changeAvatarInput").files.length == 0) {
		errBox.style.display = "block";
		errBox.innerText = "You must select a file or go back";
		return;
	}

	//check valid file type
	if (mime.indexOf(file.type) === -1) {
		errBox.style.display = "block";
		errBox.innerText = "Only jpg, svg, png and gif files allowed";
		return;
	}
	//check if file doesn't exceed maximum allowed size (1mb set)
	if (file.size > 1024 * 1024) {
		errBox.style.display = "block";
		errBox.innerText = "Size must not exceed 1 MB";
		return;
	}
	//all ok, save the image in avatarBase64 variable for later use
	fileReader.onload = function () {
		avatarBase64 = fileReader.result;
	}
	fileReader.readAsDataURL(file);
}

//show a warning, then delete account
function showWarningBeforeDelete(e) {
	let warnBox = document.getElementById("criticalWarn_"),
		warnBackground = document.getElementById("criticalWarnStretchBackground_");

	//display warning in the middle of the screen, covering all other elements
	formatWarningContainer("criticalWarn_", "initial");
	warnBox.style.top = "45%";
	warnBox.style.left = "45%";
	warnBackground.style.display = "block";
	warnBox.style.display = "block";

	//user pressed back on the warning
	document.getElementById("warnCancel_").onclick = function () {
		warnBox.style.display = "none";
		warnBackground.style.display = "none";
	}

	//user agreed to proceed on warning
	document.getElementById("warnOk_").onclick = function () {
		let token = localStorage.getItem("JWT") || sessionStorage.getItem("JWT");

		formatWarningContainer("criticalWarn_", "initial");
		warnBox.style.display = "none";
		warnBackground.style.display = "none";

		if (loginMicroservice.state == "running") {
			loginMicroservice.state = "busy";
			setIconForMicroservice("loginMicroservice", "busy");
		}
		let startPing = new Date();
		//send data to server
		fetch(apiGateway + "/users/deleteAccount", {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': "Bearer " + token
			}
		}).then(function (response) {	//success callback
			//get statistical data about access data and ping
			loginMicroservice.accessedDate = new Date();
			loginMicroservice.state = "running";
			setIconForMicroservice("loginMicroservice", "running");
			loginMicroservice.ping = loginMicroservice.accessedDate - startPing;
			//handle user errors
			formatWarningContainer("criticalWarn_", "final");
			warnBox.style.display = "block";
			warnBackground.style.display = "block";
			switch (response.status) {
				case 420: {
					warnBox.firstElementChild.innerHTML = "The server failed on the delete method. Sorry, try again...";
				}
					break;
				case 200: {
					logout();
					warnBox.firstElementChild.innerHTML = "Your accound was deleted";
					document.getElementById("finalOk_").onclick = function () {
						warningContainer.style.display = "none";
						stretchBackground.style.display = "none";
					}
				}
			}
			formatWarningContainer("criticalWarn_", "initial");
			warnBox.style.display = "none";
			warnBackground.style.display = "none";
		}).catch(error => {	//fail callback
			if (error == "TypeError: NetworkError when attempting to fetch resource.") {
				loginMicroservice.state = "down";
				setIconForMicroservice("loginMicroservice", "down");
				formatWarningContainer("criticalWarn_", "final");
				warnBox.style.display = "block";
				warnBackground.style.display = "block";
				warnBox.firstElementChild.innerHTML = "Login server is down, try again later...";
			}
		});
	}
}