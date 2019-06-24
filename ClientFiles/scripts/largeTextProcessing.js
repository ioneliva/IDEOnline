//send large text to Repair Microservice for processing, save results to file
function colorLargeTextToFile(language, destinationFileId, rawText) {

	if (wordRepairMicroservice.state == "running") {
		wordRepairMicroservice.state = "busy";
		setIconForMicroservice("wordRepairMicroservice", "busy");
	}
	let startPing = new Date();
	fetch(apiGateway + "/largeText/colorText", {
		method: 'POST',
		body: JSON.stringify({
			"text": rawText,
			"language": language,
		}),
		headers: {
			'Content-Type': 'application/json'
		}
	}).then(response => {	//success callback
		//get statistical data
		wordRepairMicroservice.accessedDate = new Date();
		wordRepairMicroservice.state = "running";
		setIconForMicroservice("wordRepairMicroservice", "running");
		wordRepairMicroservice.ping = wordRepairMicroservice.accessedDate - startPing;
		//convert Json string representation into Json Array
		return response.json();
	}).then(response => {//save colored text to file
		saveFileForSession(destinationFileId, response.parsedText);
	}).catch(error => {	//coloring failed, save the raw text
		saveFileForSession(destinationFileId, rawText, rawText); //3rd parameter saves uncolored text
		if (error == "TypeError: NetworkError when attempting to fetch resource.") {
			wordRepairMicroservice.state = "down";
			setIconForMicroservice("wordRepairMicroservice", "down");
		}
	});
}

//send large text to Repair Microservice and get the results as a promise
async function getColoredTextFor(language, rawText) {

	let promise = await fetch(apiGateway + "/largeText/colorText", {
							method: 'POST',
							body: JSON.stringify({
								"text": rawText,
								"language": language,
							}),
							headers: {
								'Content-Type': 'application/json'
							}
						});

	return await promise;
}