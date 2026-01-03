import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import agentRoutes from "./agent/routes";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Black Star Autonomous Agent Routes
  app.use('/api', agentRoutes);

  // Add other application routes here as needed
  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  return httpServer;
}
