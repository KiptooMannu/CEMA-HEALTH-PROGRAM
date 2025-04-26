import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Client } from "pg";
import dotenv from "dotenv";
import {
  userRoleEnum,
  programStatusEnum,
  enrollmentStatusEnum,
} from "./schema";

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

    // Drop tables in reverse order of dependencies
    await db.execute(sql`
      DROP TABLE IF EXISTS enrollments CASCADE;
    `);

    await db.execute(sql`
      DROP TABLE IF EXISTS auth CASCADE;
    `);

    await db.execute(sql`
      DROP TABLE IF EXISTS programs CASCADE;
    `);

    await db.execute(sql`
      DROP TABLE IF EXISTS clients CASCADE;
    `);

    await db.execute(sql`
      DROP TABLE IF EXISTS users CASCADE;
    `);

    // Recreate tables with all new columns
    await db.execute(sql`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ${sql.raw(userRoleEnum.enumName)} DEFAULT 'doctor',
        first_name VARCHAR(255) NOT NULL,
        last_name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(20),
        date_of_birth TIMESTAMP,
        gender VARCHAR(50),
        address TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        is_active BOOLEAN DEFAULT TRUE
      );
    `);

    // Add the auth table after users since it references users
    await db.execute(sql`
      CREATE TABLE auth (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        password_hash VARCHAR(255) NOT NULL,
        salt VARCHAR(255) NOT NULL,
        refresh_token TEXT,
        token_expires_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await db.execute(sql`
      CREATE TABLE clients (
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
      CREATE TABLE programs (
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
      CREATE TABLE enrollments (
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

    // Add indexes for better performance
    await db.execute(sql`
      CREATE INDEX idx_auth_user_id ON auth(user_id);
    `);

    await db.execute(sql`
      CREATE INDEX idx_clients_created_by ON clients(created_by);
    `);

    await db.execute(sql`
      CREATE INDEX idx_programs_created_by ON programs(created_by);
    `);

    await db.execute(sql`
      CREATE INDEX idx_enrollments_created_by ON enrollments(created_by);
    `);

    console.log('======== All tables recreated with new columns successfully ========');
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