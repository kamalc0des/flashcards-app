import sanitizeHtml from "sanitize-html";

// Allowed emails — single source of truth (also used in auth.ts)
export const ALLOWED_EMAILS = [
  "kamalcodes.pro@gmail.com",
  "najat.ibrahim1997@gmail.com",
];

// Strip all HTML — for plain text fields (name, description, email)
export function sanitizeText(input: unknown): string {
  if (typeof input !== "string") return "";
  return sanitizeHtml(input, { allowedTags: [], allowedAttributes: {} }).trim();
}

// Allow safe HTML subset — for TipTap-generated HTML during import
export function sanitizeRichHtml(input: string): string {
  return sanitizeHtml(input, {
    allowedTags: [
      "p", "br", "strong", "em", "s", "code", "pre",
      "ul", "ol", "li", "blockquote", "h1", "h2", "h3",
      "span", "mark",
    ],
    allowedAttributes: {
      span: ["style"],
      mark: ["style"],
      code: ["class"],
      pre: ["class"],
    },
    allowedStyles: {
      span: { color: [/.*/] },
      mark: { "background-color": [/.*/] },
    },
  });
}

// Primitive type check for TipTap JSON — prevents deeply nested payloads
export function isValidTiptapJson(value: unknown): boolean {
  if (typeof value !== "object" || value === null) return false;
  const obj = value as Record<string, unknown>;
  if (obj.type !== "doc") return false;
  if (!Array.isArray(obj.content)) return false;
  // Reject suspiciously large payloads
  const json = JSON.stringify(value);
  if (json.length > 50_000) return false;
  return true;
}

// Simple in-memory rate limiter (per IP, resets on server restart)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(ip: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= limit) return false;
  entry.count++;
  return true;
}

export function getIp(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}
