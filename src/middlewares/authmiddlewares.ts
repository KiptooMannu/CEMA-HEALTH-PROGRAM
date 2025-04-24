import { Context, Next } from "hono";
import { jwt } from "hono/jwt";
import { db } from "../Drizzle/db";
import { users } from "../Drizzle/schema";
import { eq } from "drizzle-orm";

// Define JWT payload type for better type safety
type JWTPayload = {
  id: number;
  username: string;
  role: "admin" | "doctor" | "staff";
  iat: number;
  exp: number;
};

// Enhanced JWT middleware without type argument
export const authMiddleware = jwt({
  secret: process.env.JWT_SECRET || "secret",
  cookie: "token", // Optional: support cookie-based auth
});

// Type augmentation for Context
declare module "hono" {
  interface ContextVariableMap {
    jwtPayload: JWTPayload;
    user: {
      id: number;
      username: string;
      role: "admin" | "doctor" | "staff";
      isActive: boolean;
      createdAt?: Date;
    };
    userId: number;
  }
}

// Base role checker middleware factory
const createRoleMiddleware = (allowedRoles: ("admin" | "doctor" | "staff")[]) => {
  return async (c: Context, next: Next) => {
    try {
      const payload = c.get("jwtPayload");
      
      // Cache user in context if not already present
      if (!c.get("user")) {
        const user = await db.query.users.findFirst({
          where: eq(users.id, payload.id),
          columns: {
            id: true,
            username: true,
            role: true,
            isActive: true
          }
        });

        if (!user || user.isActive !== true || !user.role) {
          return c.json({ error: "Unauthorized - User not found or inactive" }, 401);
        }

        // Create verified user object with non-nullable fields
        const verifiedUser = {
          id: user.id,
          username: user.username,
          role: user.role,
          isActive: user.isActive
        };

        c.set("user", verifiedUser);
      }

      const user = c.get("user");
      
      // Check if user has required role
      if (!allowedRoles.includes(user.role)) {
        return c.json(
          { error: `Forbidden - Requires ${allowedRoles.join(" or ")} role` }, 
          403
        );
      }

      // Set userId in context for consistency
      c.set("userId", user.id);
      await next();
    } catch (error) {
      console.error("Role middleware error:", error);
      return c.json({ error: "Internal server error" }, 500);
    }
  };
};

// Specific role middlewares using the factory
export const doctorRoleMiddleware = createRoleMiddleware(["doctor", "admin"]);
export const adminRoleMiddleware = createRoleMiddleware(["admin"]);
export const staffRoleMiddleware = createRoleMiddleware(["staff", "admin", "doctor"]);

// Middleware to require at least staff-level access
export const authenticatedMiddleware = createRoleMiddleware(["staff", "doctor", "admin"]);

// Middleware to check user status and cache user data
// Middleware to check user status and cache user data
export const userContextMiddleware = async (c: Context, next: Next) => {
    try {
      const payload = c.get("jwtPayload");
      
      if (!c.get("user")) {
        const user = await db.query.users.findFirst({
          where: eq(users.id, payload.id),
          columns: {
            id: true,
            username: true,
            role: true,
            isActive: true,
            createdAt: true
          }
        });
  
        if (!user || user.isActive !== true || !user.role) {
          return c.json({ error: "Unauthorized - User not found or inactive" }, 401);
        }
  
        // Create verified user object with properly typed fields
        const verifiedUser = {
          id: user.id,
          username: user.username,
          role: user.role,
          isActive: user.isActive,
          ...(user.createdAt ? { createdAt: user.createdAt } : {}) // Only include createdAt if it exists
        };
  
        c.set("user", verifiedUser);
        c.set("userId", user.id);
      }
  
      await next();
    } catch (error) {
      console.error("User context middleware error:", error);
      return c.json({ error: "Internal server error" }, 500);
    }
  };