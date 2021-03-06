var actionsCofig = require('./config/actions.json'),
	config = require('./config/config.json'),
	initializer = require('./service/initializer');

const ACTIONS_FOLDER = "./actions/";

initializer.init();

actionsCofig.forEach(function(item){
	if(item.action && item.path){
		if(!item.action.template){
			item.action = require(ACTIONS_FOLDER + item.action).action;
		}
	}else {
		console.log("Invalid configuration: " + JSON.stringify(item));
	}
});


var service = require("webs-weeia").http(actionsCofig);
service(config.port);







