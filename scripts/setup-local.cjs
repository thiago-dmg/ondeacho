/**
 * Prepara dev local: .env do backend, Postgres (Docker), migrações e seed.
 * Uso: node scripts/setup-local.cjs
 */
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const root = path.join(__dirname, "..");
const backendEnv = path.join(root, "apps", "backend", ".env");
const backendExample = path.join(root, "apps", "backend", ".env.example");

if (!fs.existsSync(backendEnv) && fs.existsSync(backendExample)) {
  fs.copyFileSync(backendExample, backendEnv);
  // eslint-disable-next-line no-console
  console.log("[OndeAcho] Criado apps/backend/.env a partir de .env.example");
}

function run(cmd) {
  // eslint-disable-next-line no-console
  console.log(`\n> ${cmd}\n`);
  execSync(cmd, { stdio: "inherit", cwd: root });
}

function sleepSync(seconds) {
  if (process.platform === "win32") {
    try {
      execSync(`powershell -NoProfile -Command "Start-Sleep -Seconds ${seconds}"`, { stdio: "ignore" });
    } catch {
      /* ignore */
    }
  } else {
    try {
      execSync(`sleep ${seconds}`, { stdio: "ignore" });
    } catch {
      /* ignore */
    }
  }
}

try {
  run("docker compose up -d db");
} catch {
  // eslint-disable-next-line no-console
  console.warn(
    "[OndeAcho] Docker não subiu o serviço db (Postgres local?). Tentando migrar mesmo assim…\n"
  );
}

// eslint-disable-next-line no-console
console.log("[OndeAcho] Aguardando Postgres ficar pronto…");
sleepSync(6);
let lastErr;
for (let i = 0; i < 5; i++) {
  try {
    run("npm run db:migrate:dev --workspace apps/backend");
    run("npm run db:seed:dev --workspace apps/backend");
    // eslint-disable-next-line no-console
    console.log(
      "\n[OndeAcho] Banco pronto. Contas demo: admin@ondeacho.app / Admin@123 (admin)\n" +
        "  npm run dev:backend   → API http://127.0.0.1:3000\n" +
        "  npm run dev:admin     → http://localhost:3001/login\n"
    );
    process.exit(0);
  } catch (e) {
    lastErr = e;
    // eslint-disable-next-line no-console
    console.warn(`[OndeAcho] Tentativa ${i + 1}/5 falhou; aguardando…`);
    sleepSync(4);
  }
}
// eslint-disable-next-line no-console
console.error("[OndeAcho] Migração/seed falhou após várias tentativas:", lastErr?.message ?? lastErr);
process.exit(1);
