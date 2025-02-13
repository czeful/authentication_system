const express = require("express");
const dotenv = require("dotenv");
const ejs = require("ejs");
const express_session = require("express-session");
const bcryptjs = require("bcryptjs");
const connect_pg_simple = require("connect-pg-simple");
const passport = require("passport");
const passport_local = require("passport-local");
const {Pool} = require("pg");

// Conecting to PostgreSQL

const pool = new Pool({
    user: '', 
    host: '',
    database: '',
    password: '',
    port: 5432,
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

const PORT = 3000;

app.listen(PORT, ()=>{
    console.log(`Server work at https://localhost:${PORT}`);
})