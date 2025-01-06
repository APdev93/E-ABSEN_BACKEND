const response = require("./response.js");

const error = (from, res, err) => {
	console.error(`[ ${from} ] : ERROR => `, err);
	return response("Internal Server Error!", null, 500, res);
};

handler = {
	error
};

module.exports = handler;
