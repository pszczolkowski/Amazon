var awsConfig = require('../config.json'),
	config = require('../config/config.json'),
	Policy = require("../service/s3post").Policy,
	S3Form = require("../service/s3post").S3Form;

const TEMPLATE_NAME = 'upload.ejs';

var fields = prepareFormFields();

exports.action = function (request, callback) {
	callback(null, {
		template: TEMPLATE_NAME, params: {
			fields: fields,
			bucket: config.bucket
		}
	});
};


function prepareFormFields() {
	var policyData = {
		expiration: {day: 1},
		conditions: [
			['starts-with', '$key', ''],
			{bucket: config.bucket},
			{acl: 'private'},
			{success_action_redirect: 'http://localhost:8080/uploadSucceeded'},
			['content-length-range', 0, 1048576]
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