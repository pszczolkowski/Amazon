var AWS = require("aws-sdk"),
	config = require('../config/config.json'),
	Promise = require('promise');

const TEMPLATE_NAME = 'resize.ejs';

AWS.config.loadFromPath('./config.json');
var sqs = new AWS.SQS();

exports.action = function (request, callback) {
	var files = JSON.parse(request.body.files);

	sendFileResizeRequests({
		files: files,
		rate: parseInt(request.body.rate)
	}).then(function () {
		callback(null, {
			template: TEMPLATE_NAME,
			params: {
				files: files
			}
		});
	}, function (err) {
		console.log(err, err.stack);
		callback(null, 'some error occurred');
	});
};

function sendFileResizeRequests(params) {
	var promises = [];

	for (var i = 0; i < params.files.length; i += 10) {
		promises.push(sendMessageBatch({
			files: params.files.slice(i, Math.min(i + 10, params.files.length)),
			rate: params.rate
		}));
	}

	return Promise.all(promises);
}

function sendMessageBatch(params) {
	var entries = [];

	for (var i = 0; i < params.files.length; i++) {
		entries.push({
			Id: i + '',
			MessageBody: JSON.stringify({ file: params.files[i], rate: params.rate })
		});
	}

	return new Promise(function (resolve, reject) {
		sqs.sendMessageBatch({
			Entries: entries,
			QueueUrl: config.queueUrl
		}, function(err, data) {
			if (err) {
				reject(err);
			} else {
				resolve();
			}
		});
	});
}