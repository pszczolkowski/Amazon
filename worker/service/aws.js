var AWS = require('aws-sdk'),
	Promise = require('promise');

var s3, sqs, simpledb;

AWS.loadCredentials = function () {
	return new Promise(function (resolve) {
		var EC2MCred = new AWS.EC2MetadataCredentials();
		EC2MCred.refresh(function (err) {
			if (err) {
				AWS.config.loadFromPath('./config.json');
			}

			s3 = new AWS.S3();
			sqs = new AWS.SQS();
			simpledb = new AWS.SimpleDB();

			resolve();
		});
	});
};

AWS.getS3 = function () {
	return s3;
};

AWS.getSqs = function () {
	return sqs;
};

AWS.getSimpleDb = function () {
	return simpledb;
};

module.exports = AWS;