"use client";

import { useTranslations } from "next-intl";
import { usePathname, useRouter, Link } from "@/i18n/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, LayoutDashboard } from "lucide-react";
import { useLocale } from "next-intl";

export function Navbar() {
  const t = useTranslations("nav");
  const { data: session } = useSession();
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const switchLocale = () => {
    const next = locale === "en" ? "fr" : "en";
    router.replace(pathname, { locale: next });
  };

  const initials = session?.user?.name
    ? session.user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-zinc-950/90 backdrop-blur">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between gap-4">
        <Link href="/dashboard" className="text-white font-bold text-base tracking-tight">
          Flashcards
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={switchLocale}
            className="text-zinc-500 hover:text-zinc-200 text-xs font-mono px-2 py-1 rounded-lg hover:bg-zinc-800 transition-colors"
          >
            {locale === "en" ? "FR" : "EN"}
          </button>

          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger render={
                <button className="w-8 h-8 rounded-full bg-zinc-700 text-white text-xs font-semibold flex items-center justify-center hover:bg-zinc-600 transition-colors overflow-hidden">
                  {session.user?.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={session.user.image} alt={initials} className="w-full h-full object-cover" />
                  ) : initials}
                </button>
              } />
              <DropdownMenuContent align="end" className="w-48 bg-zinc-900 border-zinc-700">
                <div className="px-2 py-1.5 text-sm font-medium text-zinc-300 truncate">
                  {session.user?.name || session.user?.email}
                </div>
                <DropdownMenuSeparator className="bg-zinc-700" />
                <DropdownMenuItem
                  onClick={() => router.push("/dashboard")}
                  className="text-zinc-300 hover:text-white hover:bg-zinc-800"
                >
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  {t("dashboard")}
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-zinc-700" />
                <DropdownMenuItem
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="text-red-400 hover:text-red-300 hover:bg-zinc-800"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  {t("signOut")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link
              href="/auth/signin"
              className="px-3 py-1.5 rounded-lg bg-white text-zinc-950 font-semibold text-sm hover:bg-zinc-100 transition-colors"
            >
              {t("signIn")}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
