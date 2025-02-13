const express = require("express");
require('dotenv').config();
const ejs = require("ejs");
const express_session = require("express-session");
const bcryptjs = require("bcryptjs");
const connect_pg_simple = require("connect-pg-simple");
const passport = require("passport");
const passport_local = require("passport-local");
const {Pool} = require("pg");


const app =express();
console.log("🔍 Переменные окружения:", process.env);


// Conecting to PostgreSQL
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

// api route fetch data 
app.get ('/users', async(req, res)=>{
    try{
        const result = await pool.query('Select * FROM users');
        res.json(result.rows)
    }catch(err){
        console.err(err);
        res.status(500).send('Database error')
    }
});


// server init =====================================
app.get('/', (req, res)=>{
    res.send("Hello World");
})

const PORT = process.env.PORT;

app.listen(PORT, ()=>{
    console.log(`Server work at https://localhost:${PORT}`);
})