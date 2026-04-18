/**
 * Remove pastas de build do Next antes do npm run build.
 */
const fs = require("fs");
const path = require("path");
const os = require("os");

const adminDir = path.join(__dirname, "..");
const repoRoot = path.join(adminDir, "..", "..");

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
      /* fallback */
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
      }
    }
  }
}

const dirs = [];

if (process.env.ONDEACHO_ADMIN_DIST_DIR) {
  dirs.push([path.resolve(adminDir, process.env.ONDEACHO_ADMIN_DIST_DIR), "ONDEACHO_ADMIN_DIST_DIR"]);
} else if (process.platform === "win32") {
  dirs.push([path.join(repoRoot, ".admin-next-build"), ".admin-next-build na raiz do repo (Win)"]);
}

dirs.push([path.join(adminDir, ".next-build"), ".next-build (legado em apps/admin)"]);
dirs.push([path.join(adminDir, ".next"), ".next (legado)"]);
dirs.push([path.join(os.tmpdir(), "ondeacho-admin-next-build"), "temp legado"]);

for (const [full, label] of dirs) {
  rmWithRetries(full, label);
}
