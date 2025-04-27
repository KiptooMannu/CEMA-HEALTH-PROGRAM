// import { db } from "../Drizzle/db";
// import { auth, users } from "../Drizzle/schema";
// import { eq } from "drizzle-orm";

// export const createAuthUserService = async (authData: {
//     userId: number;
//     passwordHash: string;
//     salt: string;
// }) => {
//     console.log('[Auth Service] Creating auth record for user:', authData.userId);
//     try {
//         const [result] = await db.insert(auth).values(authData).returning();
//         console.log('[Auth Service] Auth record created successfully for user:', authData.userId);
//         return result;
//     } catch (error) {
//         console.error('[Auth Service] Error creating auth record:', {
//             error: error instanceof Error ? error.message : 'Unknown error',
//             userId: authData.userId,
//             stack: error instanceof Error ? error.stack : undefined
//         });
//         throw new Error("Failed to create auth record");
//     }
// };

// export const userLoginService = async (username: string) => {
//     console.log('[Auth Service] Attempting login for username:', username);
//     try {
//         const user = await db.query.users.findFirst({
//             where: eq(users.username, username),
//             columns: {
//                 id: true,
//                 username: true,
//                 password: true,
//                 role: true,
//                 createdAt: true,
//                 isActive: true
//             }
//         });
        
//         if (!user) {
//             console.log('[Auth Service] User not found:', username);
//             return null;
//         }

//         if (!user.isActive) {
//             console.log('[Auth Service] User account inactive:', username);
//             return null;
//         }

//         console.log('[Auth Service] User found:', {
//             id: user.id,
//             username: user.username,
//             role: user.role,
//             isActive: user.isActive
//         });
        
//         return user;
//     } catch (error) {
//         console.error('[Auth Service] Database error during login:', {
//             username,
//             error: error instanceof Error ? error.message : 'Unknown error',
//             stack: error instanceof Error ? error.stack : undefined
//         });
//         throw new Error("Authentication service unavailable");
//     }
// };