import { auth } from "@/lib/auth";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const intlMiddleware = createIntlMiddleware(routing);

const PROTECTED_PATTERN = /^\/(en|fr)\/(dashboard|decks)/;

export default auth((req: NextRequest & { auth: unknown }) => {
  const isProtected = PROTECTED_PATTERN.test(req.nextUrl.pathname);
  if (isProtected && !req.auth) {
    const locale = req.nextUrl.pathname.split("/")[1] || "en";
    return NextResponse.redirect(
      new URL(`/${locale}/auth/signin`, req.url)
    );
  }
  return intlMiddleware(req);
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
