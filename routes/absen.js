const root = process.cwd();
require(`${root}/config`);
const express = require("express");

const { db } = require("../src/database");
const moment = require("moment-timezone");

const absen = express.Router();

const createDailyTable = () => {
	const today = moment().tz("Asia/Makassar").format("YYYY_MM_DD");
	const tableName = `absensi_${today}`;

	const createTableSQL = `
        CREATE TABLE IF NOT EXISTS ${tableName} (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nisn VARCHAR(30),
            nama VARCHAR(50),
            kelas VARCHAR(5),
            waktu_absen DATETIME,
            waktu_pulang DATETIME,
            status_pulang VARCHAR(20),
            status VARCHAR(20)
        );
    `;

	db.query(createTableSQL, err => {
		if (err) throw err;
		console.log(`Table created: ${tableName}`);
	});
};

createDailyTable();

absen.post("/masuk", (req, res, next) => {
	const { nisn, nama, kelas, waktu_absen } = req.body;
	const today = moment().tz("Asia/Makassar").format("YYYY_MM_DD");
	const tableName = `absensi_${today}`;

	// Tentukan batas waktu masuk dengan jam 07:15 di zona waktu Asia/Makassar
	let batas_masuk = moment.tz("07:15", "HH:mm", "Asia/Makassar");

	// Konversi waktu_absen yang diterima dari frontend ke objek Moment Asia/Makassar
	const waktu_absen_date = moment.tz(waktu_absen, "Asia/Makassar");

	// Set tanggal batas_masuk sesuai dengan tanggal waktu_absen
	batas_masuk.set({
		year: waktu_absen_date.year(),
		month: waktu_absen_date.month(),
		date: waktu_absen_date.date(),
	});

	console.log("waktu masuk:", waktu_absen_date);
	console.log("batas masuk:", batas_masuk);

	let status;
	if (waktu_absen_date.isSameOrBefore(batas_masuk)) {
		status = "Tepat Waktu";
	} else {
		const terlambat_menit = waktu_absen_date.diff(batas_masuk, "minutes");
		status = `Lambat (${terlambat_menit} menit)`;
	}

	const sql = `INSERT INTO ${tableName} (nisn, nama, kelas, waktu_absen, status) VALUES (?, ?, ?, ?, ?)`;
	db.query(sql, [nisn, nama, kelas, waktu_absen, status], (err, result) => {
		if (err) {
			return res.status(500).json({ error: err.message });
		}
		res.status(200).json({ message: "Absensi pagi tercatat", status });
	});
});



// Endpoint untuk mencatat absensi pulang
absen.post("/pulang", (req, res, next) => {
	const { nisn, waktu_pulang } = req.body;
	const today = moment().tz("Asia/Makassar").format("YYYY_MM_DD");
	const tableName = `absensi_${today}`;

	// Periksa apakah siswa sudah melakukan absensi pagi
	const sqlCheck = `SELECT * FROM ${tableName} WHERE nisn = ? ORDER BY waktu_absen DESC LIMIT 1`;
	db.query(sqlCheck, [nisn], (err, result) => {
		if (err) return res.status(500).json({ error: err.message });
		if (result.length === 0)
			return res.status(404).json({ message: "Siswa belum absen pagi" });

		const hasCheckedOut = !!result[0].waktu_pulang; // Periksa apakah sudah absen pulang
		const statusPulang = hasCheckedOut ? "Hadir" : "Bolos";

		// Jika belum absen pulang, catat waktu pulang dan ubah status menjadi "Hadir"
		if (!hasCheckedOut) {
			const sqlUpdate = `UPDATE ${tableName} SET waktu_pulang = ?, status_pulang = ? WHERE id = ?`;
			db.query(
				sqlUpdate,
				[waktu_pulang, "Hadir", result[0].id],
				(err, updateResult) => {
					if (err) return res.status(500).json({ error: err.message });
					res.status(200).json({ message: "Absensi pulang tercatat", status: "Hadir" });
				}
			);
		} else {
			// Jika sudah ada absensi pulang
			res.status(200).json({ message: "Sudah tercatat absen pulang", status: "Hadir" });
		}
	});
});


// Endpoint untuk melihat hasil absensi berdasarkan tanggal
absen.get("/absensi/:date", (req, res, next) => {
	const { date } = req.params; // Format: YYYY-MM-DD
	const tableName = `absensi_${moment(date).format("YYYY_MM_DD")}`;

	const sql = `SELECT * FROM ${tableName}`;
	db.query(sql, (err, results) => {
		if (err) return res.status(500).json({ error: err.message });
		if (results.length === 0)
			return res
				.status(404)
				.json({ message: "Tidak ada data absensi untuk tanggal ini" });

		res.status(200).json(results);
	});
});

module.exports = absen;
