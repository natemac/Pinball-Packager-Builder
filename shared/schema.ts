import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const packageProjects = pgTable("package_projects", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  name: text("name").notNull(),
  gameType: text("game_type").notNull(),
  settings: jsonb("settings").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  projects: many(packageProjects),
}));

export const packageProjectsRelations = relations(packageProjects, ({ one }) => ({
  user: one(users, {
    fields: [packageProjects.userId],
    references: [users.id],
  }),
}));

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertPackageProjectSchema = createInsertSchema(packageProjects).pick({
  name: true,
  gameType: true,
  settings: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type PackageProject = typeof packageProjects.$inferSelect;
export type InsertPackageProject = z.infer<typeof insertPackageProjectSchema>;

// File processing types
export interface TableFile {
  file: File;
  name: string;
  type: 'vpx' | 'fp';
}

export interface AdditionalFile {
  id: string;
  file: File;
  category: 'cover' | 'topper' | 'tableVideo' | 'marqueeVideo' | 'directb2s' | 'music' | 'scripts';
  originalName: string;
  customLocation?: string;
  customFileId?: string;
  size: number;
}

export interface FileLocationSettings {
  useTableName: boolean;
  prefix: string;
  suffix: string;
  location: string;
}

export interface PackageSettings {
  baseDirectory: string;
  mediaFolder: string;
  preserveExtensions: boolean;
  convertImages: boolean;
  convertVideos: boolean;
  imageCompression: 'none' | 'low' | 'medium' | 'high';
  videoCompression: 'none' | 'low' | 'medium' | 'high';
  compressionLevel: 'low' | 'normal' | 'high';
  includeTableFile: boolean;
  tableFileSettings: FileLocationSettings;
  fileSettings: {
    cover: FileLocationSettings;
    topper: FileLocationSettings;
    tableVideo: FileLocationSettings;
    marqueeVideo: FileLocationSettings;
    directb2s: FileLocationSettings;
    music: FileLocationSettings;
    scripts: FileLocationSettings;
  };
}

export interface PackageStructure {
  [path: string]: File | PackageStructure;
}