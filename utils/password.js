const enc = require("bcryptjs");

const hashPassword = password => {
	const salt = enc.genSaltSync(10);
	const hash = enc.hashSync(password, salt);
	return hash;
};

const verifyPassword = (password, hash) => {
	const verify = enc.compareSync(password, hash);
	return verify;
};

module.exports = {
	hashPassword,
	verifyPassword,
};
