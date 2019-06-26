document.getElementById("run").addEventListener("mousedown", openRunDiagWindow);
document.getElementById("toolbar_RunBtn").addEventListener("mousedown", openRunDiagWindow);
document.getElementById("runResultsRequestDownloadBtn").addEventListener("mousedown", showPickOSWindow);
document.getElementById("selectOSCancelBtn").addEventListener("mousedown", hidePickOSWindow);
document.getElementById("selectOSConfirmBtn").addEventListener("mousedown", getExecutableFile);
document.getElementById("runResultsRunBtn").addEventListener("mousedown", runProject);
document.getElementById("runResultsCloseBtn").addEventListener("mousedown", closeRunWindow);

//disable running certain type of projects on server (the user would get a compilation error if he did, but there's no point)
function checkForProblemProjectTypes() {
	let runResultsWindow = document.getElementById("runResultsContent");
	let instruction = "Interactive Console, ASP and MVC projects cannot be run on server side."
		+ " Please opt to download the executable and run the project on your local machine!";

	if (!getProjectTemplate() || getProjectTemplate() == "web") {
		document.getElementById("runResultsRunBtn").classList.add("disabledBtn");
		document.getElementById("run").classList.add("disabledBtn");
		runResultsWindow.innerText = instruction;
		runResultsWindow.style.color = "blue";
		runResultsWindow.style.fontWeight = "bold";
		runResultsWindow.style.textAlign = "center";
	} else {
		document.getElementById("runResultsRunBtn").classList.remove("disabledBtn");
		document.getElementById("run").classList.remove("disabledBtn");
		runResultsWindow.innerText = "";
		runResultsWindow.style.color = "initial";
		runResultsWindow.style.fontWeight = "initial";
		runResultsWindow.style.textAlign = "initial";
	}
}

//click on run buttons in the toolbar and the Solution Editor Context Menu
function openRunDiagWindow() {
	let runResultsWindow = document.getElementById("runResultsContent");

	checkForProblemProjectTypes();
	//show run results window
	runResultsWindow.innerText = "Waiting for input...";
	document.getElementById("runResults").style.display = "block";
}

//run project, get compile and run results
function runProject() {
	let runResultsWindow = document.getElementById("runResultsContent");

	//show run results window
	runResultsWindow.innerText = "please wait...compiling...";
	document.getElementById("runResults").style.display = "block";
	//block user from making another request for compile while the microservice is still processing this old one
	document.getElementById("toolbar_RunBtn").classList.add("disabledBtn");
	document.getElementById("run").classList.add("disabledBtn");

	if (runMicroservice.state == "running") {
		runMicroservice.state = "busy";
		setIconForMicroservice("runMicroservice", "busy");
	}
	let startPing = new Date();
	//swap the next commented line in to see Roslyn compiler work instead of the CLI
	//fetch(apiGateway + "/run/Roslyn", {
	fetch(apiGateway + "/run", {
		method: 'POST',
		body: JSON.stringify(fileTreeToObject(true)),	//this function is defined in saveLoad.js
		headers: {
			'Content-Type': 'application/json'
		}
	}).then(response => {	//success callback
		//get statistical data about access data and ping
		runMicroservice.accessedDate = new Date();
		runMicroservice.state = "running";
		setIconForMicroservice("runMicroservice", "running");
		runMicroservice.ping = runMicroservice.accessedDate - startPing;
		//enable elements that allow the user to make another run request
		document.getElementById("toolbar_RunBtn").classList.remove("disabledBtn");
		document.getElementById("run").classList.remove("disabledBtn");
		return response.json();
	}).then(response => {
		runResultsWindow.innerText = response.successResult;
		runResultsWindow.innerText += response.errResult;
	}).catch(error => {	//fail callback
		if (error == "TypeError: NetworkError when attempting to fetch resource.") {
			runMicroservice.state = "down";
			setIconForMicroservice("runMicroservice", "down");
			runResultsWindow.innerText = "Compile/Run Microservice is down...\nTry again later";
			document.getElementById("toolbar_RunBtn").classList.remove("disabledBtn");
			document.getElementById("run").classList.remove("disabledBtn");
		}
	});
}

//show OS pick window (this is used to select the runtime environment for the executable downloaded)
function showPickOSWindow() {
	document.getElementById("selectEnvDetails").style.display = "block";
}
//hide OS pick window
function hidePickOSWindow() {
	document.getElementById("selectEnvDetails").style.display = "none";
}
//get user selected OS option
function pickedOSOption() {
	return document.getElementsByClassName("selectSystem")[0].value;
}

//request download of project executable
function getExecutableFile() {
	let runResultsWindow = document.getElementById("runResultsContent");

	hidePickOSWindow();

	runResultsWindow.innerText = "This may take a few minutes, please be patient";
	//block user from making another request for compile while the microservice is still processing this old one
	document.getElementById("toolbar_RunBtn").classList.add("disabledBtn");
	document.getElementById("run").classList.add("disabledBtn");

	if (runMicroservice.state == "running") {
		runMicroservice.state = "busy";
		setIconForMicroservice("runMicroservice", "busy");
	}
	let startPing = new Date();
	fetch(apiGateway + "/getExecutable", {
		method: 'POST',
		body: JSON.stringify({ "env": pickedOSOption(), "Filetree": fileTreeToObject(true) }),	//fileTreeToObject is defined in saveLoad.js
		headers: {
			'Content-Type': 'application/json'
		}
	}).then(response => {	//success callback
		//get statistical data about access data and ping
		runMicroservice.accessedDate = new Date();
		runMicroservice.state = "running";
		setIconForMicroservice("runMicroservice", "running");
		runMicroservice.ping = runMicroservice.accessedDate - startPing;
		runResultsWindow.innerText = "Zip archive received, check your downloads folder in the browser";
		//enable elements that allow the user to make another run request
		document.getElementById("toolbar_RunBtn").classList.remove("disabledBtn");
		document.getElementById("run").classList.remove("disabledBtn");
		return response.blob();
	}).then(zipFile => {
		let blob = zipFile;
		let link = document.createElement('a');
		link.href = window.URL.createObjectURL(blob);
		link.download = 'download';
		document.body.appendChild(link)
		link.click();
	}).catch(error => {	//fail callback
		if (error == "TypeError: NetworkError when attempting to fetch resource.") {
			runMicroservice.state = "down";
			setIconForMicroservice("runMicroservice", "down");
			alert("Compile / Run Microservice is down...\nTry again later");
			document.getElementById("toolbar_RunBtn").classList.remove("disabledBtn");
			document.getElementById("run").classList.remove("disabledBtn");
		}
	});
}

//close run information box
function closeRunWindow() {
	document.getElementById("runResults").style.display = "none";
}