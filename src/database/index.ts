import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schemas";
import { PgTransaction } from "drizzle-orm/pg-core";
import { NodePgQueryResultHKT } from "drizzle-orm/node-postgres"; // Or postgres-js / vercel-postgres depending on your driver
import { ExtractTablesWithRelations } from "drizzle-orm";

export type TxClient = PgTransaction<
  NodePgQueryResultHKT,
  typeof schema,
  ExtractTablesWithRelations<typeof schema>
>;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const database = drizzle(pool, { schema });

export function db(tx?: TxClient) {
  return tx ?? database;
}
