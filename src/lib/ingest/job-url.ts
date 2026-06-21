import { lookup } from "node:dns/promises";

// Server-side ingestion of a job posting from a URL. The goal is "good enough"
// text — the LLM job-extraction stage already turns messy posting text into
// structured fields, so we only need clean-ish readable text, not perfect
// article extraction. Works on static / server-rendered career pages
// (Greenhouse, Lever, Ashby, Workable, most company sites). JS-walled or
// auth-gated boards (LinkedIn, Indeed) won't yield text — the caller falls
// back to manual paste.

export const MAX_TEXT = 16000; // matches the analyze route's per-field cap
const MAX_BYTES = 3_000_000; // 3 MB ceiling on the fetched body
const FETCH_TIMEOUT_MS = 12_000; // spans connect + headers + body read
const MAX_REDIRECTS = 5;
const MIN_USEFUL_TEXT = 200; // below this we assume extraction failed
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/124.0 Safari/537.36";

export class JobFetchError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.name = "JobFetchError";
    this.status = status;
  }
}

export interface FetchedJob {
  text: string;
  title?: string;
  company?: string;
  source: string; // hostname, for display
}

/* ----------------------------------------------------------- SSRF guards */

function ipv4ToInt(ip: string): number | null {
  const parts = ip.split(".");
  if (parts.length !== 4) return null;
  let n = 0;
  for (const p of parts) {
    if (!/^\d{1,3}$/.test(p)) return null;
    const v = Number(p);
    if (v > 255) return null;
    n = n * 256 + v;
  }
  return n >>> 0;
}

function isPrivateIPv4(ip: string): boolean {
  const n = ipv4ToInt(ip);
  if (n === null) return true; // unparseable → treat as unsafe
  const inRange = (base: string, bits: number) => {
    const b = ipv4ToInt(base)!;
    const mask = bits === 0 ? 0 : (0xffffffff << (32 - bits)) >>> 0;
    return (n & mask) === (b & mask);
  };
  return (
    inRange("0.0.0.0", 8) || // "this" network
    inRange("10.0.0.0", 8) || // private
    inRange("100.64.0.0", 10) || // CGNAT
    inRange("127.0.0.0", 8) || // loopback
    inRange("169.254.0.0", 16) || // link-local (incl. 169.254.169.254 metadata)
    inRange("172.16.0.0", 12) || // private
    inRange("192.0.0.0", 24) || // IETF protocol assignments
    inRange("192.168.0.0", 16) || // private
    inRange("198.18.0.0", 15) || // benchmarking
    inRange("224.0.0.0", 4) || // multicast
    inRange("240.0.0.0", 4) // reserved
  );
}

// Pull the embedded IPv4 out of a v4-mapped / v4-compatible IPv6 address, in
// either textual form. The WHATWG URL parser normalizes `::ffff:127.0.0.1` to
// the hextet form `::ffff:7f00:1`, so we must handle BOTH or these literals
// slip past the private-range check entirely.
function embeddedV4(a: string): string | null {
  // dotted: ::ffff:1.2.3.4  or  ::1.2.3.4
  let m = a.match(/^::(?:ffff:)?(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})$/);
  if (m) return m[1];
  // hextet (what new URL() emits): ::ffff:HHHH:HHHH
  m = a.match(/^::ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/);
  if (m) {
    const hi = parseInt(m[1], 16);
    const lo = parseInt(m[2], 16);
    return `${(hi >> 8) & 255}.${hi & 255}.${(lo >> 8) & 255}.${lo & 255}`;
  }
  return null;
}

function isPrivateIPv6(ip: string): boolean {
  const a = ip.toLowerCase().split("%")[0]; // strip zone id
  if (a === "::1" || a === "::") return true;
  const v4 = embeddedV4(a);
  if (v4) return isPrivateIPv4(v4); // includes ::ffff:0:0/96 → 0.0.0.0/8
  const firstHextet = a.split(":")[0] || "";
  if (firstHextet) {
    const h = parseInt(firstHextet, 16);
    if (!Number.isNaN(h)) {
      if ((h & 0xfe00) === 0xfc00) return true; // fc00::/7 unique-local
      if ((h & 0xffc0) === 0xfe80) return true; // fe80::/10 link-local
    }
  }
  return false;
}

function isPrivateAddress(addr: string, family: number): boolean {
  return family === 6 ? isPrivateIPv6(addr) : isPrivateIPv4(addr);
}

