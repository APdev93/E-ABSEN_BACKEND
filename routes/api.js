const root = process.cwd();
require(`${root}/config`);
const express = require("express");
const jwt = require("jsonwebtoken");

const { db } = require("../src/database");
const response = require("../utils/response");
const { generateStudentCode } = require("../utils/string");

const api = express.Router();

function verifyAuthToken(req, res, next) {
	const authHeader = req.headers["authorization"];
	const token = authHeader && authHeader.split(" ")[1];

	if (!token) {
		return response("Unauthorized: Tidak ada token yang diberikan", null, 403, res);
	}

	jwt.verify(token, global.SECRET_KEY, (err) => {
		if (err) {
			return response("Forbidden: Token salah", null, 403, res);
		}
		next();
	});
}

api.get("/siswa", verifyAuthToken, (req, res) => {
	const sql = "SELECT * FROM students";
	db.query(sql, (err, data) => {
		if (err) {
			console.error("[ API ] : ERROR => ", err);
			return response("Internal Server Error!", null, 500, res);
		} else {
			response("Berhasil mendapatkan semua data siswa!", data, 200, res);
		}
	});
});

api.post("/siswa/add", verifyAuthToken, (req, res) => {
	const { nisn, full_name, class_name, parent_number } = req.body;
	const query = `INSERT INTO students (student_id, nisn, full_name, class, parent_number, created_at) VALUES (?, ?, ?, ?, ?, current_timestamp())`;
	let idSiswa = generateStudentCode();
	db.query(query, [idSiswa, nisn, full_name, class_name, parent_number], (error, data) => {
		if (error) {
			console.error("[ API ] : ERROR => ", error);
			return response("Internal Server Error!", null, 500, res);
		} else {
			response("Berhasil menambah siswa", { id: data.insertId }, 201, res);
		}
	});
});

api.post("/siswa/update", verifyAuthToken, (req, res) => {
	const { sid, nisn, full_name, class_name, parent_number } = req.body;
	const query = `UPDATE students SET nisn = ?, full_name = ?, class = ?, parent_number = ? WHERE id = ?`;

	db.query(query, [nisn, full_name, class_name, parent_number, sid], (error, data) => {
		if (error) {
			console.error("[ API ] : ERROR => ", error);
			return response("Internal Server Error!", null, 500, res);
		} else if (data.affectedRows === 0) {
			return response("Siswa tidak ditemukan!", null, 404, res);
		} else {
			response("Berhasil mengedit siswa", { edited_id: sid }, 200, res);
		}
	});
});

api.post("/siswa/delete", verifyAuthToken, (req, res) => {
	const { sid } = req.body;
	const query = `DELETE FROM students WHERE id = ?`;

	db.query(query, [sid], (error, data) => {
		if (error) {
			console.error("[ API ] : ERROR => ", error);
			return response("Internal Server Error!", null, 500, res);
		} else {
			response("Berhasil menghapus siswa!", { deleted_student: { sid } }, 200, res);
		}
	});
});

module.exports = api;
