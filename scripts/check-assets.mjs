import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

const hash = bytes => createHash("sha256").update(bytes).digest("hex");
const mediaPath = /^\/(media|downloads|fonts)\/[^\s]+/;
const mediaExtension = /\.(?:png|jpe?g|gif|webp|svg|avif|bmp|ico|mp4|webm|pdf|woff2?|ttf|zip)(?:[?#].*)?$/i;
const remote = /^(?:https?:)?\/\//i;

export function mediaType(bytes) {
  const text = bytes.subarray(0, 512).toString("utf8");
  if (bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) return ["image/png", ".png"];
  if (bytes.subarray(0, 3).equals(Buffer.from([255, 216, 255]))) return ["image/jpeg", ".jpg", ".jpeg"];
  if (/^GIF8[79]a/.test(text)) return ["image/gif", ".gif"];
  if (text.startsWith("RIFF") && bytes.toString("ascii", 8, 12) === "WEBP") return ["image/webp", ".webp"];
  if (bytes.toString("ascii", 4, 8) === "ftyp") return /avif|avis/.test(bytes.toString("ascii", 8, 32)) ? ["image/avif", ".avif"] : ["video/mp4", ".mp4"];
  if (/^(?:\s*<\?xml[^>]*>\s*)?<svg[\s>]/.test(text)) return ["image/svg+xml", ".svg"];
  if (text.startsWith("%PDF-")) return ["application/pdf", ".pdf"];
  if (text.startsWith("wOF2")) return ["font/woff2", ".woff2"];
  if (text.startsWith("wOFF")) return ["font/woff", ".woff"];
  if (text.startsWith("BM")) return ["image/bmp", ".bmp"];
  if (bytes.subarray(0, 4).equals(Buffer.from([0, 0, 1, 0]))) return ["image/x-icon", ".ico"];
  return null;
}

function filesUnder(directory) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const filename = path.join(directory, entry.name);
    return entry.isDirectory() ? filesUnder(filename) : [filename];
  }).sort();
}

