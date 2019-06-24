//get files needed for template project type
function requestScaffoldFromMicroservice(scaffoldName, projectName) {
	if (scaffoldingMicroservice.state == "running") {
		scaffoldingMicroservice.state = "busy";
		setIconForMicroservice("scaffoldingMicroservice", "busy");
	}
	let startPing = new Date();
	fetch(apiGateway + "/scaffolds?scaffoldName=" + scaffoldName + "&projectName=" + projectName, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json'
		}
	}).then(response => {	//success callback
		//get statistical data about access data and ping
		scaffoldingMicroservice.accessedDate = new Date();
		scaffoldingMicroservice.state = "running";
		setIconForMicroservice("scaffoldingMicroservice", "running");
		scaffoldingMicroservice.ping = scaffoldingMicroservice.accessedDate - startPing;
		//convert Json string representation into Json Array
		return response.json();
	}).then(response => {
		//create a solution explorer structure from response
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
				//save the content for files
				if (loadMS.Content != "") {
					//color incomming content and save it to file
					colorLargeTextToFile(projectLang, loadMS.Name, loadMS.Content);
				}
			}
		}
		prepareEditorUI();
	}).catch(error => {	//fail callback
		if (error == "TypeError: NetworkError when attempting to fetch resource." ||
			error == "SyntaxError: JSON.parse: unexpected end of data at line 1 column 1 of the JSON data") {
			scaffoldingMicroservice.state = "down";
			setIconForMicroservice("scaffoldingMicroservice", "down");
			alert("Scaffolding microservice is down, try an empty project instead?");
		}
	});
}

//prepare interface after new project was created
function prepareEditorUI() {
	//make solution editor available
	document.getElementById("solExplorerUL").style.display = "block";
	//hide 'new project' and 'welcome' window so the user can progress
	document.getElementsByClassName("newProject")[0].style.display = "none";
	document.getElementsByClassName("welcome")[0].style.display = "none";
}

//create empty project
function createEmptyProject(projectName, optionalFile) {
	//set root on Solution Explorer window
	let root = document.getElementsByClassName("project")[0];
	root.lastChild.nodeValue = projectName;
	root.id = projectName;
	if (optionalFile != "" && optionalFile != null) { //note: if(userInputOptional) is sufficient on my machine, but just to be sure...
		let fileStructure = createFileStructure(optionalFile, root.id);
		attachFileToParent(fileStructure, root);
		openInTab(fileStructure.lastChild);
	}
	prepareEditorUI();
}

//create project from template
function createTemplateProject(scaffold, projectName) {
	requestScaffoldFromMicroservice(scaffold, projectName);
	//prepareEditorUI();
}