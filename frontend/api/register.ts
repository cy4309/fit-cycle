import type { VercelRequest, VercelResponse } from "@vercel/node";

interface User {
  username: string;
  password: string;
}

let users: User[] = [];

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { username, password } = req.body as User;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password required" });
  }

  const existing = users.find((u) => u.username === username);
  if (existing) {
    return res.status(400).json({ message: "User already exists" });
  }

  users.push({ username, password });
  return res.status(201).json({ message: "User registered successfully" });
}
