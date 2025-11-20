import type { VercelRequest, VercelResponse } from "@vercel/node";
import jwt from "jsonwebtoken";

interface User {
  username: string;
  password: string;
}

const users: User[] = [{ username: "testuser", password: "123456" }];

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { username, password } = req.body as User;
  const user = users.find((u) => u.username === username && u.password === password);

  if (!user) {
    return res.status(400).json({ message: "User not found or wrong password" });
  }

  const accessToken = jwt.sign({ username }, process.env.ACCESS_TOKEN_SECRET as string, { expiresIn: "15m" });

  const refreshToken = jwt.sign({ username }, process.env.REFRESH_TOKEN_SECRET as string, { expiresIn: "7d" });

  res.setHeader("Set-Cookie", `refreshToken=${refreshToken}; HttpOnly; Path=/; Max-Age=604800; SameSite=Strict`);

  return res.status(200).json({
    user: { username },
    accessToken,
  });
}
