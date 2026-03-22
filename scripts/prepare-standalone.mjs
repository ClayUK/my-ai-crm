/**
 * Next.js `output: "standalone"` does not copy `public/` or `.next/static` into
 * `.next/standalone/`. Without them, CSS and assets 404 when using `node server.js`.
 * Run automatically via `postbuild` after `next build`.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const standalone = path.join(root, ".next", "standalone");
const staticSrc = path.join(root, ".next", "static");
const staticDest = path.join(standalone, ".next", "static");
const publicSrc = path.join(root, "public");
const publicDest = path.join(standalone, "public");

if (!fs.existsSync(standalone)) {
    console.warn(
        "[prepare-standalone] .next/standalone not found — skip (use after `next build`)."
    );
    process.exit(0);
}

fs.mkdirSync(path.join(standalone, ".next"), { recursive: true });

if (fs.existsSync(staticSrc)) {
    fs.rmSync(staticDest, { recursive: true, force: true });
    fs.cpSync(staticSrc, staticDest, { recursive: true });
    console.log("[prepare-standalone] Copied .next/static → .next/standalone/.next/static");
} else {
    console.warn("[prepare-standalone] Missing .next/static");
}

if (fs.existsSync(publicSrc)) {
    fs.rmSync(publicDest, { recursive: true, force: true });
    fs.cpSync(publicSrc, publicDest, { recursive: true });
    console.log("[prepare-standalone] Copied public → .next/standalone/public");
}
