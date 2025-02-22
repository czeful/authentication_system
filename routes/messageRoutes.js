const express = require("express");
const pool = require("../config/database");
const router  = express.Router();



router.get('/chat/:chat_id/massages', async(req , res)=>{
    const {chat_id} = req.params;
    try{
        const messages = await pool.query('SELECT * FROM messages WHERE chat_id = $1 ORDER BY created_at ASC', [chat_id]);
        res.json(messages.rows);
    }catch(err){
        console.error(err);
        res.status(500).send("Ошибка при получение сообщений")
    }
})