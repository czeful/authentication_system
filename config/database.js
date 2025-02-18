const {Pool} = require ("pg");
require ("dotenv").config;

const pool = new Pool({
    user: process.env.pg_user, 
    host: process.env.pg_host,
    database: process.env.pg_database,
    password: process.env.pg_password,
    port: process.env.pg_port,
})

pool.connect()
    .then(client =>{
        console.log("✅ Connected to Database by Anelya help");
        client.release();
    })
    .catch(err=>console.error ("❌ Database connection error", err.stack));

module.exports = pool;