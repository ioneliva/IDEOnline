document.getElementById("toolbar_SaveBtn").addEventListener("click", save);

//save solution tree contents into a json object
function fileTreeToJson() {
	let solutionExplorer = document.getElementById("solutionWindow"),
		root = solutionExplorer.querySelector(".project"),
		dirs = solutionExplorer.querySelectorAll(".directory"),
		files = solutionExplorer.querySelectorAll(".file"),
		fileTree = new Array(),
		fileTreeMember;

	fileTree.push({
		"name": root.id,
		"type": getProjectType(),
		"parent": "",
		"content": ""
	});
	for (let i = 0; i < dirs.length; i++) {
		fileTreeMember = {
			"name": dirs[i].id,
			"type": getProjectType(),
			"parent": dirs[i].parentElement.parentElement.previousElementSibling.id,
			"content": ""
		};
		fileTree.push(fileTreeMember);
	}
	for (let i = 0; i < files.length; i++) {
		let fileContent = "";

		if (getEditorForFile(files[i].id) != null) {
			fileContent = getEditorForFile(files[i].id).innerHTML;
		}

		fileTreeMember = {
			"name": files[i].id,
			"type": getProjectType(),
			"parent": files[i].parentElement.parentElement.previousElementSibling.id,
			"content": fileContent
		};
		fileTree.push(fileTreeMember);
	}

	return fileTree;
}

//send file structure and contents to server for storage 
function save() {
	let token = localStorage.getItem("JWT") || sessionStorage.getItem("JWT")

	if (saveMicroservice.state == "running") {
		saveMicroservice.state = "busy";
		setIconForMicroservice("saveMicroservice", "busy");
	}
	let startPing = new Date();
	fetch(apiGateway + "/save", {
		method: 'PUT',
		body: JSON.stringify(fileTreeToJson()),
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
		return response.json();
	}).catch(error => {	//fail callback
		if (error == "TypeError: NetworkError when attempting to fetch resource.") {
			saveMicroservice.state = "down";
			setIconForMicroservice("saveMicroservice", "down");
			alert("Save microservice is down, try again later...");
		}
	});
}