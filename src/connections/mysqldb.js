const mysql = require('mysql')

// db local
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: 'ujian_backend',
    port: 3306
})

db.connect(err =>{
    if (err) {
        console.log(err)
    }else {
        console.log('MySQL Connected')
    }
})

module.exports = db