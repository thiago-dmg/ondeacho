/**
 * Remove a pasta de build do Next antes do `next build`.
 * Tenta algumas vezes (Windows às vezes libera o lock após um atraso).
 * Feche `next dev` / preview antes do build.
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");

function sleepSync(ms) {
  try {
    if (process.platform === "win32") {
      require("child_process").execSync(`powershell -NoProfile -Command "Start-Sleep -Milliseconds ${ms}"`, {
        stdio: "ignore"
      });
    } else {
      require("child_process").execSync(`sleep ${Math.ceil(ms / 1000)}`, { stdio: "ignore" });
    }
  } catch {
    const end = Date.now() + ms;
    while (Date.now() < end) {
      /* espera grosseira se powershell/sleep falhar */
    }
  }
}

function rmWithRetries(dir, label) {
  for (let i = 0; i < 5; i += 1) {
    try {
      fs.rmSync(dir, { recursive: true, force: true });
      // eslint-disable-next-line no-console
      console.log(`[admin] Removido: ${label}`);
      return;
    } catch (err) {
      if (err && err.code === "ENOENT") return;
      if (i < 4) {
        // eslint-disable-next-line no-console
        console.warn(`[admin] Tentativa ${i + 1}/5 ao remover ${label}: ${err.message}`);
        sleepSync(400 * (i + 1));
      } else {
        // eslint-disable-next-line no-console
        console.warn(`[admin] Não foi possível remover ${label}: ${err.message}`);
        // eslint-disable-next-line no-console
        console.warn("[admin] Feche o 'npm run dev', o editor na pasta de build e tente de novo.");
      }
    }
  }
}

const dirs = [
  [path.join(root, ".next-build"), ".next-build"],
  [path.join(root, ".next"), ".next (legado)"]
];

for (const [full, label] of dirs) {
  rmWithRetries(full, label);
}
