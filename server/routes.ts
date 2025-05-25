import type { Express } from "express";
import { createServer, type Server } from "http";

export async function registerRoutes(app: Express): Promise<Server> {
  // This application is primarily client-side focused
  // All file processing and zip generation happens in the browser
  // No backend API routes needed for the core functionality
  
  const httpServer = createServer(app);
  return httpServer;
}
