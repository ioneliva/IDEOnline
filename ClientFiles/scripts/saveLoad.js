document.getElementById("toolbar_SaveBtn").addEventListener("click", save);
document.getElementById("loadProjectBtn").addEventListener("click", showLoadScreen);
document.getElementById("loadFileSelectCancelBtn").addEventListener("click", hideLoadScreen);
document.getElementById("loadFileSelectOkBtn").addEventListener("click", load);
document.getElementById("loadFileSelectDeleteBtn").addEventListener("click", deleteProject);

//save solution tree contents into an object
function fileTreeToObject(usedByRun) {
	let fileContent = "",
		solutionExplorer = document.getElementById("solutionWindow"),
		root = solutionExplorer.querySelector(".project"),
		dirs = solutionExplorer.querySelectorAll(".directory"),
		files = solutionExplorer.querySelectorAll(".file"),
		fileTree = new Array(),
		fileTreeMember;

	fileTree.push({
		"root": root.id,
		"language": projectLang
	});
	for (let i = 0; i < dirs.length; i++) {
		fileTreeMember = {
			"name": dirs[i].id,
			"type": "Directory",
			"parent": dirs[i].parentElement.parentElement.previousElementSibling.id
		};
		fileTree.push(fileTreeMember);
	}
	for (let i = 0; i < files.length; i++) {
		if (getEditorForFile(files[i].id) != null) {
			if (usedByRun) {	//optional parameter passed, function is used for Running
				fileContent = getEditorForFile(files[i].id).innerText;
			}
			else {	//function used for Saving
				fileContent = getEditorForFile(files[i].id).innerHTML;
			}
		}

		fileTreeMember = {
			"name": files[i].id,
			"type": "File",
			"parent": files[i].parentElement.parentElement.previousElementSibling.id,
			"content": fileContent
		};
		fileTree.push(fileTreeMember);
	}

	return fileTree;
}

//send file structure and contents as Json string to server for storage 
function save() {
	let token = localStorage.getItem("JWT") || sessionStorage.getItem("JWT");

	if (saveMicroservice.state == "running") {
		saveMicroservice.state = "busy";
		setIconForMicroservice("saveMicroservice", "busy");
	}
	let startPing = new Date();
	fetch(apiGateway + "/save", {
		method: 'PUT',
		body: JSON.stringify(fileTreeToObject()),
		headers: {
			'Content-Type': 'application/json',
			'Authorization': "Bearer " + token
		}
	}).then(response => {	//success callback
		//get statistical data about access data and ping
		saveMicroservice.accessedDate = new Date();
		saveMicroservice.state = "running";
		setIconForMicroservice("saveMicroservice", "running");
		saveMicroservice.ping = saveMicroservice.accessedDate - startPing;
		if (response.status == 200) {
			alert("Saved");
		}
		return response.json();
	}).catch(error => {	//fail callback
		if (error == "TypeError: NetworkError when attempting to fetch resource.") {
			saveMicroservice.state = "down";
			setIconForMicroservice("saveMicroservice", "down");
			alert("Save microservice is down, try again later...");
		}
	});
}

//create a container in load file list window, holding project information
function createProjectContainer(projectName, projectLang) {
	let projectDiv = document.createElement("div"),
		lineIcon = document.createElement("img");

	projectDiv.className = "projectInLoadList";
	projectDiv.id = projectName + "_projectInLoadList";
	lineIcon.className = "slEIcon";
	lineIcon.setAttribute("src", "imgs/root.png");
	projectDiv.appendChild(lineIcon);
	projectDiv.appendChild(document.createTextNode((projectName + " , language: " + projectLang)));

	return projectDiv;
}

//select item in loading list (similar to a selection with the mouse or holdig Shift key)
function selectItemInLoadList(item) {
	let range = document.createRange(),
		sel = window.getSelection();

	if (item && (item instanceof HTMLDivElement)) {
		range.setStartAfter(item.firstElementChild); //we don't select the icon
		range.setEndAfter(item);
		sel.removeAllRanges();
		sel.addRange(range);
	}
}

