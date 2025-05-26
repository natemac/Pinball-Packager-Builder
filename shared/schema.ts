import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// File processing types
export interface TableFile {
  file: File;
  name: string;
  type: 'vpx' | 'fp';
}

export interface AdditionalFile {
  id: string;
  file: File;
  originalName: string;
  category: 'cover' | 'topper' | 'tableVideo' | 'marqueeVideo' | 'directb2s' | 'music' | 'scripts';
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
  renameFiles: boolean;
  preserveExtensions: boolean;
  convertImages: boolean;
  compressionLevel: 'none' | 'fast' | 'normal' | 'maximum';
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
