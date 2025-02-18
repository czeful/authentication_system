const express = require("express");
const pool = require("../config/database");
const isAuthenticated = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/users", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM users");
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send("Database error");
    }
});

router.get("/profile/:userid", isAuthenticated, async (req, res) => {
    const { userid } = req.params;
    try {
        const userResult = await pool.query("SELECT * FROM users WHERE id = $1", [userid]);

        if (userResult.rows.length === 0) {
            return res.status(404).send("Пользователь не найден");
        }

        const user = userResult.rows[0];
        res.render("profile", { title: user.name, user });
    } catch (err) {
        console.error(err);
        res.status(500).send("Ошибка при получении данных о пользователе");
    }
});

module.exports = router;