// Validate the URL and resolve its hostname, rejecting anything that points at
// a private / loopback / link-local / metadata address. Returns the parsed URL.
// Exported so the SSRF guard can be unit-tested directly.
export async function assertSafeUrl(raw: string): Promise<URL> {
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    throw new JobFetchError("That doesn't look like a valid URL.");
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new JobFetchError("Only http(s) URLs are supported.");
  }
  if (url.username || url.password) {
    throw new JobFetchError("URLs with embedded credentials aren't allowed.");
  }
  const host = url.hostname.replace(/^\[|\]$/g, ""); // unwrap [::1] form
  if (host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local")) {
    throw new JobFetchError("That host isn't allowed.");
  }

  // If the host is an IP literal, check it directly; otherwise resolve DNS and
  // check every returned address (defends against DNS-rebinding to internal IPs).
  const literalFamily = url.hostname.includes(":") ? 6 : ipv4ToInt(host) !== null ? 4 : 0;
  if (literalFamily) {
    if (isPrivateAddress(host, literalFamily)) throw new JobFetchError("That host isn't allowed.");
    return url;
  }
  let resolved: { address: string; family: number }[];
  try {
    resolved = await lookup(host, { all: true });
  } catch {
    throw new JobFetchError("Couldn't resolve that host.");
  }
  if (resolved.length === 0) throw new JobFetchError("Couldn't resolve that host.");
  for (const r of resolved) {
    if (isPrivateAddress(r.address, r.family)) throw new JobFetchError("That host isn't allowed.");
  }
  return url;
}

/* --------------------------------------------------------------- fetching */

// Read the response body with a hard byte cap so a giant page can't exhaust
// memory. Decodes as UTF-8 (good enough for the charsets job boards use).
async function readCapped(res: Response): Promise<string> {
  const reader = res.body?.getReader();
  if (!reader) return "";
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    if (!value || value.byteLength === 0) continue;
    const remaining = MAX_BYTES - total;
    if (value.byteLength >= remaining) {
      chunks.push(value.subarray(0, remaining)); // keep the usable prefix of the over-cap chunk
      total = MAX_BYTES;
      await reader.cancel().catch(() => {});
      break;
    }
    chunks.push(value);
    total += value.byteLength;
  }
  const buf = new Uint8Array(total); // sized to bytes actually kept — no trailing NULs
  let offset = 0;
  for (const c of chunks) {
    buf.set(c, offset);
    offset += c.byteLength;
  }
  return new TextDecoder("utf-8").decode(buf);
}

/* ---------------------------------------------------------- HTML → text */

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", mdash: "—",
  ndash: "–", hellip: "…", rsquo: "’", lsquo: "‘", rdquo: "”", ldquo: "“",
  middot: "·", bull: "•", copy: "©", reg: "®", trade: "™", deg: "°",
};

function decodeEntities(s: string): string {
  return s.replace(/&(#x?[0-9a-f]+|[a-z][a-z0-9]*);/gi, (m, body) => {
    if (body[0] === "#") {
      const code = body[1] === "x" || body[1] === "X" ? parseInt(body.slice(2), 16) : parseInt(body.slice(1), 10);
      return Number.isFinite(code) && code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : m;
    }
    const named = NAMED_ENTITIES[body.toLowerCase()];
    return named ?? m;
  });
}

// Strip tags to readable text. Drops non-content elements, turns block-level
// boundaries into newlines, then collapses whitespace.
export function htmlToText(html: string): string {
  let s = html
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<(script|style|noscript|svg|template|head|nav|footer|form|iframe)\b[\s\S]*?<\/\1>/gi, " ");
  // Prefer the main content region if the page marks one.
  const main = s.match(/<(main|article)\b[^>]*>([\s\S]*?)<\/\1>/i);
  if (main && main[2].length > 400) s = main[2];
  s = s
    .replace(/<\/(p|div|section|li|tr|h[1-6]|ul|ol|table|header|article|main)>/gi, "\n")
    .replace(/<(br|hr)\s*\/?>/gi, "\n")
    .replace(/<li\b[^>]*>/gi, "• ")
    .replace(/<[^>]+>/g, " ");
  s = decodeEntities(s);
  return s
    .replace(/[ \t\f\v]+/g, " ")
    .replace(/ *\n */g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

interface JsonLdJob {
  title?: string;
  description?: string;
  company?: string;
  location?: string;
}

function flattenLocation(loc: unknown): string | undefined {
  if (!loc) return undefined;
  const arr = Array.isArray(loc) ? loc : [loc];
  const parts: string[] = [];
  for (const l of arr) {
    const addr = (l as { address?: unknown })?.address ?? l;
    if (typeof addr === "string") parts.push(addr);
    else if (addr && typeof addr === "object") {
      const a = addr as Record<string, string>;
      parts.push([a.addressLocality, a.addressRegion, a.addressCountry].filter(Boolean).join(", "));
    }
  }
  const joined = parts.filter(Boolean).join(" · ");
  return joined || undefined;
}

// Many boards embed a schema.org JobPosting in <script type="application/ld+json">.
// That's the cleanest source when present.
export function extractJsonLdJob(html: string): JsonLdJob | null {
  const blocks = html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
  for (const b of blocks) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(b[1].trim());
    } catch {
      continue;
    }
    const candidates: unknown[] = [];
    const visit = (node: unknown) => {
      if (Array.isArray(node)) node.forEach(visit);
      else if (node && typeof node === "object") {
        candidates.push(node);
        const graph = (node as { "@graph"?: unknown })["@graph"];
        if (graph) visit(graph);
      }
    };
    visit(parsed);
    for (const c of candidates) {
      const obj = c as Record<string, unknown>;
      const type = obj["@type"];
      const isJob = type === "JobPosting" || (Array.isArray(type) && type.includes("JobPosting"));
      if (!isJob || typeof obj.description !== "string") continue;
      const org = obj.hiringOrganization as { name?: string } | string | undefined;
      return {
        title: typeof obj.title === "string" ? obj.title : undefined,
        description: htmlToText(obj.description),
        company: typeof org === "string" ? org : org?.name,
        location: flattenLocation(obj.jobLocation),
      };
    }
  }
  return null;
}

