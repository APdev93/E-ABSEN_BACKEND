const generateStudentCode = () => {
	const characters = "ABCDEFGHIJKLMOPQRSTUVWXYZ0123456789";
	let result = "S";
	for (let i = 0; i < 5; i++) {
		result += characters.charAt(Math.floor(Math.random() * characters.length));
	}
	return result;
};

module.exports = {
    generateStudentCode
}