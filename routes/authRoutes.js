const express = require("express");
const bcryptjs = require("bcryptjs");
const pool = require("../config/database");

const router = express.Router();

router.get("/sign_in", (req, res) => {
    res.render("sign_in", { title: "sign" });
});

// post rout to sign and check data that user insert
router.post("/sign_in", async (req, res) => {
    const { email, password } = req.body;

    try {
        const userResult = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (userResult.rows.length === 0) {
            return res.status(400).send("Неверный email или пароль");
        }

        const user = userResult.rows[0];
        const isMatch = await bcryptjs.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).send("Неверный email или пароль");
        }

        req.session.user = { id: user.id, name: user.name, email: user.email };
        res.redirect(`/profile/${user.id}`);
    } catch (err) {
        console.error(err);
        res.status(500).send("Что-то пошло не так");
    }
});

router.get("/reg", (req, res) => {
    res.render("reg", { title: "Регистрация" });
});

// Post rout to add new user into database
router.post("/reg", async (req, res) => {
    const { name, email, password, confirm_password, phone_number } = req.body;

    if (password !== confirm_password) {
        return res.status(400).send("Пароли не совпадают");
    }

    try {
        const hashedPassword = await bcryptjs.hash(password, 10);
        await pool.query(
            "INSERT INTO users (name, email, password, phone_number) VALUES ($1, $2, $3, $4) RETURNING *",
            [name, email, hashedPassword, phone_number]
        );

        res.redirect("/sign_in");
    } catch (err) {
        console.error(err);
        res.status(500).send("Ошибка при регистрации");
    }
});

module.exports = router;
