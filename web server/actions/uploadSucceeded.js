var AWS = require("aws-sdk"),
	config = require('../config/config.json'),
	Promise = require('promise'),
	randomstring = require('randomstring');

const TEMPLATE_NAME = 'uploadSucceeded.ejs';

AWS.config.loadFromPath('./config.json');
var s3 = new AWS.S3();
var simpledb = new AWS.SimpleDB();

exports.action = function (request, callback) {
	if (!request.query.bucket || !request.query.key) {
		callback(null, 'missing parameters');
		return;
	}

	var fileParams = {
		bucket:  request.query.bucket,
		key:  request.query.key
	};

	checkIfFileExists(fileParams)
		.then(function (fileExists) {
			if (!fileExists) {
				callback(null, 'some error occurred');
			} else {
				logFileUpload(fileParams.key)
					.then(function () {
						callback(null, {
							template: TEMPLATE_NAME, params: {
								fileName: fileParams.key
							}
						});
					}, function (error) {
						console.log(error);
						callback(null, 'some error occurred');
					});
			}
		}, function (error) {
			console.log(error);
			callback(null, 'some error occurred');
		});
};


function checkIfFileExists(fileParams) {
	return new Promise(function (resolve, reject) {
		var params = {
			Bucket: fileParams.bucket,
			Key: fileParams.key
		};

		s3.getObject(params, function(err) {
			if (err) {
				if (err.code === 'NoSuchKey') {
					resolve(false);
				} else {
					reject(err);
				}
			} else {
				resolve(true);
			}
		});
	});
}

function logFileUpload(fileName) {
	return new Promise(function (resolve, reject) {
		var params = {
			Attributes: [{
				Name: 'fileName',
				Value: fileName,
				Replace: false
			}, {
				Name: 'date',
				Value: (new Date()).toISOString(),
				Replace: false
			}],
			DomainName: config.simpleDb.domains.upload,
			ItemName: randomstring.generate(10)
		};

		simpledb.putAttributes(params, function(err, data) {
			if (err) {
				reject(err);
			} else {
				resolve();
			}
		});
	});
}