// Visit all literals, including imported data, fallback images, CSS backgrounds and fonts.
// Provenance URLs are deliberately not browser dependencies.
function referencesFrom(filename) {
  const text = readFileSync(filename, "utf8");
  const references = [];
  const add = value => { if (value) references.push({ value, filename }); };
  if (filename.endsWith(".css")) {
    for (const match of text.matchAll(/url\(\s*["']?([^\s)'";]+)["']?\s*\)/g)) add(match[1]);
  } else if (/\.[jt]sx?$/.test(filename)) {
    for (const literal of text.matchAll(/(["'`])((?:\\.|(?!\1)[^\\])*?)\1/g)) {
      const value = literal[2];
      const before = text.slice(Math.max(0, literal.index - 80), literal.index);
      const key = before.match(/(?:["']?)(\w+)["']?\s*[:=]\s*$/)?.[1];
      const object = key === "href" ? text.slice(text.lastIndexOf("{", literal.index), text.indexOf("}", literal.index) + 1) : "";
      const download = key === "href" && /["']?action["']?\s*:\s*["']download["']/.test(object);
      const tag = /\.[jt]sx$/.test(filename) && key === "src" ? text.slice(text.lastIndexOf("<", literal.index), literal.index) : "";
      const script = /^<script\b[^>]*$/i.test(tag);
      const mediaField = /^(src|poster|videoUrl)$/.test(key) || /(?:Video|Poster)$/.test(key);
      if (!script && (mediaField || download || mediaPath.test(value)
        || (key !== "sourceUrl" && remote.test(value) && mediaExtension.test(value)))) add(value);
      for (const match of value.matchAll(/url\(\s*["']?([^\s)'";]+)["']?\s*\)/g)) add(match[1]);
    }
  } else if (filename.endsWith(".html")) {
    // Decide whether an attribute carries media before validating its URL. A wrong
    // directory or relative path is still a dependency, not a reason to omit it.
    for (const element of text.matchAll(/<(img|video|audio|source|track|image|input|link|a)\b([^>]*?)>/gi)) {
      const tag = element[1].toLowerCase();
      const attributes = Object.fromEntries([...element[2].matchAll(/\b([\w-]+)\s*=\s*["']([^"']*)["']/g)].map(match => [match[1].toLowerCase(), match[2]]));
      if (/^(img|video|audio|source|track)$/.test(tag) || (tag === "input" && attributes.type === "image")) add(attributes.src);
      if (tag === "video") add(attributes.poster);
      if (tag === "image") add(attributes.href || attributes["xlink:href"]);
      const downloadable = tag === "a" && /\bdownload(?:\s|=|$)/i.test(element[2]);
      const mediaPreload = tag === "link" && /^(image|video|audio|font)$/.test(attributes.as);
      const linkedMedia = tag === "a" && mediaExtension.test(attributes.href || "");
      if (downloadable || linkedMedia || mediaPreload || mediaPath.test(attributes.href || "")) add(attributes.href);
      for (const srcset of [attributes.srcset, attributes.imagesrcset].filter(Boolean))
        for (const candidate of srcset.split(",")) add(candidate.trim().split(/\s+/)[0]);
    }
    for (const match of text.matchAll(/url\(\s*["']?([^\s)'";]+)["']?\s*\)/g)) add(match[1]);
  }
  return references;
}

export function auditAssets({ publicDir = "public", contentDir = "content", sourceRoots = ["app", "components"], manifestPath = "source-cache/manifest.json", output, captureIntegrity = false } = {}) {
  const errors = [];
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  const byBasename = new Map(manifest.assets.filter(asset => asset.localPath).map(asset => [path.basename(asset.localPath), asset]));
  const sourceHashes = new Set(manifest.assets.filter(asset => asset.status >= 200 && asset.status < 300).map(asset => asset.sha256));
  for (const asset of captureIntegrity ? manifest.assets.filter(asset => asset.status >= 200 && asset.status < 300) : []) {
    const cached = asset.localPath && path.join(path.dirname(manifestPath), asset.localPath);
    if (!cached || !existsSync(cached) || hash(readFileSync(cached)) !== asset.sha256) errors.push(`source cache checksum mismatch: ${asset.sourceUrl}`);
  }
  // Default validation uses committed shipping hashes, not ignored capture bytes.
  const shippedPath = path.join(contentDir, "shipped-assets.json");
  if (existsSync(shippedPath)) {
    const shipped = JSON.parse(readFileSync(shippedPath, "utf8"));
    for (const [file, digest] of Object.entries(shipped)) {
      const filename = path.join(publicDir, file);
      if (!existsSync(filename) || hash(readFileSync(filename)) !== digest) errors.push(`shipped checksum mismatch: ${file}`);
    }
    for (const file of ["media", "downloads", "fonts"].flatMap(dir => filesUnder(path.join(publicDir, dir)))) {
      const relative = `/${path.relative(publicDir, file).split(path.sep).join("/")}`;
      if (!shipped[relative]) errors.push(`unregistered shipped asset: ${relative}`);
    }
  } else if (path.resolve(contentDir) === path.resolve("content")) errors.push("missing committed shipped-assets.json");
  const references = [...new Set([...[contentDir, ...sourceRoots].flatMap(filesUnder),
    ...(output ? filesUnder(output).filter(file => /\.(html|css)$/.test(file)) : [])])]
    .filter(file => /\.(?:[jt]sx?|css|html)$/.test(file)).flatMap(referencesFrom);
  const requiredPaths = [...new Set(references.map(reference => reference.value))].sort();
  const files = [];
  for (const value of requiredPaths) {
    if (remote.test(value)) { errors.push(`remote dependency: ${value}`); continue; }
    if (!mediaPath.test(value)) { errors.push(`non-local media path: ${value}`); continue; }
    const clean = decodeURIComponent(value.split(/[?#]/)[0]);
    if (clean.includes("\\") || clean.split("/").includes("..")) { errors.push(`unsafe media path: ${value}`); continue; }
    const filename = path.join(publicDir, clean);
    if (!existsSync(filename) || !statSync(filename).isFile()) { errors.push(`missing asset: ${value}`); continue; }
    const bytes = readFileSync(filename);
    if (!bytes.length) { errors.push(`empty asset: ${value}`); continue; }
    const type = mediaType(bytes);
    if (!type) errors.push(`invalid media content: ${value}`);
    else if (!type.slice(1).includes(path.extname(clean).toLowerCase())) errors.push(`incorrect extension for ${type[0]}: ${value}`);
    const sha256 = hash(bytes);
    const asset = byBasename.get(path.basename(clean));
    if (asset && asset.sha256 !== sha256) errors.push(`source checksum mismatch: ${value}`);
    if (asset && !(asset.status >= 200 && asset.status < 300)) errors.push(`unavailable source asset is referenced: ${value}`);
    if (output) {
      const exported = path.join(output, clean);
      if (!existsSync(exported) || hash(readFileSync(exported)) !== sha256) errors.push(`missing or changed exported asset: ${value}`);
    }
    files.push({ path: value, bytes: bytes.length, sha256, contentType: type?.[0], capturedSource: sourceHashes.has(sha256) });
  }
  // Audit the deployed media collection too: unused copied chrome and duplicates must not ship.
  const publishedMedia = ["media", "downloads"].flatMap(directory => filesUnder(path.join(publicDir, directory)));
  const hashes = new Map();
  for (const filename of publishedMedia) {
    const relative = `/${path.relative(publicDir, filename).split(path.sep).join("/")}`;
    const sha256 = hash(readFileSync(filename));
    hashes.set(sha256, [...(hashes.get(sha256) || []), relative]);
    if (!requiredPaths.includes(relative)) errors.push(`unused published media: ${relative}`);
  }
  for (const group of hashes.values()) if (group.length > 1) errors.push(`duplicate byte-identical assets: ${group.join(", ")}`);
  return { errors, requiredPaths, files, sourceAssets: manifest.assets.length,
    unavailableSourceAssets: manifest.assets.filter(asset => !(asset.status >= 200 && asset.status < 300)).map(asset => ({ sourceUrl: asset.sourceUrl, status: asset.status })),
    totalBytes: files.reduce((total, file) => total + file.bytes, 0),
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const argument = (name, fallback) => process.argv.includes(name) ? process.argv[process.argv.indexOf(name) + 1] : fallback;
  try {
    const report = auditAssets({ publicDir: argument("--public", "public"), contentDir: argument("--content", "content"),
      sourceRoots: argument("--source-roots", "app,components").split(","), manifestPath: argument("--manifest", "source-cache/manifest.json"), output: argument("--output", undefined), captureIntegrity: process.argv.includes("--capture-integrity") });
    if (process.argv.includes("--json")) console.log(JSON.stringify(report, null, 2));
    else if (report.errors.length) console.error(`Asset audit failed:\n- ${report.errors.join("\n- ")}`);
    else console.log(`Valid assets: ${report.files.length} local files, ${report.totalBytes} bytes; ${report.sourceAssets} source assets audited, ${report.unavailableSourceAssets.length} unavailable source references excluded; zero errors.`);
    process.exitCode = report.errors.length ? 1 : 0;
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
