var AWS = require("aws-sdk"),
	config = require('../config/config.json');

const TEMPLATE_NAME = 'resize.ejs';

AWS.config.loadFromPath('./config.json');
var sqs = new AWS.SQS();

exports.action = function (request, callback) {
	var files = JSON.parse(request.body.files);

	var messageBody = {
		files: files,
		rate: parseInt(request.body.rate)
	};

	var params = {
		MessageBody: JSON.stringify(messageBody),
		QueueUrl: config.queueUrl
	};

	sqs.sendMessage(params, function(err, data) {
		if (err) {
			console.log(err, err.stack);
			callback(null, 'some error occurred');
		} else {
			callback(null, {
				template: TEMPLATE_NAME,
				params: {
					files: files
				}
			});
		}
	});
};