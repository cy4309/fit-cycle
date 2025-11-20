import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// ✅ 取得目前檔案的目錄（因為你在 ESModule 環境）
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// dotenv.config();
dotenv.config({ path: path.join(__dirname, "../.env") }); // ✅ 指定載入根目錄的 .env
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:8082", "https://jwt-rtk-practice-frontend.vercel.app"],
    credentials: true,
  })
);

const users = []; // 模擬資料庫

// JWT helpers
import jwt from "jsonwebtoken";
const generateAccessToken = (user) => jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
const generateRefreshToken = (user) => jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });

// 註冊
app.post("/register", async (req, res) => {
  console.log("📥 [STEP 1] /register 被呼叫");
  const { username, password } = req.body;
  const bcrypt = await import("bcryptjs");
  const hashedPassword = await bcrypt.default.hash(password, 10);
  users.push({ username, password: hashedPassword });
  console.log("✅ [STEP 1] 使用者已註冊：", username);
  res.json({ message: "User registered." });
});

// 登入
app.post("/login", async (req, res) => {
  console.log("📥 [STEP 2] /login 被呼叫");
  const { username, password } = req.body;
  const user = users.find((u) => u.username === username);
  if (!user) return res.status(400).json({ message: "User not found" });
  const bcrypt = await import("bcryptjs");
  const valid = await bcrypt.default.compare(password, user.password);
  if (!valid) return res.status(400).json({ message: "Invalid password" });

  const accessToken = generateAccessToken({ username });
  const refreshToken = generateRefreshToken({ username });

  console.log("✅ [STEP 2] 登入成功，產生 Token：", { username });
  console.log("🔑 Access Token:", accessToken.slice(0, 20) + "...");
  console.log("🍪 Refresh Token:", refreshToken.slice(0, 20) + "...");

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true, // ✅ 前端 JS 不能讀
    secure: false, // 若是 https，要設 true
    sameSite: "strict",
  });

  res.json({ accessToken, user: { username } });
});

// Refresh Token
app.post("/refresh", (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ message: "No refresh token" });

  jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid refresh token" });
    const accessToken = generateAccessToken({ username: user.username });
    res.json({ accessToken });
  });
});

// Protected route
app.get("/protected", authenticateToken, (req, res) => {
  res.json({ message: "Welcome " + req.user.username });
});

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.sendStatus(401);
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// 登出
app.post("/logout", (req, res) => {
  console.log("📥 [STEP 7] /logout 被呼叫，清除 cookie");
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: false,
    sameSite: "strict",
  });
  console.log("✅ [STEP 7] refreshToken 已清除");
  res.json({ message: "Logged out successfully" });
});

// 預熱render
app.get("/health", (req, res) => res.send("OK"));

app.listen(5000, "0.0.0.0", () => console.log("Backend running on port 5000"));
