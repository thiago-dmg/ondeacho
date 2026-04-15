import { readFileSync } from "fs";
import { join } from "path";
import { Client } from "pg";

async function runSeed() {
  const client = new Client({
    host: process.env.DB_HOST ?? "localhost",
    port: Number(process.env.DB_PORT ?? 5432),
    user: process.env.DB_USER ?? "postgres",
    password: process.env.DB_PASSWORD ?? "postgres",
    database: process.env.DB_NAME ?? "ondeacho"
  });

  await client.connect();
  const sql = readFileSync(join(__dirname, "seed.sql"), "utf8");
  await client.query(sql);
  await client.end();
  // eslint-disable-next-line no-console
  console.log("Seed executado com sucesso.");
}

runSeed().catch((error) => {
  // eslint-disable-next-line no-console
  console.error("Falha ao executar seed:", error);
  process.exit(1);
});
