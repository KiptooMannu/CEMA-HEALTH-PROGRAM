import { db } from "../Drizzle/db";
import { auth, users } from "../Drizzle/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

export const createAuthUserService = async (authData: {
    userId: number;
    passwordHash: string;
    salt: string;
}) => {
    try {
        const [createAuth] = await db.insert(auth).values(authData).returning();
        return createAuth;
    } catch (error) {
        console.error("Error creating auth record:", error);
        throw new Error("Failed to create auth record");
    }
};

export const userLoginService = async (username: string) => {
    try {
        const user = await db.query.users.findFirst({
            where: eq(users.username, username),
            with: {
                auth: true
            }
        });
        
        if (!user) {
            return null;
        }

        return {
            ...user,
            password: user.password,
            auth: user.auth
        };
    } catch (error) {
        console.error("Database error in userLoginService:", error);
        throw new Error("Database operation failed");
    }
};

export const getUserByIdService = async (userId: number) => {
    try {
        return await db.query.users.findFirst({
            where: eq(users.id, userId),
            with: {
                auth: true
            }
        });
    } catch (error) {
        console.error("Error in getUserByIdService:", error);
        throw new Error("Failed to fetch user");
    }
};