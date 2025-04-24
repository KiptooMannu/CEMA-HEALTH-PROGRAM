import { Context } from "hono";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { db } from "../Drizzle/db";
import { users ,auth} from "../Drizzle/schema";
import { eq } from "drizzle-orm";
import { createAuthUserService, userLoginService } from "./auth.service";

const JWT_SECRET = process.env.JWT_SECRET || "default_secret_key";



export const signup = async (c: Context) => {
    try {
        const { username, password, role } = await c.req.json();

        // Validate input
        if (typeof password !== 'string' || password.length < 8) {
            return c.json({ error: "Password must be a string with at least 8 characters" }, 400);
        }

        // Start transaction
        const result = await db.transaction(async (tx) => {
            // Check if user exists
            const existingUser = await tx.query.users.findFirst({
                where: eq(users.username, username)
            });
            
            if (existingUser) {
                throw new Error("User already exists");
            }

            // Hash password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // Create user
            const [newUser] = await tx.insert(users).values({
                username,
                password: hashedPassword,
                role,
            }).returning();

            // Create auth record
            await tx.insert(auth).values({
                userId: newUser.id,
                passwordHash: hashedPassword,
                salt,
            });

            return newUser;
        });

        return c.json({ 
            message: "User created successfully",
            userId: result.id 
        }, 201);

    } catch (error: any) {
        console.error("Signup error:", error);
        if (error.message === "User already exists") {
            return c.json({ error: error.message }, 409);
        }
        return c.json({ 
            error: "Failed to create user",
            details: error.message 
        }, 500);
    }
};

export const loginUser = async (c: Context) => {
    try {
        const { username, password } = await c.req.json();

        if (typeof password !== 'string') {
            return c.json({ error: "Password must be a string" }, 400);
        }

        const user = await userLoginService(username);
        if (!user) {
            return c.json({ error: "Invalid credentials" }, 401);
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return c.json({ error: "Invalid credentials" }, 401);
        }

        const token = jwt.sign(
            { 
                userId: user.id, 
                username: user.username, 
                role: user.role 
            },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        return c.json({ 
            message: "Login successful", 
            token, 
            user: {
                id: user.id,
                username: user.username,
                role: user.role,
                createdAt: user.createdAt
            }
        }, 200);

    } catch (error: any) {
        console.error("Login error:", error);
        return c.json({ 
            error: "Failed to login",
            details: error.message 
        }, 500);
    }
};

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
        return c.json({ 
            error: "Failed to get user",
            details: error.message 
        }, 500);
    }
};