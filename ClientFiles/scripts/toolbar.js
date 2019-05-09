for (let i = 0; i < document.getElementsByClassName("MSinfoBtn").length; i++) {
	document.getElementsByClassName("MSinfoBtn")[i].addEventListener("mouseenter", showMSInfo);
	document.getElementsByClassName("MSinfoBtn")[i].addEventListener("mouseleave", hideMSInfo);
}

//get item the user is hovering over
function getHoveredElement(e) {
	let hoveredElement = e.target || e.srcElement;

	return hoveredElement.id;
}

//get state for microservice
function getMicroserviceState(microserviceName) {
	if (microserviceName == "wordColorMicroservice") {
		return wordColorMicroserviceState;
	}
	if (microserviceName == "wordRepairMicroservice") {
		return wordRepairMicroserviceState;
	}
	if (microserviceName == "undoMicroservice") {
		return undoMicroserviceState;
	}
	if (microserviceName == "loginMicroservice") {
		return loginMicroserviceState;
	}
	if (microserviceName == "saveMicroservice") {
		return saveMicroserviceState;
	}
	if (microserviceName == "runMicroservice") {
		return runMicroserviceState;
	}
}

//populate microservice user info box
function writeMSInfo(e) {
	let about = document.getElementById("infAbout"),
		author = document.getElementById("infAuthor"),
		accessLevel = document.getElementById("infAccessLevel"),
		startedOn = document.getElementById("infStartedOn"),
		uptime = document.getElementById("infUptime"),
		warmUpPing = document.getElementById("infWarmPing"),
		lastAccessed = document.getElementById("infLastAccessedByYou"),
		ping = document.getElementById("infPing"),
		down = document.getElementById("infDown");
	const authorName = "Ionel Iva", freeAccess = "no login required, you can access all data on this server",
		protectedAccess = "you need to login to access this service",
		undefinedValue = "no data collected yet, ",
		abnormalPingExplain = " (the server was recently accessed from this browser session, that's why the war-up ping might be lower than the normal one)";

	author.innerText += authorName;
	switch (getHoveredElement(e)) {
		case "wordColorMicroservice": {
			about.innerText = "this microservice handles dynamic word coloring in the editor, according to dictionaries it stores for each language supported";
			accessLevel.innerText = freeAccess;
			startedOn.innerText = wordColorStartDate;
			uptime.innerText = getElapsedTime(wordColorStartDate);
			(wordColorWarmUpPing != null && wordColorPing != null && (wordColorWarmUpPing < wordColorPing))
				? warmUpPing.innerText = wordColorWarmUpPing + abnormalPingExplain
				: warmUpPing.innerText = wordColorWarmUpPing;
			wordColorLastAccessed == null ? lastAccessed.innerText = undefinedValue + "type something in the editor first..."
				: lastAccessed.innerText = wordColorLastAccessed;
			wordColorPing == null ? ping.innerText = undefinedValue + "you made no request to the server..."
				: ping.innerText = wordColorPing;
			down.innerText = "you will not be able to use custom text formatting and coloring";
		}
			break;
		case "wordRepairMicroservice": {
			//TODO
		}
			break;
		case "undoMicroservice": {
			about.innerText = "this microservice handles a custom undo and redo functionality, that preserves coloring and doesn't break underlying html structure";
			accessLevel.innerText = freeAccess;
			startedOn.innerText = undoRedoStartDate;
			uptime.innerText = getElapsedTime(undoRedoStartDate);
			(undoRedoWarmUpPing != null && undoRedoPing != null && (undoRedoWarmUpPing < undoRedoPing))
				? warmUpPing.innerText = undoRedoWarmUpPing + abnormalPingExplain
				: warmUpPing.innerText = undoRedoWarmUpPing;
			undoRedoLastAccessed == null ? lastAccessed.innerText = undefinedValue + "try to use undo or redo..."
				: lastAccessed.innerText = undoRedoLastAccessed;
			undoRedoPing == null ? ping.innerText = undefinedValue + "you made no request to the server..."
				: ping.innerText = undoRedoPing;
			down.innerText = "you will not be able to use undo functionality (and obviously no redo either)";
		}
			break;
		case "loginMicroservice": {
			about.innerText = "this microservice handles all login functionality, as well as security token distribution";
			accessLevel.innerText = protectedAccess;
			startedOn.innerText = loginStartDate;
			uptime.innerText = getElapsedTime(loginStartDate);
			(loginWarmUpPing != null && loginPing != null && (loginWarmUpPing < loginPing))
				? warmUpPing.innerText = loginWarmUpPing + abnormalPingExplain
				: warmUpPing.innerText = loginWarmUpPing;
			loginLastAccessed == null ? lastAccessed.innerText = undefinedValue + "try to re-log to get a reading..."
				: lastAccessed.innerText = loginLastAccessed;
			ping.innerText = loginPing;
			down.innerText = "you will suffer no repercussions for a while, because your security token will still be active. Once the token expires "
				+ "or you log out, you not be able to log in and will have to use the application in anonymous mode. You will still have access to most" 
				+ "of the functionality, but you will not be able to save or load files. If you close or refresh the browser session, your work will be lost."
				+ "You also loose access to a custom avatar picture, but you will get a default stock picture";
		}
			break;
		case "saveMicroservice": {
			//TODO
		}
			break;
		case "runMicroservice": {
			//TODO
		}
	}
}

