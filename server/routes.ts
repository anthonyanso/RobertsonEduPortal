import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAdminAuthenticated } from "./replitAuth";
import { 
  insertStudentSchema,
  insertResultSchema,
  insertScratchCardSchema,
  insertNewsSchema,
  insertAdmissionApplicationSchema,
  insertContactMessageSchema,
  insertSchoolInfoSchema,
  insertAdminUserSchema,
  signUpSchema,
} from "@shared/schema";
import { z } from "zod";
import bcrypt from "bcryptjs";

// Note: Temporarily removing auth middleware to fix corruption

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Admin authentication routes
  app.post('/api/auth/signup', async (req, res) => {
    try {
      const { firstName, lastName, email, password, adminCode } = req.body;
      
      // Basic validation
      if (!firstName || !lastName || !email || !password || !adminCode) {
        return res.status(400).json({ message: "All fields are required" });
      }
      
      // Check admin code
      if (adminCode !== "ROBERTSON2024") {
        return res.status(400).json({ message: "Invalid admin code" });
      }
      
      // Check if email already exists
      const existingUser = await storage.getAdminUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already exists" });
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Create admin user
      const adminUser = await storage.createAdminUser({
        email,
        firstName,
        lastName,
        passwordHash: hashedPassword,
        role: "admin",
        isActive: true,
      });
      
      // Store in session
      (req.session as any).adminUser = {
        id: adminUser.id,
        email: adminUser.email,
        firstName: adminUser.firstName,
        lastName: adminUser.lastName,
        role: adminUser.role,
      };
      
      res.json({ 
        message: "Admin account created successfully",
        user: {
          id: adminUser.id,
          email: adminUser.email,
          firstName: adminUser.firstName,
          lastName: adminUser.lastName,
          role: adminUser.role,
        }
      });
    } catch (error) {
      console.error("Error creating admin user:", error);
      res.status(500).json({ message: "Failed to create admin account" });
    }
  });

  app.post('/api/auth/signin', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      // Find admin user
      const adminUser = await storage.getAdminUserByEmail(email);
      if (!adminUser) {
        return res.status(400).json({ message: "Invalid credentials" });
      }
      
      // Check password
      const isValidPassword = await bcrypt.compare(password, adminUser.passwordHash);
      if (!isValidPassword) {
        return res.status(400).json({ message: "Invalid credentials" });
      }
      
      // Store in session
      (req.session as any).adminUser = {
        id: adminUser.id,
        email: adminUser.email,
        firstName: adminUser.firstName,
        lastName: adminUser.lastName,
        role: adminUser.role,
      };
      
      res.json({ 
        message: "Signed in successfully",
        user: {
          id: adminUser.id,
          email: adminUser.email,
          firstName: adminUser.firstName,
          lastName: adminUser.lastName,
          role: adminUser.role,
        }
      });
    } catch (error) {
      console.error("Error signing in:", error);
      res.status(500).json({ message: "Failed to sign in" });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  // Test endpoint to check admin user
  app.get('/api/auth/test', async (req, res) => {
    try {
      const adminUser = await storage.getAdminUserByEmail('admin@robertsoneducation.com');
      res.json({ 
        exists: !!adminUser,
        user: adminUser ? { 
          id: adminUser.id, 
          email: adminUser.email, 
          firstName: adminUser.firstName, 
          lastName: adminUser.lastName 
        } : null 
      });
    } catch (error) {
      console.error("Error checking admin user:", error);
      res.status(500).json({ message: "Failed to check admin user" });
    }
  });

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Public routes
  
  // News routes
  app.get('/api/news', async (req, res) => {
    try {
      const news = await storage.getPublishedNews();
      res.json(news);
    } catch (error) {
      console.error("Error fetching news:", error);
      res.status(500).json({ message: "Failed to fetch news" });
    }
  });

  app.get('/api/news/category/:category', async (req, res) => {
    try {
      const { category } = req.params;
      const news = await storage.getNewsByCategory(category);
      res.json(news);
    } catch (error) {
      console.error("Error fetching news by category:", error);
      res.status(500).json({ message: "Failed to fetch news by category" });
    }
  });

  app.get('/api/news/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const newsItem = await storage.getNewsItem(id);
      if (!newsItem) {
        return res.status(404).json({ message: "News item not found" });
      }
      res.json(newsItem);
    } catch (error) {
      console.error("Error fetching news item:", error);
      res.status(500).json({ message: "Failed to fetch news item" });
    }
  });

  // Admission application route
  app.post('/api/admission', async (req, res) => {
    try {
      const validatedData = insertAdmissionApplicationSchema.parse(req.body);
      const application = await storage.createAdmissionApplication(validatedData);
      res.json(application);
    } catch (error) {
      console.error("Error creating admission application:", error);
      res.status(500).json({ message: "Failed to create admission application" });
    }
  });

  // Contact message route
  app.post('/api/contact', async (req, res) => {
    try {
      const validatedData = insertContactMessageSchema.parse(req.body);
      const message = await storage.createContactMessage(validatedData);
      res.json(message);
    } catch (error) {
      console.error("Error creating contact message:", error);
      res.status(500).json({ message: "Failed to create contact message" });
    }
  });

  // Result checker route
  app.post('/api/check-result', async (req, res) => {
    try {
      const { studentId, pin, session, term } = req.body;
      
      // Check if scratch card is valid
      const scratchCard = await storage.getScratchCardByPin(pin);
      if (!scratchCard) {
        return res.status(400).json({ message: "Invalid scratch card PIN" });
      }

      // Check if scratch card is expired
      if (new Date() > scratchCard.expiryDate) {
        return res.status(400).json({ message: "Scratch card has expired" });
      }

      // Check if scratch card has been used too many times
      if (scratchCard.usageCount >= scratchCard.usageLimit) {
        return res.status(400).json({ message: "Scratch card has reached its usage limit" });
      }

      // Get student result
      const result = await storage.getResultByStudentAndSession(studentId, session, term);
      if (!result) {
        return res.status(404).json({ message: "Result not found for the specified student and session" });
      }

      // Get student info
      const student = await storage.getStudentByStudentId(studentId);
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }

      // Update scratch card usage
      await storage.updateScratchCard(scratchCard.id, {
        usageCount: scratchCard.usageCount + 1,
        usedAt: new Date(),
        usedBy: studentId,
      });

      res.json({
        student: {
          name: `${student.firstName} ${student.lastName}`,
          studentId: student.studentId,
          gradeLevel: student.gradeLevel,
        },
        result: {
          session: result.session,
          term: result.term,
          subjects: result.subjects,
          totalScore: result.totalScore,
          average: result.average,
          gpa: result.gpa,
          position: result.position,
          remarks: result.remarks,
        },
      });
    } catch (error) {
      console.error("Error checking result:", error);
      res.status(500).json({ message: "Failed to check result" });
    }
  });

  // School info route
  app.get('/api/school-info', async (req, res) => {
    try {
      const schoolInfo = await storage.getSchoolInfo();
      res.json(schoolInfo);
    } catch (error) {
      console.error("Error fetching school info:", error);
      res.status(500).json({ message: "Failed to fetch school info" });
    }
  });

  // Protected admin routes (simplified for now)
  app.get('/api/admin/students', async (req, res) => {
    try {
      const students = await storage.getStudents();
      res.json(students);
    } catch (error) {
      console.error("Error fetching students:", error);
      res.status(500).json({ message: "Failed to fetch students" });
    }
  });

  app.post('/api/admin/students', async (req, res) => {
    try {
      const validatedData = insertStudentSchema.parse(req.body);
      const student = await storage.createStudent(validatedData);
      res.json(student);
    } catch (error) {
      console.error("Error creating student:", error);
      res.status(500).json({ message: "Failed to create student" });
    }
  });

  app.put('/api/admin/students/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertStudentSchema.partial().parse(req.body);
      const student = await storage.updateStudent(id, validatedData);
      res.json(student);
    } catch (error) {
      console.error("Error updating student:", error);
      res.status(500).json({ message: "Failed to update student" });
    }
  });

  app.delete('/api/admin/students/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteStudent(id);
      res.json({ message: "Student deleted successfully" });
    } catch (error) {
      console.error("Error deleting student:", error);
      res.status(500).json({ message: "Failed to delete student" });
    }
  });

  // Admin results routes
  app.get('/api/admin/results', isAdminAuthenticated, async (req, res) => {
    try {
      const results = await storage.getResults();
      res.json(results);
    } catch (error) {
      console.error("Error fetching results:", error);
      res.status(500).json({ message: "Failed to fetch results" });
    }
  });

  app.post('/api/admin/results', isAdminAuthenticated, async (req, res) => {
    try {
      const validatedData = insertResultSchema.parse(req.body);
      const result = await storage.createResult(validatedData);
      res.json(result);
    } catch (error) {
      console.error("Error creating result:", error);
      res.status(500).json({ message: "Failed to create result" });
    }
  });

  app.put('/api/admin/results/:id', isAdminAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertResultSchema.partial().parse(req.body);
      const result = await storage.updateResult(id, validatedData);
      res.json(result);
    } catch (error) {
      console.error("Error updating result:", error);
      res.status(500).json({ message: "Failed to update result" });
    }
  });

  app.delete('/api/admin/results/:id', isAdminAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteResult(id);
      res.json({ message: "Result deleted successfully" });
    } catch (error) {
      console.error("Error deleting result:", error);
      res.status(500).json({ message: "Failed to delete result" });
    }
  });

  // Admin scratch cards routes
  app.get('/api/admin/scratch-cards', isAdminAuthenticated, async (req, res) => {
    try {
      const scratchCards = await storage.getScratchCards();
      res.json(scratchCards);
    } catch (error) {
      console.error("Error fetching scratch cards:", error);
      res.status(500).json({ message: "Failed to fetch scratch cards" });
    }
  });

  app.post('/api/admin/scratch-cards/generate', isAdminAuthenticated, async (req, res) => {
    try {
      const { count = 1, expiryMonths = 3 } = req.body;
      const scratchCards = [];
      
      for (let i = 0; i < count; i++) {
        const pin = Math.random().toString(36).substr(2, 12).toUpperCase();
        const expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + expiryMonths);
        
        scratchCards.push({
          pin,
          expiryDate,
          usageLimit: 1,
          usageCount: 0,
        });
      }
      
      const createdCards = await storage.createScratchCards(scratchCards);
      res.json(createdCards);
    } catch (error) {
      console.error("Error generating scratch cards:", error);
      res.status(500).json({ message: "Failed to generate scratch cards" });
    }
  });

  app.delete('/api/admin/scratch-cards/:id', isAdminAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteScratchCard(id);
      res.json({ message: "Scratch card deleted successfully" });
    } catch (error) {
      console.error("Error deleting scratch card:", error);
      res.status(500).json({ message: "Failed to delete scratch card" });
    }
  });

  // Admin news routes
  app.get('/api/admin/news', isAdminAuthenticated, async (req, res) => {
    try {
      const news = await storage.getNews();
      res.json(news);
    } catch (error) {
      console.error("Error fetching news:", error);
      res.status(500).json({ message: "Failed to fetch news" });
    }
  });

  app.post('/api/admin/news', async (req, res) => {
    try {
      const validatedData = insertNewsSchema.parse(req.body);
      const news = await storage.createNews(validatedData);
      res.json(news);
    } catch (error) {
      console.error("Error creating news:", error);
      res.status(500).json({ message: "Failed to create news" });
    }
  });

  app.put('/api/admin/app.put('/api/admin/news/:id', isAdminAuthenticated', isAdminAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertNewsSchema.partial().parse(req.body);
      const news = await storage.updateNews(id, validatedData);
      res.json(news);
    } catch (error) {
      console.error("Error updating news:", error);
      res.status(500).json({ message: "Failed to update news" });
    }
  });

  app.delete('/api/admin/app.delete('/api/admin/news/:id', isAdminAuthenticated', isAdminAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteNews(id);
      res.json({ message: "News deleted successfully" });
    } catch (error) {
      console.error("Error deleting news:", error);
      res.status(500).json({ message: "Failed to delete news" });
    }
  });

  // Admin admission applications
  app.get('/api/admin/app.get('/api/admin/admissions', isAdminAuthenticated', isAdminAuthenticated, async (req, res) => {
    try {
      const applications = await storage.getAdmissionApplications();
      res.json(applications);
    } catch (error) {
      console.error("Error fetching admission applications:", error);
      res.status(500).json({ message: "Failed to fetch admission applications" });
    }
  });

  app.put('/api/admin/app.put('/api/admin/admissions/:id', isAdminAuthenticated', isAdminAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertAdmissionApplicationSchema.partial().parse(req.body);
      const application = await storage.updateAdmissionApplication(id, validatedData);
      res.json(application);
    } catch (error) {
      console.error("Error updating admission application:", error);
      res.status(500).json({ message: "Failed to update admission application" });
    }
  });

  app.delete('/api/admin/app.delete('/api/admin/admissions/:id', isAdminAuthenticated', isAdminAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteAdmissionApplication(id);
      res.json({ message: "Admission application deleted successfully" });
    } catch (error) {
      console.error("Error deleting admission application:", error);
      res.status(500).json({ message: "Failed to delete admission application" });
    }
  });

  // Admin contact messages
  app.get('/api/admin/app.get('/api/admin/contact-messages', isAdminAuthenticated', isAdminAuthenticated, async (req, res) => {
    try {
      const messages = await storage.getContactMessages();
      res.json(messages);
    } catch (error) {
      console.error("Error fetching contact messages:", error);
      res.status(500).json({ message: "Failed to fetch contact messages" });
    }
  });

  app.put('/api/admin/app.put('/api/admin/contact-messages/:id', isAdminAuthenticated', isAdminAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertContactMessageSchema.partial().parse(req.body);
      const message = await storage.updateContactMessage(id, validatedData);
      res.json(message);
    } catch (error) {
      console.error("Error updating contact message:", error);
      res.status(500).json({ message: "Failed to update contact message" });
    }
  });

  app.delete('/api/admin/app.delete('/api/admin/contact-messages/:id', isAdminAuthenticated', isAdminAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteContactMessage(id);
      res.json({ message: "Contact message deleted successfully" });
    } catch (error) {
      console.error("Error deleting contact message:", error);
      res.status(500).json({ message: "Failed to delete contact message" });
    }
  });

  // Admin school info
  app.put('/api/admin/app.put('/api/admin/school-info', isAdminAuthenticated', isAdminAuthenticated, async (req, res) => {
    try {
      const validatedData = insertSchoolInfoSchema.parse(req.body);
      const schoolInfo = await storage.upsertSchoolInfo(validatedData);
      res.json(schoolInfo);
    } catch (error) {
      console.error("Error updating school info:", error);
      res.status(500).json({ message: "Failed to update school info" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
