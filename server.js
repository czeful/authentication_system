const express = require("express");
require('dotenv').config();
const ejs = require("ejs");
const express_session = require("express-session");
const bcryptjs = require("bcryptjs");
const connect_pg_simple = require("connect-pg-simple");
const passport = require("passport");
const passport_local = require("passport-local");
const {Pool} = require("pg");
const body_parser = require("body-parser");
const cors = require('cors');
const nodemon = require('nodemon')

const app =express();

app.set('view engine', 'ejs'); // Указываем EJS как шаблонизатор
app.set('views', __dirname + '/view'); // Директория с шаблонами (по умолчанию "views")
 
app.use(body_parser.urlencoded({ extended: true }));
app.use(express.static('public')); // Для статических файлов


// Conecting to PostgreSQLx
const pool = new Pool({
    user: process.env.pg_user, 
    host: process.env.pg_host,
    database: process.env.pg_database,
    password: process.env.pg_password,
    port: process.env.pg_port,
})

// testing conetcting of database

pool.connect()
    .then(client=>{
        console.log('Connected to Database');
        client.release();
    })
    .catch(err => console.error('Connecting error', err.stack));

// routes
app.get('/', (req, res) => {
    res.render("index", {title: 'Home'});
});

// regist
app.get ('/reg', (req, res)=>{
    res.render('reg', {title: 'reg'})
})
app.post('/reg', async (req, res) => {
    const { name, email, password, confirm_password } = req.body;

    if (password !== confirm_password) {
        return res.status(400).send('Пароли не совпадают');
    }

    try {
        const hashedPassword = await bcryptjs.hash(password, 10);

        const result = await pool.query(
            'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *',
            [name, email, hashedPassword]
        );

        res.send('Регистрация прошла успешно');
    } catch (err) {
        console.error(err);
        res.status(500).send('Ошибка при регистрации');
    }
});

app.get('/sign_in', (req,res)=>{
    res.render('sign_in', {title: 'sign'})
})

app.get ('/users', async(req, res)=>{
    try{
        const result = await pool.query('Select * FROM users');
        console.log(result)
        res.json(result.rows)
    }catch(err){
        console.err(err);
        res.status(500).send('Database error')
    }
});




// server init =====================================
const PORT = process.env.PORT;

app.listen(PORT, ()=>{
    console.log(`Server work at http://localhost:${PORT}`);
})