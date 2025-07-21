import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { admins } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import type { RequestHandler } from "express";

const JWT_SECRET = process.env.SESSION_SECRET || "admin-secret-key";

export interface AdminJWTPayload {
  adminId: string;
  email: string;
  role: string;
}

export const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, 12);
};

export const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword);
};

export const generateJWT = (payload: AdminJWTPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
};

export const verifyJWT = (token: string): AdminJWTPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as AdminJWTPayload;
  } catch {
    return null;
  }
};

export const adminAuthMiddleware: RequestHandler = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token) {
      return res.status(401).json({ message: "Admin authentication required" });
    }

    const payload = verifyJWT(token);
    if (!payload) {
      return res.status(401).json({ message: "Invalid admin token" });
    }

    // Verify admin still exists and is active
    const [admin] = await db.select().from(admins).where(eq(admins.id, payload.adminId));
    if (!admin || !admin.isActive) {
      return res.status(401).json({ message: "Admin account not found or inactive" });
    }

    (req as any).admin = admin;
    next();
  } catch (error) {
    console.error("Admin auth middleware error:", error);
    res.status(500).json({ message: "Admin authentication error" });
  }
};

export const generateResetToken = (): string => {
  return jwt.sign({ type: "reset", timestamp: Date.now() }, JWT_SECRET, { expiresIn: "1h" });
};

export const verifyResetToken = (token: string): boolean => {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    return payload.type === "reset";
  } catch {
    return false;
  }
};