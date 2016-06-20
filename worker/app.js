var async = require('async'),
	AWS = require('./service/aws'),
	config = require('./config/config.json'),
	fs = require('fs'),
	initializer = require('./service/initializer'),
	lwip = require('lwip'),
	Promise = require('promise'),
	randomstring = require("randomstring"),
	ResizeJob = require('./service/resizeJob');

AWS.loadCredentials().then(function () {
	initializer.init();

	async.forever(main);
});


function main(next) {
	waitForMessages()
		.then(executeMessages, handleError)
		.then(next, function (err) {
			handleError(err).then(next);
		});
}

function waitForMessages() {
	return new Promise(function (resolve, reject) {
		var params = {
			QueueUrl: config.queueUrl,
			MaxNumberOfMessages: 1,
			VisibilityTimeout: 30,
			WaitTimeSeconds: 20
		};

		AWS.getSqs().receiveMessage(params, function (err, data) {
			if (err) {
				reject(err);
			} else {
				var messages = data.Messages || [];
				resolve(messages);
			}
		});
	});
}

function executeMessages(messages) {
	var tasks = messages.map(function (msg) {
		return ResizeJob.create(msg);
	});

	return new Promise(function (resolve) {
		async.series(tasks, function (error) {
			if (error) {
				logError(error).then(resolve);
			} else {
				resolve();
			}
		});
	});
}

function handleError(error) {
	logError(error);
}

function logError(error) {
	console.log(error);
	return logErrorToSimpleDb(error);
}

function logErrorToSimpleDb(error) {
	return new Promise(function (resolve, reject) {
		var params = {
			Attributes: [{
				Name: 'error',
				Value: error,
				Replace: false
			},{
				Name: 'date',
				Value: (new Date()).toISOString(),
				Replace: false
			}],
			DomainName: config.simpleDb.domains.logs,
			ItemName: randomstring.generate(10)
		};

		AWS.getSimpleDb().putAttributes(params, resolve);
	});
}








