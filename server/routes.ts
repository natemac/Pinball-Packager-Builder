import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPackageProjectSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get user's projects
  app.get("/api/projects", async (req, res) => {
    try {
      // For now, we'll use a default user ID of 1
      // In a real app, this would come from authentication
      const userId = 1;
      const projects = await storage.getUserProjects(userId);
      res.json(projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ error: "Failed to fetch projects" });
    }
  });

  // Create a new project
  app.post("/api/projects", async (req, res) => {
    try {
      const userId = 1; // Default user for now
      const projectData = insertPackageProjectSchema.parse(req.body);
      const project = await storage.createProject(userId, projectData);
      res.json(project);
    } catch (error) {
      console.error("Error creating project:", error);
      res.status(500).json({ error: "Failed to create project" });
    }
  });

  // Update a project
  app.put("/api/projects/:id", async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const updates = insertPackageProjectSchema.partial().parse(req.body);
      const project = await storage.updateProject(projectId, updates);
      res.json(project);
    } catch (error) {
      console.error("Error updating project:", error);
      res.status(500).json({ error: "Failed to update project" });
    }
  });

  // Delete a project
  app.delete("/api/projects/:id", async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      await storage.deleteProject(projectId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting project:", error);
      res.status(500).json({ error: "Failed to delete project" });
    }
  });

  // Get a specific project
  app.get("/api/projects/:id", async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const project = await storage.getProject(projectId);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      console.error("Error fetching project:", error);
      res.status(500).json({ error: "Failed to fetch project" });
    }
  });

  // Create default user if needed
  app.post("/api/setup", async (req, res) => {
    try {
      // Check if default user exists
      const existingUser = await storage.getUser(1);
      if (existingUser) {
        return res.json({ message: "Setup already complete" });
      }

      // Create default user
      const user = await storage.createUser({
        username: "default",
        password: "default"
      });
      
      res.json({ message: "Setup complete", user: { id: user.id, username: user.username } });
    } catch (error) {
      console.error("Error during setup:", error);
      res.status(500).json({ error: "Setup failed" });
    }
  });
  
  const httpServer = createServer(app);
  return httpServer;
}
