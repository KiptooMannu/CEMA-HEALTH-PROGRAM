import { Context } from "hono";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { db } from "../Drizzle/db";
import { users, auth } from "../Drizzle/schema";
import { eq } from "drizzle-orm";
import { createAuthUserService, userLoginService } from "./auth.service";

const JWT_SECRET = process.env.JWT_SECRET || "default_secret_key";

export const signup = async (c: Context) => {
    console.log('[Auth Controller] Signup request received');
    try {
        const { username, password, role } = await c.req.json();
        console.log('[Auth Controller] Signup data:', { username, role });

        if (typeof password !== 'string' || password.length < 8) {
            console.log('[Auth Controller] Invalid password format');
            return c.json({ error: "Password must be a string with at least 8 characters" }, 400);
        }

        console.log('[Auth Controller] Starting transaction for user creation');
        const result = await db.transaction(async (tx) => {
            console.log('[Auth Controller] Checking for existing user:', username);
            const existingUser = await tx.query.users.findFirst({
                where: eq(users.username, username)
            });
            
            if (existingUser) {
                console.log('[Auth Controller] User already exists:', username);
                throw new Error("User already exists");
            }

            console.log('[Auth Controller] Generating password hash');
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            console.log('[Auth Controller] Creating user record');
            const [newUser] = await tx.insert(users).values({
                username,
                password: hashedPassword,
                role,
            }).returning();

            console.log('[Auth Controller] Creating auth record for user:', newUser.id);
            await tx.insert(auth).values({
                userId: newUser.id,
                passwordHash: hashedPassword,
                salt,
            });

            return newUser;
        });

        console.log('[Auth Controller] User created successfully:', {
            userId: result.id,
            username: result.username
        });
        return c.json({ 
            message: "User created successfully",
            userId: result.id 
        }, 201);

    } catch (error: any) {
        console.error('[Auth Controller] Signup error:', {
            error: error.message,
            stack: error.stack
        });
        return c.json({ 
            error: error.message === "User already exists" ? error.message : "Registration failed",
            statusCode: error.message === "User already exists" ? 409 : 500
        });
    }
};

export const loginUser = async (c: Context) => {
    console.log('[Auth Controller] Login request received');
    try {
        const { username, password } = await c.req.json();
        console.log('[Auth Controller] Login attempt for user:', username);

        const user = await userLoginService(username);
        if (!user) {
            console.log('[Auth Controller] Invalid credentials (user not found):', username);
            return c.json({ error: "Invalid credentials" }, 401);
        }

        console.log('[Auth Controller] Comparing password hash');
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            console.log('[Auth Controller] Invalid credentials (wrong password)');
            return c.json({ error: "Invalid credentials" }, 401);
        }

        console.log('[Auth Controller] Generating JWT token for user:', user.id);
        const token = jwt.sign(
            { 
                userId: user.id,
                username: user.username, 
                role: user.role 
            },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        console.log('[Auth Controller] Login successful:', {
            userId: user.id,
            username: user.username
        });
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
        console.error('[Auth Controller] Login error:', {
            error: error.message,
            stack: error.stack
        });
        return c.json({ error: "Authentication failed" }, 500);
    }
};
export const getCurrentUser = async (c: Context) => {
    console.log('[Auth Controller] Current user request received');
    
    // 1. Check if Authorization header exists (optional auth)
    const authHeader = c.req.header('Authorization');
    let user = null;

    // 2. If token is provided, try to verify it
    if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        try {
            const decoded = jwt.verify(token, JWT_SECRET) as { 
                userId: string; 
                username: string; 
                role: string 
            };
            user = {
                id: decoded.userId,
                username: decoded.username,
                role: decoded.role,
                isAuthenticated: true,
            };
        } catch (error) {
            console.log('[Auth Controller] Invalid token, treating as guest');
            // Token is invalid, proceed as unauthenticated
        }
    }

    // 3. If no valid token, return a default/guest user
    if (!user) {
        user = {
            id: 'guest',
            username: 'guest',
            role: 'guest',
            isAuthenticated: false,
        };
    }

    console.log('[Auth Controller] Returning user:', user);
    return c.json(user, 200);
};