//we store the clicked item as a global. Trasmitting it as a parameter makes the code too contorted
var clickedProject;

//show load screen, with a list of projects saved by this user
function showLoadScreen() {
	let fileContainer = document.getElementById("fileListContainer");

	fileContainer.innerHTML = "";
	document.getElementById("projDelWarnStretchBackground").style.display = "none";
	document.getElementById("projDelWarn").style.display = "none";

	//populate list with project names from the server
	let token = localStorage.getItem("JWT") || sessionStorage.getItem("JWT");

	if (saveMicroservice.state == "running") {
		saveMicroservice.state = "busy";
		setIconForMicroservice("saveMicroservice", "busy");
	}
	let startPing = new Date();
	fetch(apiGateway + "/projectManager/getlist", {
		method: 'GET',	//the default for fetch is GET method anyway
		headers: {
			'Content-Type': 'application/json',
			'Authorization': "Bearer " + token
		}
	}).then(response => {	//success callback
		//get statistical data about access data and ping
		saveMicroservice.accessedDate = new Date();
		saveMicroservice.state = "running";
		setIconForMicroservice("saveMicroservice", "running");
		saveMicroservice.ping = saveMicroservice.accessedDate - startPing;
		//convert Json string representation into Json Array
		return response.json();
	}).then(response => {	//handle response payload
		for (let i = 0; i < response.length; i++) {
			//convert the i-th part of the Json Array into Object with properties
			let loadMS = JSON.parse(response[i]);
			//create a styled div with an icon and result, insert it in the load box
			projectDiv = createProjectContainer(loadMS.Name, loadMS.Language);
			fileContainer.appendChild(projectDiv);
			//make it selectable with one click
			projectDiv.onclick = function (event) {
				selectItemInLoadList(event.target);
				//store it in the global variable
				clickedProject = loadMS.Name;
			}
		}
	}).catch(error => {	//fail callback
		if (error == "TypeError: NetworkError when attempting to fetch resource.") {
			saveMicroservice.state = "down";
			setIconForMicroservice("saveMicroservice", "down");
			alert("Save microservice is down, try again later...");
		}
	});

	document.getElementById("fileSelectorStretchBackground").style.display = "block";
	document.getElementById("loadFileSelectorWindow").style.display = "block";
}

//get file structure from server for a project, replace file tree with it
function getStructureFromServer(projectName) {
	let token = localStorage.getItem("JWT") || sessionStorage.getItem("JWT");

	if (saveMicroservice.state == "running") {
		saveMicroservice.state = "busy";
		setIconForMicroservice("saveMicroservice", "busy");
	}
	let startPing = new Date();
	fetch(apiGateway + "/load?projectName=" + projectName, {
		method: 'GET',	//the default for fetch is GET method anyway
		headers: {
			'Content-Type': 'application/json',
			'Authorization': "Bearer " + token
		}
	}).then(response => {	//success callback
		//get statistical data about access data and ping
		saveMicroservice.accessedDate = new Date();
		saveMicroservice.state = "running";
		setIconForMicroservice("saveMicroservice", "running");
		saveMicroservice.ping = saveMicroservice.accessedDate - startPing;
		//convert Json string representation into Json Array
		return response.json();
		}).then(response => {	//handle response payload
			//delete old project contents
			doCloseProject();
			for (let i = 0; i < response.length; i++) {
				//convert the i-th part of the Json Array into Object with properties
				let loadMS = JSON.parse(response[i]);
				//attach new values in Solution Explorer
				if (loadMS.Name.indexOf(".") == -1) {
					if (loadMS.Parent == "") {	//root element
						//set root on Solution Explorer window
						let root = document.getElementsByClassName("project")[0];
						root.lastChild.nodeValue = loadMS.Name;
						root.id = loadMS.Name;
						projectLang = loadMS.Type;
					} else {	//directory
						let dirStructure = createDirStructure(loadMS.Name);
						attachDirToParent(dirStructure, document.getElementById(loadMS.Parent));
					}
				} else {	//file
					let fileStructure = createFileStructure(getFileNameFromFileId(loadMS.Name), loadMS.Parent);
					attachFileToParent(fileStructure, document.getElementById(loadMS.Parent));
					//load the content for files
					if (loadMS.Content != "") {
						saveFileForSession(loadMS.Name, loadMS.Content);
					}
				}	
			}
			//make new solution window tree visible
			document.getElementById("solExplorerUL").style.display = "block";
			//hide 'new project' and 'welcome' window if the user is one those sections
			document.getElementsByClassName("newProject")[0].style.display = "none";
			document.getElementsByClassName("welcome")[0].style.display = "none";
	}).catch(error => {	//fail callback
		if (error == "TypeError: NetworkError when attempting to fetch resource.") {
			saveMicroservice.state = "down";
			setIconForMicroservice("saveMicroservice", "down");
			alert("Save microservice is down, try again later...");
		}
	});
}

