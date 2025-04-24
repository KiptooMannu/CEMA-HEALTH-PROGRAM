import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";
import dotenv from "dotenv";

// Load environment variables first
dotenv.config();

// Decode the URL-encoded components
const decodeDatabaseUrl = (url: string) => {
  try {
    return decodeURIComponent(url);
  } catch (error) {
    console.error("Error decoding DATABASE_URL:", error);
    return url;
  }
};

// Validate and configure database connection
const getDatabaseConfig = () => {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  const decodedUrl = decodeDatabaseUrl(process.env.DATABASE_URL);
  
  return {
    connectionString: decodedUrl,
    ssl: {
      rejectUnauthorized: false
    },
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
  };
};

const pool = new Pool(getDatabaseConfig());

// Connection error handling
pool.on('error', (err) => {
  console.error('Unexpected database error:', err);
});

// Test connection function
export const testConnection = async () => {
  let client;
  try {
    client = await pool.connect();
    await client.query('SELECT 1');
    console.log('Database connection successful');
    return true;
  } catch (err) {
    console.error('Database connection failed:', err);
    return false;
  } finally {
    if (client) client.release();
  }
};

export const db = drizzle(pool, { schema });