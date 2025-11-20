import type { VercelRequest, VercelResponse } from "@vercel/node";
import jwt from "jsonwebtoken";

export default function handler(req: VercelRequest, res: VercelResponse) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Missing token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string) as { username: string };

    return res.status(200).json({
      message: "Protected route accessed successfully",
      user: decoded.username,
    });
  } catch {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
}
