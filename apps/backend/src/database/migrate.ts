import { readdirSync, readFileSync } from "fs";
import { join } from "path";
import { Client } from "pg";

async function runMigrations() {
  const client = new Client({
    host: process.env.DB_HOST ?? "localhost",
    port: Number(process.env.DB_PORT ?? 5432),
    user: process.env.DB_USER ?? "postgres",
    password: process.env.DB_PASSWORD ?? "postgres",
    database: process.env.DB_NAME ?? "ondeacho"
  });

  await client.connect();
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id serial PRIMARY KEY,
      filename varchar(255) NOT NULL UNIQUE,
      executed_at timestamp NOT NULL DEFAULT now()
    );
  `);

  const migrationsDir = join(__dirname, "migrations");
  const files = readdirSync(migrationsDir)
    .filter((file) => file.endsWith(".sql"))
    .sort();

  for (const file of files) {
    const applied = await client.query("SELECT 1 FROM schema_migrations WHERE filename = $1", [file]);
    if (applied.rowCount && applied.rowCount > 0) {
      continue;
    }

    const sql = readFileSync(join(migrationsDir, file), "utf8");
    await client.query("BEGIN");
    try {
      await client.query(sql);
      await client.query("INSERT INTO schema_migrations (filename) VALUES ($1)", [file]);
      await client.query("COMMIT");
      // eslint-disable-next-line no-console
      console.log(`Migration aplicada: ${file}`);
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    }
  }

  await client.end();
}

runMigrations().catch((error) => {
  // eslint-disable-next-line no-console
  console.error("Falha ao aplicar migrations:", error);
  process.exit(1);
});