//replace file tree with the data from the server
function load() {
	if (clickedProject) {	//if no project was selected, ignore load request
		getStructureFromServer(clickedProject);
		hideLoadScreen();
	}
}

//hide load screen
function hideLoadScreen() {
	document.getElementById("fileSelectorStretchBackground").style.display = "none";
	document.getElementById("loadFileSelectorWindow").style.display = "none";
}

//delete project from load window
function deleteProject() {
	//display warning message
	if (!clickedProject) {
		return;
	}
	document.getElementById("delProjLabel").innerHTML = "This will delete the project \"" + clickedProject + "\" from the database.<br>Are you sure ?";
	document.getElementById("projDelWarnStretchBackground").style.display = "block";
	document.getElementById("projDelWarn").style.display = "block";
	//user canceled deletion
	document.getElementById("projDelwarnCancel").onclick = function () {
		document.getElementById("projDelWarnStretchBackground").style.display = "none";
		document.getElementById("projDelWarn").style.display = "none";
		return;
	}
	//user accepted to continue on the warning
	document.getElementById("projDelwarnOk").onclick = function() {
		let markedProject = document.getElementById(clickedProject + "_projectInLoadList"),
			token = localStorage.getItem("JWT") || sessionStorage.getItem("JWT");

		if (saveMicroservice.state == "running") {
			saveMicroservice.state = "busy";
			setIconForMicroservice("saveMicroservice", "busy");
		}
		let startPing = new Date();
		fetch(apiGateway + "/projectManager/deleteProject?projectName=" + clickedProject, {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': "Bearer " + token
			}
		}).then(response => {	//success callback
			//get statistical data about access data and ping
			saveMicroservice.accessedDate = new Date();
			saveMicroservice.state = "running";
			setIconForMicroservice("saveMicroservice", "running");
			saveMicroservice.ping = saveMicroservice.accessedDate - startPing;
			if (response.status == 202) { //deletion was a success
				markedProject.parentElement.removeChild(markedProject);
			}
			return response.json();
		}).catch(error => {	//fail callback
			if (error == "TypeError: NetworkError when attempting to fetch resource.") {
				saveMicroservice.state = "down";
				setIconForMicroservice("saveMicroservice", "down");
				alert("Save microservice is down, try again later...");
			}
		});
		document.getElementById("projDelWarnStretchBackground").style.display = "none";
		document.getElementById("projDelWarn").style.display = "none";
	}
}

/*object to hold an array of pairs {"file":file, "content":content}. Used to save file content for current session (locally)
for saving over multiple sessions, the user will have to to use save Microservice*/
var projectFilesContents = new Array();

//save one file content for the session
function saveFileForSession(fileId, fileContent) {
	//remove last saved content for this file
	for (let i = 0; i < projectFilesContents.length; i++) {
		if (projectFilesContents[i].fileId == fileId) {
			projectFilesContents.splice(i, 1);
			break;
		}
	}
	//add new content
	projectFilesContents.push({ "fileId": fileId, "fileContent": fileContent});
}

//get file contents by id
function getFileContents(fileId) {
	ret = "";
	for (let i = 0; i < projectFilesContents.length; i++) {
		if (projectFilesContents[i].fileId == fileId) {
			ret = projectFilesContents[i].fileContent;
			break;
		}
	}
	return ret;
}