//clear info box
function clearMSInfo() {
	document.getElementById("infAbout").innerText = "";
	document.getElementById("infAuthor").innerText = "";
	document.getElementById("infAccessLevel").innerText = "";
	document.getElementById("infStartedOn").innerText = "";
	document.getElementById("infUptime").innerText = "";
	document.getElementById("infLastAccessedByYou").innerText = "";
	document.getElementById("infWarmPing").innerText = "";
	document.getElementById("infDown").innerText = "";
}

//show info box while hovering the Microservice list
function showMSInfo(e) {
	let infoContainer = document.getElementById("toolbar_MSDetailedInfo");
	if (getMicroserviceState(getHoveredElement(e)) == "down") {
		document.getElementsByClassName("serverDown")[0].style.display = "block";
		for (let i = 0; i < document.getElementsByClassName("article").length; i++) {
			document.getElementsByClassName("article")[i].style.display = "none";
			document.getElementsByClassName("article")[i].nextElementSibling.style.display = "none";
			document.getElementById("toolbar_MSDetailedInfo").style.height=20+"px";
		}
	}
	else {
		document.getElementsByClassName("serverDown")[0].style.display = "none";
		for (let i = 0; i < document.getElementsByClassName("article").length; i++) {
			document.getElementsByClassName("article")[i].style.display = "inline";
			document.getElementsByClassName("article")[i].nextElementSibling.style.display = "inline";
			document.getElementById("toolbar_MSDetailedInfo").style.height = "initial";
		}
	}
	writeMSInfo(e);
	infoContainer.style.display = "block";
	setElementPosition(infoContainer, e.pageX, e.pageY); //this function is defined in "solutionExplorerUi.js"
}

//hide and clear info box while leaving hover
function hideMSInfo(e) {
	clearMSInfo();
	document.getElementById("toolbar_MSDetailedInfo").style.display = "none";
}

//get time elapsed since oldDate param, convert it to seconds/minutes/hours/days if needed
function getElapsedTime(oldDate) {
	let timeNow = new Date(),
		miliseconds = timeNow - new Date(oldDate),
		elapsed = miliseconds + " ms";

	if (miliseconds > 5000) { //get seconds
		let seconds = Math.floor(miliseconds / 1000);
		miliseconds = miliseconds % 1000;
		elapsed = seconds + " s, " + miliseconds + " ms";
		if (seconds > 60) {	//get hours
			let minutes = Math.floor(seconds / 60);
			seconds = seconds % 60;
			elapsed = minutes + " m, " + seconds + " s, " + miliseconds + " ms";
			if (minutes > 60) {
				let hours = Math.floor(hours / 60);
				minutes = minutes % 60;
				elapsed = hours + " h, " + minutes + " m, " + seconds + " s, " + miliseconds + " ms";
			}
		}
	}
	return elapsed;
}

//set status icon for a microservice
function setIconForMicroservice(microserviceName, state) {
	let	icon = document.getElementById(microserviceName).previousElementSibling;

	if (state == "down") {
		icon.classList.remove("green");
		icon.classList.remove("yellow");
		icon.classList.remove("circle");
		icon.innerHTML = "&#128128;";
		return;
	} 
	if (state == "busy") {
		icon.classList.remove("green");
		if (!icon.classList.contains("circle")) {
			icon.classList.add("circle");
		}
		icon.classList.add("yellow");
		icon.innerText = "-";
		return;
	}
	if (state == "running") {
		icon.classList.remove("yellow");
		if (!icon.classList.contains("circle")) {
			icon.classList.add("circle");
		}
		icon.classList.add("green");
		icon.innerText = "-";
		return;
	}
}