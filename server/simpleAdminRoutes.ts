import type { Express } from "express";
import { adminUsers } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-for-dev";

export function setupSimpleAdminAuth(app: Express) {
  // Simple admin login without middleware conflicts
  app.post('/api/admin/login', async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      // Find admin by email
      const [admin] = await db.select().from(adminUsers).where(eq(adminUsers.email, email));
      if (!admin || !admin.isActive) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, admin.passwordHash);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Generate JWT token
      const token = jwt.sign({
        adminId: admin.id,
        email: admin.email,
        role: admin.role
      }, JWT_SECRET, { expiresIn: "7d" });

      res.json({ 
        token,
        admin: {
          id: admin.id,
          email: admin.email,
          firstName: admin.firstName,
          lastName: admin.lastName,
          role: admin.role
        }
      });
    } catch (error) {
      console.error("Admin login error:", error);
      res.status(500).json({ message: "Failed to login" });
    }
  });

  // Simple middleware for protected admin routes
  const requireAdminAuth = async (req: any, res: any, next: any) => {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

      if (!token) {
        return res.status(401).json({ message: "Admin authentication required" });
      }

      const payload = jwt.verify(token, JWT_SECRET) as any;
      if (!payload || !payload.adminId) {
        return res.status(401).json({ message: "Invalid admin token" });
      }

      // Add admin info to request
      req.admin = payload;
      next();
    } catch (error) {
      console.error("Admin auth error:", error);
      res.status(401).json({ message: "Invalid admin token" });
    }
  };

  return requireAdminAuth;
}