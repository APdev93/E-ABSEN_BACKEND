global.PORT = 8081;
global.batas_masuk = "07:15";
global.rate_limit = {
	windowMs: 60 * 1000,
	max: 100,
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
