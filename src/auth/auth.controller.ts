import { Context } from "hono";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { db } from "../Drizzle/db";
import { users, auth } from "../Drizzle/schema";
import { eq } from "drizzle-orm";
import { createAuthUserService, userLoginService } from "./auth.service";

const JWT_SECRET = process.env.JWT_SECRET || "default_secret_key";

// Register system user (doctor/admin/staff)
export const signup = async (c: Context) => {
    try {
        const { username, password, role } = await c.req.json();

        // Check if user already exists
        const existingUser = await userLoginService(username);
        if (existingUser) {
            return c.json({ error: "User already exists" }, 400);
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert into users table
        const newUser = await db.insert(users).values({
            username,
            password: hashedPassword, // Storing hashed password in users table for simplicity
            role,
        }).returning({ id: users.id }).execute();

        if (newUser.length === 0) {
            return c.json({ error: "Failed to create user" }, 400);
        }

        const userId = newUser[0].id;

        // Create auth record (separate table for auth-specific data)
        const createAuth = await createAuthUserService({
            userId,
            passwordHash: hashedPassword,
            salt: "", // Not used with bcrypt
        });

        if (!createAuth) {
            return c.json({ error: "Auth record not created" }, 400);
        }

        return c.json({ message: "User created successfully" }, 201);

    } catch (error: any) {
        console.error("Signup error:", error);
        return c.json({ error: "Failed to create user" }, 500);
    }
};

// Login system user
export const loginUser = async (c: Context) => {
    try {
        const { username, password } = await c.req.json();

        // Check if user exists
        const user = await userLoginService(username);
        if (!user) {
            return c.json({ error: "Invalid credentials" }, 401);
        }

        // Compare passwords
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return c.json({ error: "Invalid credentials" }, 401);
        }

        // Generate token
        const token = jwt.sign(
            { 
                userId: user.id, 
                username: user.username, 
                role: user.role 
            },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Return minimal user info with token
        const userResponse = {
            id: user.id,
            username: user.username,
            role: user.role,
            createdAt: user.createdAt
        };

        return c.json({ 
            message: "Login successful", 
            token, 
            user: userResponse 
        }, 200);

    } catch (error: any) {
        console.error("Login error:", error);
        return c.json({ error: "Failed to login" }, 500);
    }
};

// Get current user profile
export const getCurrentUser = async (c: Context) => {
    try {
        const userId = c.get('userId');
        
        const user = await db.query.users.findFirst({
            where: eq(users.id, userId),
            columns: {
                id: true,
                username: true,
                role: true,
                createdAt: true,
                updatedAt: true,
                isActive: true
            }
        });

        if (!user) {
            return c.json({ error: "User not found" }, 404);
        }

        return c.json(user, 200);
    } catch (error: any) {
        console.error("Get user error:", error);
        return c.json({ error: "Failed to get user" }, 500);
    }
};