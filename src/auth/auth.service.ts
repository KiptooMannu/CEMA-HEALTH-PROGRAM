import { db } from "../Drizzle/db";
import { auth, users } from "../Drizzle/schema";
import { eq } from "drizzle-orm";

// Create auth record for a user
export const createAuthUserService = async (authData: {
    userId: number;
    passwordHash: string;
    salt: string;
}) => {
    const createAuth = await db.insert(auth).values(authData).returning({ id: auth.id }).execute();
    return createAuth.length > 0 ? createAuth[0].id : null;
};

// Get user by username for login
export const userLoginService = async (username: string) => {
    const user = await db.query.users.findFirst({
        where: eq(users.username, username),
        columns: {
            id: true,
            username: true,
            password: true,
            role: true,
            createdAt: true
        }
    });
    
    return user || null;
};

// Get user by ID (for authentication checks)
export const getUserByIdService = async (userId: number) => {
    const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
        columns: {
            id: true,
            username: true,
            role: true,
            isActive: true
        }
    });
    
    return user || null;
};