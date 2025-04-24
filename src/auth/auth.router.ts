import { Hono } from 'hono';
import { signup, loginUser, getCurrentUser } from './auth.controller';
import { zValidator } from '@hono/zod-validator';
import { authSchema } from './validator';
import { authMiddleware } from '../middlewares/authmiddlewares';

export const authRouter = new Hono();

// Register system user - no authentication required
authRouter.post(
    "/signup", 
    zValidator('json', authSchema, (result, c) => {
        if (!result.success) {
            return c.json(result.error, 400);
        }
    }), 
    signup
);

// Login system user - no authentication required
authRouter.post(
    "/login", 
    zValidator('json', authSchema, (result, c) => {
        if (!result.success) {
            return c.json(result.error, 400);
        }
    }), 
    loginUser
);

// Get current user profile - requires authentication
authRouter.get(
    "/me", 
    authMiddleware, 
    getCurrentUser
);

export default authRouter;