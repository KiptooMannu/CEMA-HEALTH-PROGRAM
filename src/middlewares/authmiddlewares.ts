import { Context } from "hono";
import { jwt } from "hono/jwt";
import { db } from "../Drizzle/db";
import { users } from "../Drizzle/schema";
import { eq } from "drizzle-orm";

export const authMiddleware = jwt({
  secret: process.env.JWT_SECRET || "secret",
});

export const doctorRoleMiddleware = async (c: Context, next: Function) => {
  const payload = c.get("jwtPayload");
  const [user] = await db.select().from(users).where(eq(users.id, payload.id));

  if (!user || user.role !== "doctor") {
    return c.json({ error: "Unauthorized" }, 403);
  }

  c.set("userId", user.id);
  await next();
};

export const adminRoleMiddleware = async (c: Context, next: Function) => {
  const payload = c.get("jwtPayload");
  const [user] = await db.select().from(users).where(eq(users.id, payload.id));

  if (!user || user.role !== "admin") {
    return c.json({ error: "Unauthorized" }, 403);
  }

  c.set("userId", user.id);
  await next();
};