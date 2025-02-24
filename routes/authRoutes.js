const express = require("express");
const bcryptjs = require("bcryptjs");
const pool = require("../config/database");
const jwt = require("jsonwebtoken");

const router = express.Router();

router.get("/sign_in", (req, res) => {
    res.render("sign_in", { title: "sign" });
});

// post rout to sign and check data that user insert
router.post("/api/login", async (req, res) => {
    console.log("Получены данные для регистрации:", req.body);
    const { email, password } = req.body;

    try {
        const userResult = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (userResult.rows.length === 0) {
            return res.status(400).json({ message: "Неверный email или пароль" });
        }

        const user = userResult.rows[0];
        const isMatch = await bcryptjs.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: "Неверный email или пароль" });
        }

        const token = jwt.sign({ id: user.id, email: user.email }, "секретный_ключ", { expiresIn: "1h" });

        res.json({ token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Что-то пошло не так" });
    }
});

router.get("/reg", (req, res) => {
    res.render("reg", { title: "Регистрация" });
});

// Post rout to add new user into database
router.post("/api/reg", async (req, res) => {
    console.log("Получены данные для регистрации:", req.body);
    const { name, email, password, confirm_password, phone_number } = req.body;

    if (password !== confirm_password) {
        return res.status(400).json({ message: "Пароли не совпадают" });
    }

    try {
        const hashedPassword = await bcryptjs.hash(password, 10);
        const newUser = await pool.query(
            "INSERT INTO users (name, email, password, phone_number) VALUES ($1, $2, $3, $4) RETURNING *",
            [name, email, hashedPassword, phone_number]
        );

        const token = jwt.sign({ id: newUser.rows[0].id, email: newUser.rows[0].email }, "секретный_ключ", { expiresIn: "1h" });

        res.json({ token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Ошибка при регистрации" });
    }
});


module.exports = router;
