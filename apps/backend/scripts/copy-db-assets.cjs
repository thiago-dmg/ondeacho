/**
 * Copia SQLs para dist/ — migrate.js e seed.js leem ficheiros ao lado em runtime.
 */
const fs = require("fs");
const path = require("path");

const backendRoot = path.join(__dirname, "..");
const migrationsSrc = path.join(backendRoot, "src", "database", "migrations");
const migrationsDest = path.join(backendRoot, "dist", "database", "migrations");
const seedSqlSrc = path.join(backendRoot, "src", "database", "seed.sql");
const seedSqlDest = path.join(backendRoot, "dist", "database", "seed.sql");

fs.mkdirSync(migrationsDest, { recursive: true });
for (const f of fs.readdirSync(migrationsSrc)) {
  if (f.endsWith(".sql")) {
    fs.copyFileSync(path.join(migrationsSrc, f), path.join(migrationsDest, f));
  }
}
fs.copyFileSync(seedSqlSrc, seedSqlDest);
