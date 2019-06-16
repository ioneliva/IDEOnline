//global variables representing each microservice, used for statistics.
//I declared them as objects to make it easier to track and use their properties
var wordColorMicroservice = {
	name: "wordColorMicroservice",
	about: "this microservice handles dynamic word coloring in the editor, according to dictionaries it stores for each language supported",
	state: "down",
	accessLevel: "no login required, you can access all data on this server",
	serverStartDate: null,
	accessedDate: null,
	warmupPing: 0,
	ping: 0,
	whenDown: "you will not be able to use custom text formatting and coloring",
	sendPing: function () {
		let startTime = new Date();
		sendRequest("POST", apiGateway + "/coloring", {
			"word_and_delimiter": "", "position": "",
			"enterPressed": "", "preWord": "", "preWordPos": "", "token": ""
		}, function (response) {
			wordColorMicroservice.warmupPing = new Date() - startTime;
			wordColorMicroservice.state = "running";
			let wordColoringMS = JSON.parse(response);
			wordColorMicroservice.serverStartDate = wordColoringMS.serverStart;
		}, function (err) {
			wordColorMicroservice.state = "down";
		});
	}
};
var undoMicroservice = {
	name: "undoMicroservice",
	about: "this microservice handles a custom undo and redo functionality, that preserves coloring and doesn't break underlying html structure",
	state: "down",
	accessLevel: "no login required, you can access all data on this server",
	serverStartDate: null,
	accessedDate: null,
	warmupPing: 0,
	ping: 0,
	whenDown: "you will not be able to use undo functionality (and obviously no redo either)",
	sendPing: function () {
		let startTime = new Date();
		sendRequest("PUT", apiGateway + "/doUndo", {
			"statusRequest": ""
		}, function (response) {
			undoMicroservice.warmupPing = new Date() - startTime;
			undoMicroservice.state = "running";
			let undoRedoMS = JSON.parse(response);
			undoMicroservice.serverStartDate = undoRedoMS.serverStart;
		}, function (err) {
			undoMicroservice.state = "down";
		});
	}
};
var loginMicroservice = {
	name: "loginMicroservice",
	about: "this microservice handles all login functionality, as well as security token distribution",
	state: "down",
	accessLevel: "you need to login to access this service",
	serverStartDate: null,
	accessedDate: null,
	warmupPing: 0,
	ping: 0,
	whenDown: "you will suffer no repercussions for a while, because your security token will still be active. Once the token expires "
		+ "or you log out, you not be able to log in and will have to use the application in anonymous mode. You will still have access to most "
		+ "of the functionality, but you will not be able to save or load files. If you close or refresh the browser session, your work will be lost."
		+ " You also loose access to a custom avatar picture, but you will get a default stock one",
	sendPing: function () {
		let startTime = new Date();
		fetch(apiGateway + "/auth", {
			method: 'POST',
			body: JSON.stringify({
				"name": "thisIsAStatusRequestFromClient"
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		}).then(response => response.json()
		).then(response => {
			loginMicroservice.warmupPing = new Date() - startTime;
			loginMicroservice.state = "running";
			loginMicroservice.serverStartDate = response.serverStart;
		}).catch(error => {
			if (error == "TypeError: NetworkError when attempting to fetch resource.") {
				loginMicroservice.state = "down";
			}
		});
	}
};
var saveMicroservice = {
	name: "saveMicroservice",
	about: "this microservice handles storage and retrieval of file data",
	state: "down",
	accessLevel: "you need to login to access this service",
	serverStartDate: null,
	accessedDate: null,
	warmupPing: 0,
	ping: 0,
	whenDown: "you will not be able save or load your project",
	sendPing: function () {
		let startTime = new Date();
		fetch(apiGateway + "/statistics/ping", {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json'
			}
		}).then(response => response.json()
		).then(response => {
			saveMicroservice.warmupPing = new Date() - startTime;
			saveMicroservice.state = "running";
			saveMicroservice.serverStartDate = response.serverStart;
		}).catch(error => {
			if (error == "TypeError: NetworkError when attempting to fetch resource.") {
				saveMicroservice.state = "down";
			}
		});
	}
};
var runMicroservice = {
	name: "runMicroservice",
	about: "this microservice handles compiling and running of user code",
	state: "down",
	accessLevel: "you need to login to access this service",
	serverStartDate: null,
	accessedDate: null,
	warmupPing: 0,
	ping: 0,
	whenDown: "you will not be able to run your code",
	sendPing: function () {
		let startTime = new Date();
		fetch(apiGateway + "/statistics/ping", {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json'
			}
		}).then(response => response.json()
		).then(response => {
			runMicroservice.warmupPing = new Date() - startTime;
			runMicroservice.state = "running";
			runMicroservice.serverStartDate = response.serverStart;
		}).catch(error => {
			if (error == "TypeError: NetworkError when attempting to fetch resource.") {
				runMicroservice.state = "down";
			}
		});
	}
};

//warm-up the microservice(auto stores data into RAM and cache, makes further requests a lot faster)
function warmUpMicroservices() {
	wordColorMicroservice.sendPing();
	undoMicroservice.sendPing();
	loginMicroservice.sendPing();
	saveMicroservice.sendPing();
}

//get time elapsed since oldDate param, convert it to seconds/minutes/hours/days if needed
function getElapsedTime(oldDate) {
	let timeNow = new Date(),
		miliseconds = timeNow - new Date(oldDate),
		elapsed;

	if (miliseconds > 5000) { //get seconds
		let seconds = Math.floor(miliseconds / 1000);
		miliseconds = miliseconds % 1000;
		elapsed = seconds + " s, ";
		if (seconds > 60) {	//get hours
			let minutes = Math.floor(seconds / 60);
			seconds = seconds % 60;
			elapsed = minutes + " m, " + seconds + " s, ";
			if (minutes > 60) {
				let hours = Math.floor(minutes / 60);
				minutes = minutes % 60;
				elapsed = hours + " h, " + minutes + " m, " + seconds + " s, ";
			}
		}
	}
	return elapsed;
}