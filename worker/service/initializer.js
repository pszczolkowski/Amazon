var AWS = require('aws-sdk'),
	config = require('../config/config.json');

AWS.config.loadFromPath('./config.json');
var simpledb = new AWS.SimpleDB();

exports.init = function () {
	for (var i in config.simpleDb.domains) {
		createDomain(config.simpleDb.domains[i]);
	}
};

function createDomain(domainName) {
	var params = {
		DomainName: domainName
	};

	simpledb.createDomain(params, function(err, data) {
		if (err) {
			console.log('Could not create domain <' + domainName + '>: ' + err);
		}
	});
}