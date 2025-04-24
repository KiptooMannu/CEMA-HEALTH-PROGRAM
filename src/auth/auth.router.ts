import { Hono } from 'hono';
import { signup, loginUser, getCurrentUser } from './auth.controller';
import { zValidator } from '@hono/zod-validator';
import { authSchema } from './validator';
import { authMiddleware } from '../middlewares/authmiddlewares';

export const authRouter = new Hono();

// Register system user
authRouter.post(
    "/signup", 
    zValidator('json', authSchema, (result, c) => {
        if (!result.success) {
            return c.json({
                error: "Validation failed",
                details: result.error.issues
            }, 400);
        }
    }), 
    signup
);

// Login system user
authRouter.post(
    "/login", 
    zValidator('json', authSchema, (result, c) => {
        if (!result.success) {
            return c.json({
                error: "Validation failed",
                details: result.error.issues
            }, 400);
        }
    }), 
    loginUser
);

// Get current user profile
authRouter.get(
    "/me", 
    // authMiddleware, 
    getCurrentUser
);

export default authRouter;