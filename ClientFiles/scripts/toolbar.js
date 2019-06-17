document.getElementById("showMSHiddenInfo").addEventListener("click", showMicroserviceList);
for (let i = 0; i < document.getElementsByClassName("MSinfoBtn").length; i++) {
	document.getElementsByClassName("MSinfoBtn")[i].addEventListener("mouseenter", showMSInfo);
	document.getElementsByClassName("MSinfoBtn")[i].addEventListener("mouseleave", hideMSInfo);
}

//show microservice list in toolbar
function showMicroserviceList() {
	if (document.getElementById("MSHiddenInfo").style.display == "block") {
		document.getElementById("showMSHiddenInfo").nextElementSibling.nextElementSibling.textContent = "(*click to expand)";
		document.getElementById("MSHiddenInfo").style.display = "none";
	} else {
		for (let i = 0; i < document.getElementsByClassName("MSinfoBtn").length; i++) {
			let microservice = document.getElementsByClassName("MSinfoBtn")[i];
			//in javascript all variables are available within their scope as named properties of their parent object, so var x == window["x"] for globals
			let microserviceObject = window[microservice.id];
			if (!(microserviceObject instanceof HTMLButtonElement)) {
				setIconForMicroservice(microservice.id, microserviceObject.state);
			}
		}
		document.getElementById("showMSHiddenInfo").nextElementSibling.nextElementSibling.textContent = "(*hover over each to get more info)";
		document.getElementById("MSHiddenInfo").style.display = "block";
	}
}

//get item the user is hovering over
function getHoveredElement(e) {
	let hoveredElement, microserviceObject;

	hoveredElement= e.target || e.srcElement;
	microserviceObject = window[hoveredElement.id];

	return microserviceObject;
}

//clear info box
function clearMicroserviceInfoBox() {
	let infoContainer = document.getElementById("toolbar_MSDetailedInfo");

	while (infoContainer.firstElementChild) {
		infoContainer.removeChild(infoContainer.firstElementChild);
	}
}

//add an article to microservice info box (third parameter is optional)
function createArticle(title, articleContent, addRedColor) {
	let infoContainer = document.getElementById("toolbar_MSDetailedInfo"), article, content;

	article = document.createElement("SPAN");
	article.className = "article";
	if (addRedColor) {
		article.classList.add("serverDown");
	}
	article.textContent = title;
	content = document.createElement("SPAN");
	content.textContent = articleContent;
	infoContainer.appendChild(article);
	infoContainer.appendChild(content);
	infoContainer.appendChild(document.createElement("BR"));
}

//show info box while hovering the Microservice list
function showMSInfo(e) {
	let infoContainer = document.getElementById("toolbar_MSDetailedInfo");

	clearMicroserviceInfoBox();
	//populate info box with articles
	if ((getHoveredElement(e)).state == "down") { //microservice hovered is down
		createArticle("About: ", getHoveredElement(e).about);
		createArticle("This server is currently: ", getHoveredElement(e).state, true);
		createArticle("When down: ", getHoveredElement(e).whenDown, true);
	}
	else { //microservice is running
		createArticle("About: ", getHoveredElement(e).about);
		createArticle("This server is currently: ", getHoveredElement(e).state);
		createArticle("Acess level needed: ", getHoveredElement(e).accessLevel);
		if (getHoveredElement(e).serverStartDate != null) {
			createArticle("Server started on: ", getHoveredElement(e).serverStartDate);
			createArticle("Server uptime: ", getElapsedTime(getHoveredElement(e).serverStartDate));
		}
		let warmup = getHoveredElement(e).warmupPing, ping = getHoveredElement(e).ping,
			abnormalPingExplain = " (the server was recently accessed from this browser session, that's why the warm-up ping might be lower than the normal one)";
		if (warmup != 0 && ping != 0 && (warmup < ping)) {
			createArticle("Pre warm-up ping: ", (warmup + abnormalPingExplain));
		}
		else {
			if (warmup != 0) {
				createArticle("Pre warm-up ping: ", getHoveredElement(e).warmupPing);
			}
		}
		if (getHoveredElement(e).accessedDate != null) {
			createArticle("Last accessed from this machine: ", getHoveredElement(e).accessedDate);
		}
		if (getHoveredElement(e).ping != 0) {
			createArticle("Last ping from this machine: ", getHoveredElement(e).ping);
		} else {
			createArticle("Last ping from this machine: ", " no data collected yet, use the microservice first...");
		}
		createArticle("When down: ", getHoveredElement(e).whenDown, true);
	}
	infoContainer.style.display = "block";
	setElementPosition(infoContainer, e.pageX, e.pageY); //this function is defined in "solutionExplorerUi.js"
}

//hide and clear info box while leaving hover
function hideMSInfo(e) {
	clearMicroserviceInfoBox();
	document.getElementById("toolbar_MSDetailedInfo").style.display = "none";
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