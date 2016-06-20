var AWS = require('./aws'),
	config = require('../config/config.json');

exports.init = function () {
	for (var i in config.simpleDb.domains) {
		createDomain(config.simpleDb.domains[i]);
	}
};

function createDomain(domainName) {
	var params = {
		DomainName: domainName
	};

	AWS.getSimpleDb().createDomain(params, function(err, data) {
		if (err) {
			console.log('Could not create domain <' + domainName + '>: ' + err);
		}
	});
}