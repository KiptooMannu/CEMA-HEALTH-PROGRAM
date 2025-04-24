import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { clientRouter } from "./Client/Client.Router";
import { programRouter } from "./Programs/Programs.router";
import { enrollmentRouter } from "./Entrollments/Entrollment.router";

const app = new Hono();

// Middlewares
app.use("*", logger());
app.use(
  "*",
  cors({
    origin: ["http://localhost:3000"],
    allowMethods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// Routes
app.route("/api/clients", clientRouter);
app.route("/api/programs", programRouter);
app.route("/api/enrollments", enrollmentRouter);

// Health check
app.get("/health", (c) => c.text("OK"));

const port = parseInt(process.env.PORT || "3000");
serve({
  fetch: app.fetch,
  port,
});

console.log(`Server running on port ${port}`);
console.log('Routes registered:', app.routes);