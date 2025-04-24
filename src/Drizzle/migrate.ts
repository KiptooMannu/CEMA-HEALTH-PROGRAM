import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Client } from "pg";
import dotenv from "dotenv";
import {
  userRoleEnum,
  programStatusEnum,
  enrollmentStatusEnum,
} from "./schema"; // Adjust path as needed

dotenv.config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const db = drizzle(client);

async function migration() {
  console.log('======== Migrations started ========');

  try {
    await client.connect();

    // Create enums first - fixed syntax
    await db.execute(sql`
      DO $$ BEGIN
        CREATE TYPE ${sql.raw(userRoleEnum.enumName)} AS ENUM (${sql.raw(
        userRoleEnum.enumValues.map(v => `'${v}'`).join(', ')
      )});
      EXCEPTION WHEN duplicate_object THEN null;
      END $$;
    `);

    await db.execute(sql`
      DO $$ BEGIN
        CREATE TYPE ${sql.raw(programStatusEnum.enumName)} AS ENUM (${sql.raw(
        programStatusEnum.enumValues.map(v => `'${v}'`).join(', ')
      )});
      EXCEPTION WHEN duplicate_object THEN null;
      END $$;
    `);

    await db.execute(sql`
      DO $$ BEGIN
        CREATE TYPE ${sql.raw(enrollmentStatusEnum.enumName)} AS ENUM (${sql.raw(
        enrollmentStatusEnum.enumValues.map(v => `'${v}'`).join(', ')
      )});
      EXCEPTION WHEN duplicate_object THEN null;
      END $$;
    `);

    // Create tables with IF NOT EXISTS
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ${sql.raw(userRoleEnum.enumName)} DEFAULT 'doctor',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        is_active BOOLEAN DEFAULT TRUE
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS clients (
        id SERIAL PRIMARY KEY,
        first_name VARCHAR(255) NOT NULL,
        last_name VARCHAR(255) NOT NULL,
        date_of_birth TIMESTAMP,
        gender VARCHAR(50),
        address TEXT,
        phone VARCHAR(20),
        email VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        created_by INTEGER REFERENCES users(id)
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS programs (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        status ${sql.raw(programStatusEnum.enumName)} DEFAULT 'active',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        created_by INTEGER REFERENCES users(id)
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS enrollments (
        id SERIAL PRIMARY KEY,
        client_id INTEGER REFERENCES clients(id),
        program_id INTEGER REFERENCES programs(id),
        status ${sql.raw(enrollmentStatusEnum.enumName)} DEFAULT 'active',
        enrolled_at TIMESTAMP DEFAULT NOW(),
        completed_at TIMESTAMP,
        notes TEXT,
        created_by INTEGER REFERENCES users(id)
      );
    `);

    console.log('======== All tables created successfully ========');
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