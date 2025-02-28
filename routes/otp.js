    const express = require("express");
    const bcryptjs = require("bcryptjs");
    const jwt = require("jsonwebtoken");
    const nodemailer = require("nodemailer");
    const bodyParser = require("body-parser");
    const dotenv = require("dotenv");
    const { route } = require("./authRoutes");
    const pool = require("../config/database");
    const router = express.Router();
    const cors = require("cors")
    const app = express();
    dotenv.config();
    app.use(cors({
        origin: "http://localhost:3000"
    }));


    app.use(bodyParser.json());

    const transporter = nodemailer.createTransport({
        service: "Gmail",
        auth:{
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS, 
        },
    });

    const otpStorage = {}; // Временно тут храним данные

    const generateOTP = () => Math.floor(100000 + Math.random() * 9000000).toString();


    router.post ("/api/send-otp", async (req, res ) => {
        const {email} = req.body;
        const otp = generateOTP();
        console.log("Generated OTP", otp);
        const hashhedOtp = await bcryptjs.hash(otp,  10) // Хэшируем OTP
        const expires_at = new Date(Date.now() + 5 * 60000); // 5минут

        try{
            console.log("Trying to insert into DB:", email, hashhedOtp, expires_at);
            console.log("Stored OTP hash:", hashhedOtp);
            console.log("Entered OTP:", otp);

            await pool.query("INSERT INTO otp_codes(email, otp, expires_at) VALUES($1, $2, $3)", [email, hashhedOtp, expires_at])
            console.log("Inserted into DB successfully!");

            console.log("Trying to send email to:", email);
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: email,
                subject: "Ваш код подтверждения", 
                text: `Ваш OTP-код:${otp}. Действителен 5 минут`, 
            });
            console.log("Email sent successfully!");
            res.json({message: "OTP отправлен!"});
        }catch (error){
            console.error("Ошибка при отправке OTP:", error);
            res.status(500).json({message: "Ошибка при отправке OTP"})
        }
    });

    router.post('/api/verify-otp', async (req, res) => {
        const { email, otp } = req.body;
        console.log("Пришло в /verify-otp:", email, otp);
    
        try {
            const result = await pool.query(
                "SELECT * FROM otp_codes WHERE email = $1 ORDER BY expires_at DESC LIMIT 1",
                [email]
            );
            console.log("OTP from DB:", result.rows);
    
            if (result.rows.length === 0) {
                return res.status(400).json({ message: "OTP не найден" });
            }
    
            const otpData = result.rows[0];
    
            if (otpData.attempts >= 3) { // Лимит попыток
                await pool.query("DELETE FROM otp_codes WHERE email = $1", [email]);
                return res.status(400).json({ message: "Вы превысили лимит попыток" });
            }
    
            console.log("Entered OTP:", otp);
            console.log("Stored OTP hash:", otpData.otp);
    
            // Сравниваем OTP с хэшированным значением
            const isMatch = await bcryptjs.compare(otp.toString(), otpData.otp);
    
            if (isMatch && new Date(otpData.expires_at) > new Date()) {
                await pool.query("DELETE FROM otp_codes WHERE email = $1", [email]);
                return res.json({ message: "OTP подтвержден! :)" });
            } else {
                await pool.query("UPDATE otp_codes SET attempts = attempts + 1 WHERE email = $1", [email]);
                return res.status(400).json({ message: "Неверный OTP" });
            }
        } catch (error) {
            console.error("Ошибка при проверке OTP:", error);
            res.status(500).json({ message: "Ошибка проверки OTP" });
        }
    });
    

    module.exports = router;
