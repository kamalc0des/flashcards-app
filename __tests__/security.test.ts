import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  sanitizeText,
  sanitizeRichHtml,
  isValidTiptapJson,
  checkRateLimit,
  getIp,
  ALLOWED_EMAILS,
} from "@/lib/security";

describe("ALLOWED_EMAILS", () => {
  it("contains the expected emails", () => {
    expect(ALLOWED_EMAILS).toContain("kamalcodes.pro@gmail.com");
    expect(ALLOWED_EMAILS).toContain("najat.ibrahim1997@gmail.com");
  });
});

describe("sanitizeText", () => {
  it("strips all HTML tags", () => {
    expect(sanitizeText("<script>alert(1)</script>hello")).toBe("hello");
  });

  it("strips event handler attributes", () => {
    expect(sanitizeText('<p onclick="evil()">text</p>')).toBe("text");
  });

  it("returns empty string for non-string input", () => {
    expect(sanitizeText(null)).toBe("");
    expect(sanitizeText(undefined)).toBe("");
    expect(sanitizeText(42)).toBe("");
    expect(sanitizeText({})).toBe("");
  });

  it("trims whitespace", () => {
    expect(sanitizeText("  hello  ")).toBe("hello");
  });

  it("returns plain text unchanged", () => {
    expect(sanitizeText("hello world")).toBe("hello world");
  });
});

describe("sanitizeRichHtml", () => {
  it("allows safe tags", () => {
    const input = "<p><strong>bold</strong> and <em>italic</em></p>";
    expect(sanitizeRichHtml(input)).toBe(input);
  });

  it("strips script tags", () => {
    const result = sanitizeRichHtml('<script>alert("xss")</script><p>safe</p>');
    expect(result).not.toContain("<script>");
    expect(result).toContain("<p>safe</p>");
  });

  it("strips onclick and other event handlers", () => {
    const result = sanitizeRichHtml('<p onclick="evil()">text</p>');
    expect(result).not.toContain("onclick");
  });

  it("allows span with color style", () => {
    const result = sanitizeRichHtml('<span style="color: red;">text</span>');
    // sanitize-html normalizes CSS whitespace (color:red vs color: red)
    expect(result).toContain("color");
    expect(result).toContain("red");
    expect(result).toContain("<span");
    expect(result).toContain("text</span>");
  });

  it("allows mark with background-color style", () => {
    const result = sanitizeRichHtml('<mark style="background-color: yellow;">text</mark>');
    expect(result).toContain("background-color");
    expect(result).toContain("yellow");
    expect(result).toContain("<mark");
    expect(result).toContain("text</mark>");
  });

  it("allows code with class", () => {
    const input = '<code class="language-js">const x = 1;</code>';
    expect(sanitizeRichHtml(input)).toBe(input);
  });

  it("strips img tags", () => {
    const result = sanitizeRichHtml('<img src="x" onerror="alert(1)"><p>ok</p>');
    expect(result).not.toContain("<img");
  });

  it("strips iframe tags", () => {
    const result = sanitizeRichHtml('<iframe src="evil.com"></iframe><p>ok</p>');
    expect(result).not.toContain("<iframe");
  });
});

describe("isValidTiptapJson", () => {
  it("accepts a valid TipTap doc", () => {
    expect(
      isValidTiptapJson({
        type: "doc",
        content: [{ type: "paragraph", content: [{ type: "text", text: "hello" }] }],
      })
    ).toBe(true);
  });

  it("rejects null", () => {
    expect(isValidTiptapJson(null)).toBe(false);
  });

  it("rejects non-object", () => {
    expect(isValidTiptapJson("string")).toBe(false);
    expect(isValidTiptapJson(42)).toBe(false);
    expect(isValidTiptapJson([])).toBe(false);
  });

  it("rejects wrong type value", () => {
    expect(isValidTiptapJson({ type: "paragraph", content: [] })).toBe(false);
  });

  it("rejects missing content array", () => {
    expect(isValidTiptapJson({ type: "doc" })).toBe(false);
    expect(isValidTiptapJson({ type: "doc", content: "not an array" })).toBe(false);
  });

  it("accepts empty content array", () => {
    expect(isValidTiptapJson({ type: "doc", content: [] })).toBe(true);
  });

  it("rejects payloads over 50KB", () => {
    const bigContent = Array.from({ length: 2000 }, (_, i) => ({
      type: "paragraph",
      content: [{ type: "text", text: "x".repeat(30) + i }],
    }));
    expect(isValidTiptapJson({ type: "doc", content: bigContent })).toBe(false);
  });
});

describe("checkRateLimit", () => {
  // Use unique IPs per test to avoid state leaking between tests
  let testIp: string;
  let counter = 0;

  beforeEach(() => {
    testIp = `192.168.1.${counter++}`;
  });

  it("allows first request", () => {
    expect(checkRateLimit(testIp, 5, 60_000)).toBe(true);
  });

  it("allows requests up to the limit", () => {
    for (let i = 0; i < 5; i++) {
      expect(checkRateLimit(testIp, 5, 60_000)).toBe(true);
    }
  });

  it("blocks once limit is exceeded", () => {
    for (let i = 0; i < 5; i++) checkRateLimit(testIp, 5, 60_000);
    expect(checkRateLimit(testIp, 5, 60_000)).toBe(false);
  });

  it("different IPs have independent limits", () => {
    const ip1 = `10.0.0.${counter++}`;
    const ip2 = `10.0.0.${counter++}`;
    for (let i = 0; i < 5; i++) checkRateLimit(ip1, 5, 60_000);
    expect(checkRateLimit(ip1, 5, 60_000)).toBe(false);
    expect(checkRateLimit(ip2, 5, 60_000)).toBe(true);
  });

  it("resets after window expires", async () => {
    for (let i = 0; i < 5; i++) checkRateLimit(testIp, 5, 1);
    expect(checkRateLimit(testIp, 5, 1)).toBe(false);
    await new Promise((r) => setTimeout(r, 5));
    expect(checkRateLimit(testIp, 5, 1)).toBe(true);
  });

  it("limit of 1 blocks on second request", () => {
    expect(checkRateLimit(testIp, 1, 60_000)).toBe(true);
    expect(checkRateLimit(testIp, 1, 60_000)).toBe(false);
  });
});

describe("getIp", () => {
  it("extracts IP from x-forwarded-for header", () => {
    const req = new Request("http://localhost", {
      headers: { "x-forwarded-for": "1.2.3.4, 5.6.7.8" },
    });
    expect(getIp(req)).toBe("1.2.3.4");
  });

  it("falls back to x-real-ip", () => {
    const req = new Request("http://localhost", {
      headers: { "x-real-ip": "9.8.7.6" },
    });
    expect(getIp(req)).toBe("9.8.7.6");
  });

  it('returns "unknown" when no headers present', () => {
    const req = new Request("http://localhost");
    expect(getIp(req)).toBe("unknown");
  });

  it("trims whitespace from x-forwarded-for", () => {
    const req = new Request("http://localhost", {
      headers: { "x-forwarded-for": "  1.2.3.4  , 5.6.7.8" },
    });
    expect(getIp(req)).toBe("1.2.3.4");
  });
});
