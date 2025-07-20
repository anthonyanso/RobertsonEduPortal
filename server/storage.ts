import {
  users,
  adminUsers,
  students,
  results,
  scratchCards,
  news,
  admissionApplications,
  contactMessages,
  schoolInfo,
  type User,
  type UpsertUser,
  type AdminUser,
  type InsertAdminUser,
  type Student,
  type InsertStudent,
  type Result,
  type InsertResult,
  type ScratchCard,
  type InsertScratchCard,
  type News,
  type InsertNews,
  type AdmissionApplication,
  type InsertAdmissionApplication,
  type ContactMessage,
  type InsertContactMessage,
  type SchoolInfo,
  type InsertSchoolInfo,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte, like, or } from "drizzle-orm";
import bcrypt from "bcryptjs";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Admin user operations
  getAdminUserByEmail(email: string): Promise<AdminUser | undefined>;
  createAdminUser(adminUser: InsertAdminUser): Promise<AdminUser>;
  
  // Student operations
  getStudents(): Promise<Student[]>;
  getStudent(id: number): Promise<Student | undefined>;
  getStudentByStudentId(studentId: string): Promise<Student | undefined>;
  createStudent(student: InsertStudent): Promise<Student>;
  updateStudent(id: number, student: Partial<InsertStudent>): Promise<Student>;
  deleteStudent(id: number): Promise<void>;
  
  // Result operations
  getResults(): Promise<Result[]>;
  getResult(id: number): Promise<Result | undefined>;
  getResultByStudentAndSession(studentId: string, session: string, term: string): Promise<Result | undefined>;
  createResult(result: InsertResult): Promise<Result>;
  updateResult(id: number, result: Partial<InsertResult>): Promise<Result>;
  deleteResult(id: number): Promise<void>;
  
  // Scratch card operations
  getScratchCards(): Promise<ScratchCard[]>;
  getScratchCard(id: number): Promise<ScratchCard | undefined>;
  getScratchCardByPin(pin: string): Promise<ScratchCard | undefined>;
  getScratchCardByStudentId(studentId: string): Promise<ScratchCard | undefined>;
  createScratchCard(scratchCard: InsertScratchCard): Promise<ScratchCard>;
  createScratchCards(scratchCards: InsertScratchCard[]): Promise<ScratchCard[]>;
  updateScratchCard(id: number, scratchCard: Partial<InsertScratchCard>): Promise<ScratchCard>;
  deleteScratchCard(id: number): Promise<void>;
  regeneratePinForStudent(studentId: string): Promise<ScratchCard>;
  
  // News operations
  getNews(): Promise<News[]>;
  getPublishedNews(): Promise<News[]>;
  getNewsByCategory(category: string): Promise<News[]>;
  getNewsItem(id: number): Promise<News | undefined>;
  createNews(news: InsertNews): Promise<News>;
  updateNews(id: number, news: Partial<InsertNews>): Promise<News>;
  deleteNews(id: number): Promise<void>;
  
  // Admission applications
  getAdmissionApplications(): Promise<AdmissionApplication[]>;
  getAdmissionApplication(id: number): Promise<AdmissionApplication | undefined>;
  createAdmissionApplication(application: InsertAdmissionApplication): Promise<AdmissionApplication>;
  updateAdmissionApplication(id: number, application: Partial<InsertAdmissionApplication>): Promise<AdmissionApplication>;
  deleteAdmissionApplication(id: number): Promise<void>;
  
  // Contact messages
  getContactMessages(): Promise<ContactMessage[]>;
  getContactMessage(id: number): Promise<ContactMessage | undefined>;
  createContactMessage(message: InsertContactMessage): Promise<ContactMessage>;
  updateContactMessage(id: number, message: Partial<InsertContactMessage>): Promise<ContactMessage>;
  deleteContactMessage(id: number): Promise<void>;
  
  // School info
  getSchoolInfo(): Promise<SchoolInfo[]>;
  getSchoolSettings(): Promise<SchoolInfo[]>;
  getSchoolInfoByKey(key: string): Promise<SchoolInfo | undefined>;
  upsertSchoolInfo(info: InsertSchoolInfo): Promise<SchoolInfo>;
  deleteSchoolInfo(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Admin user operations
  async getAdminUserByEmail(email: string): Promise<AdminUser | undefined> {
    const [adminUser] = await db.select().from(adminUsers).where(eq(adminUsers.email, email));
    return adminUser;
  }

  async createAdminUser(adminUserData: InsertAdminUser): Promise<AdminUser> {
    const [adminUser] = await db.insert(adminUsers).values(adminUserData).returning();
    return adminUser;
  }

  // Student operations
  async getStudents(): Promise<Student[]> {
    return await db.select().from(students).orderBy(desc(students.createdAt));
  }

  async getStudent(id: number): Promise<Student | undefined> {
    const [student] = await db.select().from(students).where(eq(students.id, id));
    return student;
  }

  async getStudentByStudentId(studentId: string): Promise<Student | undefined> {
    const [student] = await db.select().from(students).where(eq(students.studentId, studentId));
    return student;
  }

  async createStudent(student: InsertStudent): Promise<Student> {
    const [newStudent] = await db.insert(students).values(student).returning();
    return newStudent;
  }

  async updateStudent(id: number, student: Partial<InsertStudent>): Promise<Student> {
    console.log("Storage updateStudent called with:", { id, student });
    
    const [updatedStudent] = await db
      .update(students)
      .set({ ...student, updatedAt: new Date() })
      .where(eq(students.id, id))
      .returning();
    
    console.log("Storage updateStudent result:", updatedStudent);
    return updatedStudent;
  }

  async deleteStudent(id: number): Promise<void> {
    await db.delete(students).where(eq(students.id, id));
  }

  // Result operations
  async getResults(): Promise<Result[]> {
    return await db.select().from(results).orderBy(desc(results.createdAt));
  }

  async getResult(id: number): Promise<Result | undefined> {
    const [result] = await db.select().from(results).where(eq(results.id, id));
    return result;
  }

  async getResultByStudentAndSession(studentId: string, session: string, term: string): Promise<Result | undefined> {
    const [result] = await db
      .select()
      .from(results)
      .where(and(eq(results.studentId, studentId), eq(results.session, session), eq(results.term, term)));
    return result;
  }

  async createResult(result: InsertResult): Promise<Result> {
    const [newResult] = await db.insert(results).values(result).returning();
    return newResult;
  }

  async updateResult(id: number, result: Partial<InsertResult>): Promise<Result> {
    const [updatedResult] = await db
      .update(results)
      .set({ ...result, updatedAt: new Date() })
      .where(eq(results.id, id))
      .returning();
    return updatedResult;
  }

  async deleteResult(id: number): Promise<void> {
    await db.delete(results).where(eq(results.id, id));
  }

  // Scratch card operations
  async getScratchCards(): Promise<ScratchCard[]> {
    return await db.select().from(scratchCards).orderBy(desc(scratchCards.createdAt));
  }

  async getScratchCard(id: number): Promise<ScratchCard | undefined> {
    const [scratchCard] = await db.select().from(scratchCards).where(eq(scratchCards.id, id));
    return scratchCard;
  }

  async getScratchCardByPin(pin: string): Promise<ScratchCard | undefined> {
    const [scratchCard] = await db.select().from(scratchCards).where(eq(scratchCards.pin, pin));
    return scratchCard;
  }

  async getScratchCardByStudentId(studentId: string): Promise<ScratchCard | undefined> {
    const [scratchCard] = await db.select().from(scratchCards).where(eq(scratchCards.studentId, studentId));
    return scratchCard;
  }

  async createScratchCard(scratchCard: InsertScratchCard): Promise<ScratchCard> {
    const [newScratchCard] = await db.insert(scratchCards).values(scratchCard).returning();
    return newScratchCard;
  }

  async createScratchCards(scratchCardList: InsertScratchCard[]): Promise<ScratchCard[]> {
    const newScratchCards = await db.insert(scratchCards).values(scratchCardList).returning();
    return newScratchCards;
  }

  async updateScratchCard(id: number, scratchCard: Partial<InsertScratchCard>): Promise<ScratchCard> {
    const [updatedScratchCard] = await db
      .update(scratchCards)
      .set({ ...scratchCard, updatedAt: new Date() })
      .where(eq(scratchCards.id, id))
      .returning();
    return updatedScratchCard;
  }

  async deleteScratchCard(id: number): Promise<void> {
    await db.delete(scratchCards).where(eq(scratchCards.id, id));
  }

  async regeneratePinForStudent(studentId: string): Promise<ScratchCard> {
    // Generate new PIN
    const newPin = Math.floor(100000 + Math.random() * 900000).toString();
    const pinHash = await bcrypt.hash(newPin, 10);
    
    // Set new expiry date (3 months from now)
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + 3);
    
    // Update existing card or create new one
    const existingCard = await this.getScratchCardByStudentId(studentId);
    
    if (existingCard) {
      const [updatedCard] = await db
        .update(scratchCards)
        .set({
          pin: newPin,
          pinHash,
          expiryDate,
          status: "unused",
          usageCount: 0,
          usageLimit: 30,
          updatedAt: new Date()
        })
        .where(eq(scratchCards.id, existingCard.id))
        .returning();
      return updatedCard;
    } else {
      // Create new card
      const serialNumber = `SN${Date.now()}${Math.floor(Math.random() * 1000)}`;
      const newCard = await this.createScratchCard({
        serialNumber,
        pin: newPin,
        pinHash,
        studentId,
        expiryDate,
        status: "unused",
        usageCount: 0,
        usageLimit: 30
      });
      return newCard;
    }
  }

  // News operations
  async getNews(): Promise<News[]> {
    return await db.select().from(news).orderBy(desc(news.createdAt));
  }

  async getPublishedNews(): Promise<News[]> {
    return await db.select().from(news).where(eq(news.published, true)).orderBy(desc(news.createdAt));
  }

  async getNewsByCategory(category: string): Promise<News[]> {
    return await db
      .select()
      .from(news)
      .where(and(eq(news.category, category), eq(news.published, true)))
      .orderBy(desc(news.createdAt));
  }

  async getNewsItem(id: number): Promise<News | undefined> {
    const [newsItem] = await db.select().from(news).where(eq(news.id, id));
    return newsItem;
  }

  async createNews(newsItem: InsertNews): Promise<News> {
    const [newNews] = await db.insert(news).values(newsItem).returning();
    return newNews;
  }

  async updateNews(id: number, newsItem: Partial<InsertNews>): Promise<News> {
    const [updatedNews] = await db
      .update(news)
      .set({ ...newsItem, updatedAt: new Date() })
      .where(eq(news.id, id))
      .returning();
    return updatedNews;
  }

  async deleteNews(id: number): Promise<void> {
    await db.delete(news).where(eq(news.id, id));
  }

  // Admission applications
  async getAdmissionApplications(): Promise<AdmissionApplication[]> {
    return await db.select().from(admissionApplications).orderBy(desc(admissionApplications.createdAt));
  }

  async getAdmissionApplication(id: number): Promise<AdmissionApplication | undefined> {
    const [application] = await db.select().from(admissionApplications).where(eq(admissionApplications.id, id));
    return application;
  }

  async createAdmissionApplication(application: InsertAdmissionApplication): Promise<AdmissionApplication> {
    const [newApplication] = await db.insert(admissionApplications).values(application).returning();
    return newApplication;
  }

  async updateAdmissionApplication(id: number, application: Partial<InsertAdmissionApplication>): Promise<AdmissionApplication> {
    const [updatedApplication] = await db
      .update(admissionApplications)
      .set({ ...application, updatedAt: new Date() })
      .where(eq(admissionApplications.id, id))
      .returning();
    return updatedApplication;
  }

  async deleteAdmissionApplication(id: number): Promise<void> {
    await db.delete(admissionApplications).where(eq(admissionApplications.id, id));
  }

  // Contact messages
  async getContactMessages(): Promise<ContactMessage[]> {
    return await db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt));
  }

  async getContactMessage(id: number): Promise<ContactMessage | undefined> {
    const [message] = await db.select().from(contactMessages).where(eq(contactMessages.id, id));
    return message;
  }

  async createContactMessage(message: InsertContactMessage): Promise<ContactMessage> {
    const [newMessage] = await db.insert(contactMessages).values(message).returning();
    return newMessage;
  }

  async updateContactMessage(id: number, message: Partial<InsertContactMessage>): Promise<ContactMessage> {
    const [updatedMessage] = await db
      .update(contactMessages)
      .set({ ...message, updatedAt: new Date() })
      .where(eq(contactMessages.id, id))
      .returning();
    return updatedMessage;
  }

  async deleteContactMessage(id: number): Promise<void> {
    await db.delete(contactMessages).where(eq(contactMessages.id, id));
  }

  // School info
  async getSchoolInfo(): Promise<SchoolInfo[]> {
    return await db.select().from(schoolInfo);
  }

  async getSchoolSettings(): Promise<SchoolInfo[]> {
    return await db.select().from(schoolInfo);
  }

  async getSchoolInfoByKey(key: string): Promise<SchoolInfo | undefined> {
    const [info] = await db.select().from(schoolInfo).where(eq(schoolInfo.key, key));
    return info;
  }

  async upsertSchoolInfo(info: InsertSchoolInfo): Promise<SchoolInfo> {
    const [schoolInfoItem] = await db
      .insert(schoolInfo)
      .values(info)
      .onConflictDoUpdate({
        target: schoolInfo.key,
        set: {
          value: info.value,
          updatedAt: new Date(),
        },
      })
      .returning();
    return schoolInfoItem;
  }

  async deleteSchoolInfo(id: number): Promise<void> {
    await db.delete(schoolInfo).where(eq(schoolInfo.id, id));
  }
}

export const storage = new DatabaseStorage();
