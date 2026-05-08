import createIntlMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const intlMiddleware = createIntlMiddleware(routing);

const PROTECTED_PATTERN = /^\/(en|fr)\/(dashboard|decks)/;

const SESSION_COOKIE = process.env.NODE_ENV === "production"
  ? "__Secure-authjs.session-token"
  : "authjs.session-token";

export function middleware(req: NextRequest) {
  const isProtected = PROTECTED_PATTERN.test(req.nextUrl.pathname);
  if (isProtected && !req.cookies.get(SESSION_COOKIE)) {
    const locale = req.nextUrl.pathname.split("/")[1] || "en";
    return NextResponse.redirect(new URL(`/${locale}/auth/signin`, req.url));
  }
  return intlMiddleware(req);
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
