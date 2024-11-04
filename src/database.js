const root = process.cwd();
require(`${root}/config.js`);
const mysql = require("mysql");

const db = mysql.createConnection(
	{
		host: global.DB.host,
		user: global.DB.user,
		password: global.DB.password,
		database: global.DB.database,
	},
	err => {
		if (err) {
			console.error("[ DATABASE ] : GAGAL TERHUBUNG KE DATABASE! => ", err);
		}
	},
);


module.exports = {
    db
}