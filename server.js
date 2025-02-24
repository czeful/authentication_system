const express = require("express");
require("dotenv").config();
const {Server} = require("socket.io");
const http = require('http');
const session = require("express-session");
const bodyParser = require("body-parser");
const cors = require("cors");
const morgan = require("morgan");
const pool = require("./config/database");  // Подключаем базу
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();
const server = http.createServer(app);
const io = new Server(server)

app.set("view engine", "ejs");
app.set("views", __dirname + "/view");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(morgan("dev"));
app.use(express.json());
// Разрешить запросы с http://localhost:3000
app.use(cors({
    origin: "http://localhost:3000"
}));


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



// Подключаем WebSockets
io.on("connection", (socket) => {
    console.log("🔵 User connected:", socket.id);

    socket.on("sendMessage", async ({ chat_id, sender_id, content }) => {
        try {
            const result = await pool.query(
                "INSERT INTO messages (chat_id, sender_id, content) VALUES ($1, $2, $3) RETURNING *",
                [chat_id, sender_id, content]
            );

            io.to(`chat_${chat_id}`).emit("newMessage", result.rows[0]);
        } catch (err) {
            console.error("Ошибка при отправке сообщения:", err);
        }
    });

    socket.on("joinChat", (chat_id) => {
        socket.join(`chat_${chat_id}`);
    });

    socket.on("disconnect", () => {
        console.log("🔴 User disconnected:", socket.id);
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
});
