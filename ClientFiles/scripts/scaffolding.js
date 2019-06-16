//test
getScaffold("console");

function getScaffold(scaffoldName) {
	console.log("requesting scaffold " + scaffoldName);

	if (scaffoldingMicroservice.state == "running") {
		scaffoldingMicroservice.state = "busy";
		//setIconForMicroservice("scaffoldingMicroservice", "busy");	//not yet implemented
	}
	let startPing = new Date();
	console.log("we are here");
	fetch("http://localhost:5100" + "/scaffolds?scaffoldName=" + scaffoldName, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json'
		}
	}).then(response => {	//success callback
		//get statistical data about access data and ping
		scaffoldingMicroservice.accessedDate = new Date();
		scaffoldingMicroservice.state = "running";
		//setIconForMicroservice("saveMicroservice", "running");		//not yet implemented
		scaffoldingMicroservice.ping = scaffoldingMicroservice.accessedDate - startPing;
		//convert Json string representation into Json Array
		return response.json();
	}).then(response => {	//handle response payload

	}).catch(error => {	//fail callback
		if (error == "TypeError: NetworkError when attempting to fetch resource.") {
			scaffoldingMicroservice.state = "down";
			//setIconForMicroservice("saveMicroservice", "down");		//not yet implemented
			alert("Scaffolding microservice is down, try again later...");
		}
	});
}