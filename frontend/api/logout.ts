import type { VercelRequest, VercelResponse } from "@vercel/node";

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Set-Cookie", "refreshToken=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict");
  res.status(200).json({ message: "Logged out successfully" });
}
