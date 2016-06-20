var async = require('async'),
	AWS = require("./aws"),
	config = require('./../config/config.json'),
	fs = require('fs'),
	lwip = require('lwip'),
	randomstring = require("randomstring");

exports.create = create;


function create(sqsMessage) {
	return function (callback) {
		deleteMessage(sqsMessage, function (err, data) {
			if (err) {
				callback(err);
				return;
			}

			var taskParams = JSON.parse(sqsMessage.Body);

			resize(taskParams.file, taskParams.rate / 100)
				.then(callback, callback);
		});
	};
}

function deleteMessage(message, callback) {
	var params = {
		QueueUrl: config.queueUrl,
		ReceiptHandle: message.ReceiptHandle
	};

	AWS.getSqs().deleteMessage(params, callback);
}

function resize(fileName, rate) {
	return new Promise(function (resolve, reject) {
		var fileData = {
			Bucket: config.bucket,
			Key: fileName
		};

		AWS.getS3().getObject(fileData, function (err, data) {
			if (err) {
				reject(err);
				return;
			}

			var fileType = getFileTypeFromName(fileName);

			lwip.open(data.Body, fileType, function (err, image) {
				image.scale(rate, function (err, image) {
					image.toBuffer(fileType, function (err, buffer) {
						var params = {
							Bucket: config.bucket,
							Key: fileName,
							Body: buffer,
							ACL: 'public-read'
						};

						AWS.getS3().upload(params, function(err, data) {
							if (err) {
								reject(err);
							} else {
								logJobSuccess(fileName, rate)
									.then(resolve);
							}
						});
					});
				});
			});
		});
	});
}

function createSingleResizeJob(fileName, rate) {
	return function (callback) {
		var fileData = {
			Bucket: config.bucket,
			Key: fileName
		};

		AWS.getS3().getObject(fileData, function (err, data) {
			if (err) {
				callback(err);
				return;
			}

			var fileType = getFileTypeFromName(fileName);

			lwip.open(data.Body, fileType, function (err, image) {
				image.scale(rate, function (err, image) {
					image.toBuffer(fileType, function (err, buffer) {
						var params = {
							Bucket: config.bucket,
							Key: fileName,
							Body: buffer,
							ACL: 'public-read'
						};

						AWS.getS3().upload(params, function(err, data) {
							if (err) {
								callback(err);
							} else {
								logJobSuccess(fileName, rate).then(callback);
							}
						});
					});
				});
			});
		});
	}
}

function getFileTypeFromName(filename) {
	var extension = filename.split('.');
	extension = extension[extension.length - 1].toLowerCase();

	if (extension === 'jpg' || extension === 'jpeg') {
		return 'jpg';
	}

	return extension;
}

function logJobSuccess(fileName, rate) {
	return new Promise(function (resolve, reject) {
		var params = {
			Attributes: [{
				Name: 'type',
				Value: 'resize',
				Replace: false
			},{
				Name: 'fileName',
				Value: fileName,
				Replace: false
			},{
				Name: 'rate',
				Value: rate + '',
				Replace: false
			},{
				Name: 'date',
				Value: (new Date()).toISOString(),
				Replace: false
			}],
			DomainName: config.simpleDb.domains.jobs,
			ItemName: randomstring.generate(10)
		};

		AWS.getSimpleDb().putAttributes(params, function (err) {
			if (err) {
				reject(err);
			} else {
				resolve();
			}
		});
	});
}
