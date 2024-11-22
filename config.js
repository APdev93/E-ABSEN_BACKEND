global.PORT = 8081;
global.rate_limit = {
	windowMs: 60 * 1000,
	max: 30,
	message: "Too Many Requests! :(",
	standardHeaders: true,
	legacyHeaders: false
};
global.DB = {
	host: "0.0.0.0",
	user: "root",
	password: "root",
	database: "absen"
};
global.SECRET_KEY = "YWJzZW5fc2lzd2FfbWFud3Rla29fbWFudGFw";
