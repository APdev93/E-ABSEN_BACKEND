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
let allow = {
    origin: "http://192.168.20.199:3000",
		methods: ["GET","POST"],
}
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
