require("./config");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const auth = require("./routes/auth");
const api = require("./routes/api");
const absen = require("./routes/absen");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
const rateLimit = require("express-rate-limit");
const limiter = rateLimit({
	windowMs: global.rate_limit.windowMs,
	max: global.rate_limit.max,
	message: global.rate_limit.message,
	standardHeaders: global.rate_limit.standardHeaders,
	legacyHeaders: global.rate_limit.legacyHeaders
});

app.use("/", limiter);
let allow = {
	origin: "https://e-absen-frontend.vercel.app",
	methods: ["GET", "POST"]
};
app.use(cors());

app.use("/auth", auth);
app.use("/absen", absen);
app.use("/api", api);

app.get("/", (req, res) => {
	res.status(200);
});

app.get("*", (req, res) => {
	res.status(404);
});

app.listen(global.PORT, () => {
	console.log("[ SERVER ] : SERVER RUNNING AT ", global.PORT);
});
