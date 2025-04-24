import dotenv from 'dotenv';
dotenv.config();

import { defineConfig } from "drizzle-kit";

export default defineConfig({
    dialect: "postgresql",  
    schema: "./src/Drizzle/schema.ts",
    out: "./src/Drizzle/migrations",
    dbCredentials: {
        url: process.env.DATABASE_URL as string,
    },
    verbose: true,
    strict: true,

})