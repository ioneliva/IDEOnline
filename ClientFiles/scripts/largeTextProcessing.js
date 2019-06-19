//test
colorLargeText("this is a not so large text", "c#");
//send large text to Repair Microservice for processing
function colorLargeText(rawText, language) {
	let coloredText = "";

	if (wordRepairMicroservice.state == "running") {
		wordRepairMicroservice.state = "busy";
		setIconForMicroservice("wordRepairMicroservice", "busy");
	}
	let startPing = new Date();
	fetch("http://localhost:5100" + "/largeText/colorText", {
		method: 'POST',
		body: JSON.stringify({
			"text": rawText,
			"language": language,
		}),
		headers: {
			'Content-Type': 'application/json'
		}
	}).then(response => {	//success callback
		//get statistical data about access data and ping
		wordRepairMicroservice.accessedDate = new Date();
		wordRepairMicroservice.state = "running";
		setIconForMicroservice("wordRepairMicroservice", "running");
		wordRepairMicroservice.ping = wordRepairMicroservice.accessedDate - startPing;
		//convert Json string representation into Json Array
		return response.json();
	}).then(response => {	//handle response payload
		coloredText = response.parsedText;
		console.log(coloredText);
	}).catch(error => {	//fail callback
		if (error == "TypeError: NetworkError when attempting to fetch resource.") {
			wordRepairMicroservice.state = "down";
			setIconForMicroservice("wordRepairMicroservice", "down");
		}
	});
}