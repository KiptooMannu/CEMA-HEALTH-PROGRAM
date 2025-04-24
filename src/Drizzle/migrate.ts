import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Client } from "pg";
import dotenv from "dotenv";

dotenv.config();

const client = new Client({
    connectionString: process.env.DATABASE_URL, // Ensure this is set in your .env file
    ssl: { rejectUnauthorized: false }, // For SSL connection to Neon
});

const db = drizzle(client);

async function migration() {
    console.log('======== Migrations started ========');

    try {
        await client.connect();
        console.log('======== Migrations completed successfully ========');
    } catch (err: unknown) {
        if (err instanceof Error) {
            console.error('Migration error:', err.message);
        } else {
            console.error('Migration error:', err);
        }
        process.exit(1);
    } finally {
        await client.end();
    }
}

// Execute migrations
migration().catch((err: unknown) => {
    if (err instanceof Error) {
        console.error('Migration error:', err.message);
    } else {
        console.error('Migration error:', err);
    }
    process.exit(1);
});
