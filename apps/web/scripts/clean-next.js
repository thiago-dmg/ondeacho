/**
 * Remove pastas de build do Next (web) antes de `npm run build`.
 */
const fs = require("fs");
const path = require("path");
const os = require("os");

const webDir = path.join(__dirname, "..");
const repoRoot = path.join(webDir, "..", "..");

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
      console.log(`[web] Removido: ${label}`);
      return;
    } catch (err) {
      if (err && err.code === "ENOENT") return;
      if (i < 4) {
        // eslint-disable-next-line no-console
        console.warn(`[web] Tentativa ${i + 1}/5 ao remover ${label}: ${err.message}`);
        sleepSync(400 * (i + 1));
      } else {
        // eslint-disable-next-line no-console
        console.warn(`[web] Não foi possível remover ${label}: ${err.message}`);
      }
    }
  }
}

const dirs = [];

if (process.env.ONDEACHO_WEB_DIST_DIR) {
  dirs.push([path.resolve(webDir, process.env.ONDEACHO_WEB_DIST_DIR), "ONDEACHO_WEB_DIST_DIR"]);
} else if (process.platform === "win32") {
  dirs.push([path.join(repoRoot, ".web-next-build"), ".web-next-build na raiz do repo (Win)"]);
}

dirs.push([path.join(webDir, ".next-build"), ".next-build (apps/web)"]);
dirs.push([path.join(webDir, ".next"), ".next (legado)"]);
dirs.push([path.join(os.tmpdir(), "ondeacho-web-next-build"), "temp legado"]);

for (const [full, label] of dirs) {
  rmWithRetries(full, label);
}
