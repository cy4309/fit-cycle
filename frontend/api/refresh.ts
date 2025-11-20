import type { VercelRequest, VercelResponse } from "@vercel/node";
import jwt from "jsonwebtoken";

export default function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const cookie = req.headers.cookie;
    const refreshToken = cookie
      ?.split("; ")
      .find((c) => c.startsWith("refreshToken="))
      ?.split("=")[1];

    if (!refreshToken) {
      return res.status(401).json({ message: "No refresh token" });
    }

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET as string) as { username: string };

    const accessToken = jwt.sign({ username: decoded.username }, process.env.ACCESS_TOKEN_SECRET as string, { expiresIn: "15m" });

    return res.status(200).json({ accessToken });
  } catch {
    return res.status(401).json({ message: "Invalid refresh token" });
  }
}
