const TEMPLATE_NAME = 'uploadSucceeded.ejs';

exports.action = function (request, callback) {
	if (!request.query.bucket || !request.query.key) {
		callback('missing parameters');
		return;
	}

	callback(null, {
		template: TEMPLATE_NAME, params: {
			fileName: request.query.key
		}
	});
};