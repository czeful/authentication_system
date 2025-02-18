const express = require("express");
require("dotenv").config();
const session = require("express-session");
const bodyParser = require("body-parser");
const cors = require("cors");
const morgan = require("morgan");
const pool = require("./config/database");  // Подключаем базу
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();

app.set("view engine", "ejs");
app.set("views", __dirname + "/view");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(morgan("dev"));

app.use(
    session({
        secret: process.env.SESSION_SECRET || "your_secret_key",
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false },
    })
);

// Используем маршруты
app.use("/", authRoutes);
app.use("/", userRoutes);

app.get("/", (req, res) => {
    res.render("index", { title: "Главная страница" });
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
});
