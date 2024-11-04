// Fungsi untuk membuat tabel harian
const createDailyTable = () => {
    const today = moment().tz("Asia/Makassar").format("YYYY_MM_DD");
    const tableName = `absensi_${today}`;

    const createTableSQL = `
        CREATE TABLE IF NOT EXISTS ${tableName} (
            id INT AUTO_INCREMENT PRIMARY KEY,
            siswa_id INT,
            nama VARCHAR(100),
            kelas VARCHAR(50),
            waktu_absen DATETIME,
            waktu_pulang DATETIME,
            status_pulang VARCHAR(20),
            status VARCHAR(20),
            FOREIGN KEY (siswa_id) REFERENCES siswa(id)
        );
    `;

    db.query(createTableSQL, err => {
        if (err) throw err;
        console.log(`Table created: ${tableName}`);
    });
};

// Panggil fungsi untuk membuat tabel harian
createDailyTable();

// Endpoint untuk mencatat absensi pagi
app.post("/absensi", (req, res) => {
    const { siswa_id, nama, kelas, waktu_absen } = req.body;
    const today = moment().tz("Asia/Makassar").format("YYYY_MM_DD");
    const tableName = `absensi_${today}`;

    // Waktu batas masuk
    const batas_masuk = moment.tz("07:00", "HH:mm", "Asia/Makassar").toDate();
    const batas_terlambat = moment.tz("07:15", "HH:mm", "Asia/Makassar").toDate();

    let status;

    if (new Date(waktu_absen) <= batas_masuk) {
        status = "Tepat Waktu";
    } else if (new Date(waktu_absen) <= batas_terlambat) {
        const terlambat_menit = Math.floor((new Date(waktu_absen) - batas_masuk) / 60000);
        status = `Terlambat (${terlambat_menit} menit)`;
    } else {
        status = "Alpa";
    }

    const sql = `INSERT INTO ${tableName} (siswa_id, nama, kelas, waktu_absen, status) VALUES (?, ?, ?, ?, ?)`;
    db.query(sql, [siswa_id, nama, kelas, waktu_absen, status], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(200).json({ message: "Absensi pagi tercatat", status });
    });
});

// Endpoint untuk mencatat absensi pulang
app.post("/absensi-pulang", (req, res) => {
    const { siswa_id, waktu_pulang } = req.body;
    const today = moment().tz("Asia/Makassar").format("YYYY_MM_DD");
    const tableName = `absensi_${today}`;

    // Periksa apakah siswa sudah melakukan absensi pagi
    const sqlCheck = `SELECT * FROM ${tableName} WHERE siswa_id = ? ORDER BY waktu_absen DESC LIMIT 1`;
    db.query(sqlCheck, [siswa_id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.length === 0)
            return res.status(404).json({ message: "Siswa belum absen pagi" });

        const waktuAbsenPagi = new Date(result[0].waktu_absen);
        let statusPulang;

        // Jika siswa sudah absen pagi, cek absensi pulang
        if (!result[0].waktu_pulang) {
            statusPulang = "Bolos"; // Jika belum ada absensi pulang
        } else {
            statusPulang = "Hadir"; // Jika sudah absen pulang
        }

        // Update waktu pulang dan status
        const sqlUpdate = `UPDATE ${tableName} SET waktu_pulang = ?, status_pulang = ? WHERE id = ?`;
        db.query(sqlUpdate, [waktu_pulang, statusPulang, result[0].id], (err, updateResult) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.status(200).json({ message: "Absensi pulang tercatat", status: statusPulang });
        });
    });
});

// Endpoint untuk melihat hasil absensi berdasarkan tanggal
app.get("/absensi/:date", (req, res) => {
    const { date } = req.params; // Format: YYYY-MM-DD
    const tableName = `absensi_${moment(date).format("YYYY_MM_DD")}`;

    const sql = `SELECT * FROM ${tableName}`;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0)
            return res.status(404).json({ message: "Tidak ada data absensi untuk tanggal ini" });

        res.status(200).json(results);
    });
});

// Jalankan server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
