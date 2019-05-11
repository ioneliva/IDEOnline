document.getElementById("loginOptionsBtn").addEventListener("click", showLoginOptionsMenu);
//menu hiding on resize, click away or escape
window.addEventListener("resize", hideLoginOptionsMenu);
document.addEventListener("mousedown", hideLoginOptionsMenu);
document.addEventListener("keydown", hideLoginOptionsOnEscape);
//buttons on the menu
document.getElementById("loginOptions_ChangeUsername").addEventListener("mousedown", showChangeUsernameForm);
document.getElementById("loginOptions_ChangePassword").addEventListener("mousedown", showChangePasswdForm);
document.getElementById("loginOptions_ChangeAvatar").addEventListener("mousedown", showChangeAvatarForm);
//buttons on the forms
document.getElementById("changeNameCancelBtn").addEventListener("click", hideChangeUsernameForm);
document.getElementById("changePasswdCancelBtn").addEventListener("click", hideChangePasswdForm);
document.getElementById("changeAvatarCancelBtn").addEventListener("click", hideChangeAvatarForm);

//show options menu on left click
function showLoginOptionsMenu(e) {
	let menu = document.getElementById("LoginOptionsMenu");

	setElementPosition(menu, e.pageX, e.pageY);
	menu.style.display = "block";
}

//hide menu when user clicks away
function hideLoginOptionsMenu() {
	document.getElementById("LoginOptionsMenu").style.display = "none";
}
//hide menu when user presses Esc
function hideLoginOptionsOnEscape(e) {
	if (readMyPressedKey(e) == "Escape") {
		hideLoginOptionsMenu();
	}
}

//show forms
function showChangeUsernameForm() {
	document.getElementById("changeNameBox").style.display = "block";
}
function showChangePasswdForm() {
	document.getElementById("changePasswordBox").style.display = "block";
}
function showChangeAvatarForm() {
	document.getElementById("changeAvatarBox").style.display = "block";
}

//cancel button pressed on forms
function hideChangeUsernameForm() {
	document.getElementById("changeNameBox").style.display = "none";
}
function hideChangePasswdForm() {
	document.getElementById("changePasswordBox").style.display = "none";
}
function hideChangeAvatarForm() {
	document.getElementById("changeAvatarBox").style.display = "none";
}