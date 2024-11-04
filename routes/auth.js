const root = process.cwd();
require(`${root}/config`);
const express = require("express");
const jwt = require("jsonwebtoken");

const { db } = require("../src/database");
const response = require("../utils/response");

const auth = express.Router();

auth.post("/login", (req, res) => {
	const { username, password } = req.body;
	const sql = "SELECT * FROM teachers WHERE username = ?";

	db.query(sql, [username], (err, results) => {
		if (err) {
			console.error("[ AUTH] : ERROR => ", err);
			return response("Internal server error!", null, 500, res);
		}
		if (results.length === 0) {
			return response("Username atau password salah!", null, 401, res);
		}
		const teacher = results[0];

		if (teacher.password === password) {
			const token = jwt.sign({ id: teacher.id }, global.SECRET_KEY, {
				expiresIn: 86400,
			});
			console.log(`[ TEACHER (${teacher.full_name})] : LOGIN`);

			let data = {
				id: teacher.id,
				username: teacher.username,
				full_name: teacher.full_name,
				token,
			};
			response("Berhasil login!", data, 200, res);
		} else {
			return response("Password salah!", null, 404, res);
		}
	});
});

/*
auth.post("/login", async (req, res, next) => {
	let { username, password } = req.body;

	const query = "SELECT * FROM guru WHERE username = ?";
	db.query(query, [username], (err, data) => {
		if (!err) {
			if (data.length > 0) {
				if (data[0].password === password) {
					console.log(data);
					res.json(data);
				} else {
					res.status(200).send("Password incorrect");
				}
			} else {
				res.status(200).send("User not found");
			}
		} else {
			console.error("Database Error:", err);
			res.status(500).send("Internal Server Error");
		}
	});
});
*/
module.exports = auth;
