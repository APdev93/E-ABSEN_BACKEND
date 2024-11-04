const response = (message, data, status_code, res) => {
	return res.status(200).json({
		status_code,
		message,
		data,
	});
};

module.exports = response;
