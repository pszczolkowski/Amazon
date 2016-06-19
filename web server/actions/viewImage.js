const TEMPLATE_NAME = 'image.ejs';

exports.action = function (request, callback) {
	callback(null, {
		template: TEMPLATE_NAME, params: {
			imageUrl: request.query.src
		}
	});
};
