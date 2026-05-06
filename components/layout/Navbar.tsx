"use client";

import { useTranslations } from "next-intl";
import { usePathname, useRouter, Link } from "@/i18n/navigation";
import { signOut, useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BookOpen, LogOut, LayoutDashboard, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useLocale } from "next-intl";
import { cn } from "@/lib/utils";

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
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 font-semibold text-lg shrink-0">
          <BookOpen className="h-5 w-5 text-primary" />
          <span>Flashcards</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={switchLocale} className="font-mono text-xs">
            {locale === "en" ? "FR" : "EN"}
          </Button>

          {session ? (
            <>
              <Link
                href="/dashboard"
                className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
              >
                <LayoutDashboard className="h-4 w-4 mr-1.5" />
                {t("dashboard")}
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger render={
                  <Avatar className="h-8 w-8 cursor-pointer">
                    <AvatarImage src={session.user?.image ?? ""} />
                    <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                  </Avatar>
                } />
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-2 py-1.5 text-sm font-medium truncate">
                    {session.user?.name || session.user?.email}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push("/dashboard")}>
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    {t("dashboard")}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => signOut({ callbackUrl: "/" })}
                    variant="destructive"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    {t("signOut")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Link href="/auth/signin" className={cn(buttonVariants({ size: "sm" }))}>
              {t("signIn")}
            </Link>
          )}
        </nav>

        {/* Mobile nav */}
        <div className="flex md:hidden items-center gap-2">
          <Button variant="ghost" size="sm" onClick={switchLocale} className="font-mono text-xs">
            {locale === "en" ? "FR" : "EN"}
          </Button>
          <Sheet>
            <SheetTrigger render={<Button variant="ghost" size="icon" />}>
              <Menu className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <div className="flex flex-col gap-4 pt-6">
                {session ? (
                  <>
                    <div className="flex items-center gap-3 px-2">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={session.user?.image ?? ""} />
                        <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                      </Avatar>
                      <div className="text-sm font-medium truncate">
                        {session.user?.name || session.user?.email}
                      </div>
                    </div>
                    <Link
                      href="/dashboard"
                      className={cn(buttonVariants({ variant: "ghost" }), "justify-start")}
                    >
                      <LayoutDashboard className="h-4 w-4 mr-2" />
                      {t("dashboard")}
                    </Link>
                    <Button
                      variant="ghost"
                      className="justify-start text-destructive"
                      onClick={() => signOut({ callbackUrl: "/" })}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      {t("signOut")}
                    </Button>
                  </>
                ) : (
                  <Link href="/auth/signin" className={cn(buttonVariants())}>
                    {t("signIn")}
                  </Link>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
