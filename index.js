const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
const bearerToken = require('express-bearer-token')
require('dotenv').config()
const db = require('./src/connections/mysqldb')
const {Transporter} = require('./src/helpers')
const fs = require('fs')
const handlebars = require('handlebars')

app.use(cors())
app.use(bearerToken())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:false}))
app.use(express.static('public'))

const PORT = process.env.PORT || 8000

app.get('/', (req, res) => {
    let sql = 'SELECT * FROM users'
    db.query(sql, (err, result) => {
        res.send(result)
    })
})

// Soal nomor 1
app.post('/soal1', (req,res) => {
    const {email} = req.body
    const htmlrender = fs.readFileSync('./template/email.html','utf8')
    const template = handlebars.compile(htmlrender)
    const htmlEmail = template({otp: 1234})
    Transporter.sendMail({
        from: 'Ujian Backend',
        to: email,
        subject: 'OTP',
        html:htmlEmail
    }).then(() =>{
        return res.send('Successfuly send')
    }).catch((err) => {
        return res.status(500).send(err)
    })

})

app.get('/soal2', (req, res) => {
    let sql = `SELECT SUM(quantity * hargabeli) AS total_pendapatan FROM transaksi WHERE status = 'Finished'`
    db.query(sql, (err, pendapatan) => {
        if (err) return res.status(500).send({message: err.message})
        sql = `SELECT SUM(quantity * hargabeli * 0.9) AS total_pendapatan_potensial FROM transaksi;`
        db.query(sql, (err, potensialpendapatan) => {
            if (err) return res.status(500).send({message: err.message})
            sql = `SELECT p.namatoko AS penjual_terbaik FROM penjual p JOIN transaksi t ON p.id = t.penjualid WHERE t.status = 'Finished' GROUP BY p.id ORDER BY SUM(t.hargabeli * t.quantity * 0.9) DESC LIMIT 1;`
            db.query(sql, (err, penjualterbaik) => {
                if (err) return res.status(500).send({message: err.message})
                sql = `SELECT namacategory AS category_terbaik
                FROM category_products cp
                JOIN products p
                ON p.categoryprodid = cp.id
                JOIN transaksi t
                ON p.id = t.productid
                WHERE t.status = 'Finished'
                GROUP BY cp.id
                ORDER BY SUM(t.hargabeli * t.quantity) DESC
                LIMIT 1;`
                db.query(sql, (err, categoryterbaik) => {
                    if (err) return res.status(500).send({message: err.message})
                    sql = `SELECT COUNT(username) AS jumlah_user_yang_bukan_penjual
                    FROM users
                    LEFT OUTER JOIN penjual
                    ON users.id = penjual.userid
                    WHERE penjual.userid IS NULL;`
                    db.query(sql, (err, jumlahuseryangbukanpenjual) => {
                        if (err) return res.status(500).send({message: err.message})
                        return res.status(200).send([pendapatan, potensialpendapatan, penjualterbaik, categoryterbaik, jumlahuseryangbukanpenjual])
                    })
                })
            })
        })
    })
})

app.get('/soal3', (req, res) => {
    let sql = `SELECT p.nama, p.image, p.informasiproduct, pe.namatoko
    FROM products p
    JOIN transaksi t
    ON p.id = t.productid
    JOIN penjual pe
    ON pe.id = p.penjualid 
    GROUP BY p.id
    ORDER BY SUM(t.hargabeli * t.quantity) DESC
    LIMIT 6;`
    db.query(sql, (err, result) => {
        if (err) return res.status(500).send({message: err.message})
        return res.status(500).send(result)
    })
})

// schedule.scheduleJob('*/2 * * * * *', function(firedate){
//     console.log('Nyala' + firedate)
// })

app.listen(PORT, () => {
    console.log(`Listening on ${PORT}`)
})