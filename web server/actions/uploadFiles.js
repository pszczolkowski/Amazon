var awsConfig = require('../config.json'),
	config = require('../config/config.json'),
	Policy = require("../service/s3post").Policy,
	S3Form = require("../service/s3post").S3Form;

const TEMPLATE_NAME = 'upload.ejs';

exports.action = function (request, callback) {
	var fields = prepareFormFields(request);

	callback(null, {
		template: TEMPLATE_NAME, params: {
			fields: fields,
			bucket: config.bucket
		}
	});
};


function prepareFormFields(request) {
	var policyData = {
		expiration: {day: 1},
		conditions: [
			['starts-with', '$key', ''],
			{bucket: config.bucket},
			{acl: 'public-read'},
			{success_action_redirect: 'http://' + request.headers.host + '/uploadSucceeded'},
			['content-length-range', 0, config.maxFileSize],
			{'x-amz-meta-uploader-ip': request.ip}
		]
	};

	//2. prepare policy
	var policy = new Policy(policyData);

	//3. generate form fields for S3 POST
	var s3Form = new S3Form(policy);

	var fields = s3Form.generateS3FormFields();
	s3Form.addS3CredientalsFields(fields, awsConfig);

	return fields;
}