const root = process.cwd();
require(`${root}/config`);
const express = require("express");

const { db } = require("../src/database");

const moment = require("moment-timezone");
const xlsx = require("xlsx");

const data = express.Router();


// Endpoint untuk perekapan absensi selama satu bulan
data.get("/rekap-absensi", (req, res) => {
	const { bulan, tahun } = req.query; // bulan dan tahun dari query params
	const startDate = moment(`${tahun}-${bulan}-01`).startOf("month");
	const endDate = moment(startDate).endOf("month");
	const rekapData = {};

	for (let day = startDate.date(); day <= endDate.date(); day++) {
		const dateFormatted = moment(`${tahun}-${bulan}-${day}`).format("YYYY_MM_DD");
		const tableName = `absensi_${dateFormatted}`;

		const sql = `SELECT nisn, nama, kelas, status_pulang FROM ${tableName}`;
		db.query(sql, (err, results) => {
			if (err) return res.status(500).json({ error: err.message });

			results.forEach(row => {
				const { nisn, nama, kelas } = row;
				if (!rekapData[nisn]) {
					rekapData[nisn] = {
						nama,
						kelas,
						absensi: {},
					};
				}

				const status = row.status_pulang ? row.status_pulang : "A"; // Anggap Alpa jika tidak ada status
				rekapData[nisn].absensi[day] = status;
			});

			// Jika sudah semua data diambil, buat Excel
			if (day === endDate.date()) {
				const dataForExcel = [];

				Object.keys(rekapData).forEach(nisn => {
					const { nama, kelas, absensi } = rekapData[nisn];
					const row = { NAMA: nama, KELAS: kelas };

					for (let d = 1; d <= endDate.date(); d++) {
						row[d] = absensi[d] || "A"; // Default Alpa jika tidak ada status
					}

					dataForExcel.push(row);
				});

				const worksheet = xlsx.utils.json_to_sheet(dataForExcel);
				const workbook = xlsx.utils.book_new();
				xlsx.utils.book_append_sheet(workbook, worksheet, "Rekap Absensi");

				const fileName = `Rekap_Absensi_${bulan}_${tahun}.xlsx`;
				xlsx.writeFile(workbook, fileName);

				res.download(fileName, err => {
					if (err) {
						console.error("Error downloading file:", err);
					}
				});
			}
		});
	}
});

module.exports = data;
