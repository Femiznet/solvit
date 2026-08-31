import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/database/schemas', // Path to your schema file
  out: './drizzle',             // Where migrations will be saved
  dialect: 'postgresql',        // Tells drizzle to use Postgres
  dbCredentials: {
    url: process.env.DATABASE_URL!, // Your Postgres connection string
  },
});
