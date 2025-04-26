import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { clientRouter } from "./Client/Client.Router";
import { programRouter } from "./Programs/Programs.router";
import { enrollmentRouter } from "./Entrollments/Entrollment.router";
import authRouter from "./auth/auth.router";

const app = new Hono();

// Global Middleware (MUST be before routes)
app.use(cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowHeaders: ['Content-Type', 'Authorization']
}));



// Now Routes (after middleware)
app.route("/api/clients", clientRouter);
app.route("/api/programs", programRouter);
app.route("/api/enrollments", enrollmentRouter);
app.route("/", authRouter);

// Health Check
app.get("/health", (c) => c.text("OK"));

// Server
const port = parseInt(process.env.PORT || "3000");
serve({
  fetch: app.fetch,
  port,
});

console.log(`Server running on port ${port}`);
console.log('Routes registered:', app.routes);
