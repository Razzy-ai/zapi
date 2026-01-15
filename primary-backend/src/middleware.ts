import { Request, Response, NextFunction } from "express";
import { JWT_PASSWORD } from "./config";
import jwt from "jsonwebtoken"

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(403).json({
      message: "Authorization header missing",
    });
  }

  // Expect: "Bearer <token>"
  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(403).json({
      message: "Token missing",
    });
  }

  try {
    const payload = jwt.verify(token, JWT_PASSWORD) as { id: string };
    // @ts-ignore
    req.id = payload.id;
    next();
  } catch (e) {
    return res.status(403).json({
      message: "You are not logged in",
    });
  }
}
