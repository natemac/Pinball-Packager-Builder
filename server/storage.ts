import { users, packageProjects, type User, type InsertUser, type PackageProject, type InsertPackageProject } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUserProjects(userId: number): Promise<PackageProject[]>;
  createProject(userId: number, project: InsertPackageProject): Promise<PackageProject>;
  updateProject(projectId: number, updates: Partial<InsertPackageProject>): Promise<PackageProject>;
  deleteProject(projectId: number): Promise<void>;
  getProject(projectId: number): Promise<PackageProject | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getUserProjects(userId: number): Promise<PackageProject[]> {
    return await db.select().from(packageProjects).where(eq(packageProjects.userId, userId));
  }

  async createProject(userId: number, project: InsertPackageProject): Promise<PackageProject> {
    const [newProject] = await db
      .insert(packageProjects)
      .values({ 
        name: project.name,
        gameType: project.gameType,
        settings: project.settings,
        userId 
      })
      .returning();
    return newProject;
  }

  async updateProject(projectId: number, updates: Partial<InsertPackageProject>): Promise<PackageProject> {
    const updateData: any = { updatedAt: new Date() };
    
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.gameType !== undefined) updateData.gameType = updates.gameType;
    if (updates.settings !== undefined) updateData.settings = updates.settings;
    
    const [updatedProject] = await db
      .update(packageProjects)
      .set(updateData)
      .where(eq(packageProjects.id, projectId))
      .returning();
    return updatedProject;
  }

  async deleteProject(projectId: number): Promise<void> {
    await db.delete(packageProjects).where(eq(packageProjects.id, projectId));
  }

  async getProject(projectId: number): Promise<PackageProject | undefined> {
    const [project] = await db.select().from(packageProjects).where(eq(packageProjects.id, projectId));
    return project || undefined;
  }
}

export const storage = new DatabaseStorage();
