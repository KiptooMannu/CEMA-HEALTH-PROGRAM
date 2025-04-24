// authmiddlewares.ts
import { Context } from "hono";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "default_secret_key";

export const authMiddleware = async (c: Context, next: () => Promise<void>) => {
    console.log('[Auth Middleware] Checking authentication');
    
    const authHeader = c.req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log('[Auth Middleware] No token provided');
        return c.json({ error: "Unauthorized - No token provided" }, 401);
    }

    const token = authHeader.split(' ')[1];
    
    try {
        console.log('[Auth Middleware] Verifying token');
        const decoded = jwt.verify(token, JWT_SECRET) as { 
            userId: string; 
            username: string; 
            role: string 
        };
        
        console.log('[Auth Middleware] Token valid for user:', {
            userId: decoded.userId,
            username: decoded.username
        });
        
        // Set user in context
        c.set('user', {
            id: decoded.userId,
            username: decoded.username,
            role: decoded.role
        });
        
        await next();
    } catch (error) {
        console.error('[Auth Middleware] Token verification failed:', error);
        return c.json({ error: "Unauthorized - Invalid token" }, 401);
    }
};