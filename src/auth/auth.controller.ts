// import { Context } from "hono";
// import bcrypt from "bcrypt";
// import jwt from "jsonwebtoken";
// import { db } from "../Drizzle/db";
// import { users, auth } from "../Drizzle/schema";
// import { eq } from "drizzle-orm";
// import { createAuthUserService, userLoginService } from "./auth.service";

// const JWT_SECRET = process.env.JWT_SECRET || "default_secret_key";

// // auth.controller.ts
// export const signup = async (c: Context) => {
//     console.log('[Auth Controller] Signup request received');
//     try {
//         const { 
//             username, 
//             password, 
//             firstName,
//             lastName,
//             email,
//             phone,
//             confirmPassword,
//             dateOfBirth,
//             gender,
//             address,
//             role = 'doctor' // Default role
//         } = await c.req.json();

//         // Validate password match if confirmPassword exists
//         if (confirmPassword && password !== confirmPassword) {
//             return c.json({ error: "Passwords do not match" }, 400);
//         }

//         // Check password length
//         if (typeof password !== 'string' || password.length < 8) {
//             return c.json({ error: "Password must be at least 8 characters" }, 400);
//         }

//         const result = await db.transaction(async (tx) => {
//             // Check existing user
//             const existingUser = await tx.query.users.findFirst({
//                 where: eq(users.username, username)
//             });
            
//             if (existingUser) {
//                 throw new Error("User already exists");
//             }

//             // Create user record
//             const salt = await bcrypt.genSalt(10);
//             const hashedPassword = await bcrypt.hash(password, salt);

//             const [newUser] = await tx.insert(users).values({
//                 username,
//                 password: hashedPassword,
//                 role,
//                 firstName,
//                 lastName,
//                 email,
//                 phone,
//                 dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
//                 gender: gender || null,
//                 address: address || null
//             }).returning();

//             // Create auth record
//             await tx.insert(auth).values({
//                 userId: newUser.id,
//                 passwordHash: hashedPassword,
//                 salt,
//             });

//             return newUser;
//         });

//         return c.json({ 
//             message: "User created successfully",
//             user: {
//                 id: result.id,
//                 username: result.username,
//                 role: result.role,
//                 firstName: result.firstName,
//                 lastName: result.lastName
//             }
//         }, 201);

//     } catch (error: any) {
//         console.error('Registration error:', error); // Add this for debugging
//         return c.json({ 
//             error: error.message || "Registration failed",
//             statusCode: error.message === "User already exists" ? 409 : 500
//         });
//     }
// };
// export const loginUser = async (c: Context) => {
//     console.log('[Auth Controller] Login request received');
//     try {
//         const { username, password } = await c.req.json();
        
//         // Find user by username only
//         const user = await db.query.users.findFirst({
//             where: eq(users.username, username),
//             columns: {
//                 id: true,
//                 username: true,
//                 password: true,
//                 role: true,
//                 isActive: true
//             }
//         });

//         if (!user) {
//             return c.json({ error: "Invalid credentials" }, 401);
//         }

//         if (!user.isActive) {
//             return c.json({ error: "Account is inactive" }, 403);
//         }

//         const validPassword = await bcrypt.compare(password, user.password);
//         if (!validPassword) {
//             return c.json({ error: "Invalid credentials" }, 401);
//         }

//         const token = jwt.sign(
//             { 
//                 userId: user.id,
//                 username: user.username, 
//                 role: user.role 
//             },
//             JWT_SECRET,
//             { expiresIn: '1h' }
//         );

//         return c.json({ 
//             message: "Login successful", 
//             token,
//             user: {
//                 id: user.id,
//                 username: user.username,
//                 role: user.role
//             }
//         }, 200);

//     } catch (error: any) {
//         console.error('Login error:', error);
//         return c.json({ error: "Authentication failed" }, 500);
//     }
// };



// export const getCurrentUser = async (c: Context) => {
//     const authHeader = c.req.header('Authorization');
    
//     if (authHeader?.startsWith('Bearer ')) {
//         const token = authHeader.split(' ')[1];
//         try {
//             const decoded = jwt.verify(token, JWT_SECRET) as { 
//                 userId: string; 
//                 username: string; 
//                 role: string 
//             };
            
//             // Fetch complete user data
//             const user = await db.query.users.findFirst({
//                 where: eq(users.id, parseInt(decoded.userId)),
//                 columns: {
//                     id: true,
//                     username: true,
//                     role: true,
//                     firstName: true,
//                     lastName: true,
//                     email: true,
//                     phone: true,
//                     createdAt: true
//                 }
//             });

//             if (user) {
//                 return c.json({
//                     ...user,
//                     isAuthenticated: true
//                 }, 200);
//             }
//         } catch (error) {
//             console.log('Invalid token');
//         }
//     }

//     return c.json({
//         id: 'guest',
//         username: 'guest',
//         role: 'guest',
//         isAuthenticated: false,
//     }, 200);
// };