/* ---------------------------------------------------------------- public */

// Fetch with redirects followed MANUALLY so every hop is re-validated against
// the SSRF guard — `redirect: "follow"` would let a public URL bounce to an
// internal/metadata address with no second check. One AbortController+timer
// spans the whole operation (every hop AND the body read) so a slow-trickle
// body can't outlive the deadline.
async function safeFetch(start: URL, signal: AbortSignal): Promise<Response> {
  let url = start;
  for (let hop = 0; ; hop++) {
    let res: Response;
    try {
      res = await fetch(url, {
        redirect: "manual",
        signal,
        headers: { "User-Agent": UA, Accept: "text/html,application/xhtml+xml,text/plain;q=0.9,*/*;q=0.5" },
      });
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        throw new JobFetchError("That page took too long to load. Paste the description instead.", 504);
      }
      throw new JobFetchError("Couldn't reach that URL. Paste the description instead.", 502);
    }

    const loc = res.headers.get("location");
    if (res.status >= 300 && res.status < 400 && loc) {
      await res.body?.cancel().catch(() => {});
      if (hop >= MAX_REDIRECTS) throw new JobFetchError("That URL redirects too many times.", 502);
      let next: URL;
      try {
        next = new URL(loc, url);
      } catch {
        throw new JobFetchError("That URL has an invalid redirect.", 502);
      }
      url = await assertSafeUrl(next.href); // re-resolve DNS + re-check every hop
      continue;
    }
    return res;
  }
}

export async function fetchJobPosting(rawUrl: string): Promise<FetchedJob> {
  const start = await assertSafeUrl(rawUrl);

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await safeFetch(start, ctrl.signal);

    if (!res.ok) {
      const hint =
        res.status === 403 || res.status === 401
          ? " (the site blocks automated access — paste the description instead)"
          : "";
      throw new JobFetchError(`The page returned ${res.status}${hint}.`, 502);
    }

    const ctype = (res.headers.get("content-type") || "").toLowerCase();
    if (!ctype.includes("text/html") && !ctype.includes("text/plain") && !ctype.includes("application/xhtml")) {
      throw new JobFetchError("That link isn't a web page. Paste the description instead.");
    }

    let body: string;
    try {
      body = await readCapped(res);
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        throw new JobFetchError("That page took too long to load. Paste the description instead.", 504);
      }
      throw new JobFetchError("Couldn't read that page. Paste the description instead.", 502);
    }

    return buildJob(body, res.url || start.href, start.hostname);
  } finally {
    clearTimeout(timer);
  }
}

function buildJob(body: string, finalUrl: string, fallbackHost: string): FetchedJob {
  const titleTag = body.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i);
  const pageTitle = titleTag ? decodeEntities(titleTag[1]).replace(/\s+/g, " ").trim() : undefined;

  const ld = extractJsonLdJob(body);
  let text: string;
  let title: string | undefined;
  let company: string | undefined;

  if (ld && ld.description && ld.description.length >= MIN_USEFUL_TEXT) {
    title = ld.title || pageTitle;
    company = ld.company;
    const header = [ld.title, ld.company, ld.location].filter(Boolean).join(" — ");
    text = (header ? header + "\n\n" : "") + ld.description;
  } else {
    text = htmlToText(body);
    title = pageTitle;
  }

  text = text.slice(0, MAX_TEXT).trim();
  if (text.length < MIN_USEFUL_TEXT) {
    throw new JobFetchError(
      "Couldn't pull the job text from that page (it may load content with JavaScript or require login). Paste the description instead.",
      422,
    );
  }

  let source = fallbackHost;
  try {
    source = new URL(finalUrl).hostname;
  } catch {
    /* keep fallback */
  }
  return { text, title, company, source: source.replace(/^www\./, "") };
}
