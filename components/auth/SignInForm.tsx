"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Brain, Repeat2, Upload, Zap } from "lucide-react";

const features = [
  { icon: Brain, label: "Mémorisation active", desc: "Des cartes recto-verso pour ancrer les connaissances" },
  { icon: Repeat2, label: "Répétition espacée", desc: "Algorithme SM-2 pour réviser au bon moment" },
  { icon: Upload, label: "Import Anki / CSV", desc: "Importez vos decks existants en un clic" },
  { icon: Zap, label: "Rapide & simple", desc: "Interface pensée pour aller à l'essentiel" },
];

export function SignInForm() {
  const t = useTranslations("auth");
  const locale = useLocale();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) {
      setError(t("invalidCredentials"));
    } else {
      router.push(`/${locale}/dashboard`);
      router.refresh();
    }
  };

  return (
    <div className="min-h-dvh bg-zinc-950 text-white flex flex-col lg:flex-row">

      {/* Left — branding & features */}
      <div className="flex flex-col justify-between lg:w-1/2 px-8 py-12 lg:px-16 lg:py-16 border-b border-zinc-800 lg:border-b-0 lg:border-r lg:border-zinc-800">
        <div>
          <div className="flex items-center gap-2 mb-12">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
              <Brain className="h-4 w-4 text-zinc-950" />
            </div>
            <span className="font-bold text-lg tracking-tight">Flashcards</span>
          </div>

          <h1 className="text-4xl lg:text-5xl font-bold tracking-tight leading-tight mb-4">
            Apprenez.<br />
            <span className="text-zinc-400">Révisez mieux.</span>
          </h1>
          <p className="text-zinc-400 text-lg mb-12 max-w-sm">
            Créez vos propres decks, importez depuis Anki et maîtrisez n&apos;importe quel sujet grâce à la répétition espacée.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {features.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex gap-3">
                <div className="mt-0.5 shrink-0 w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center">
                  <Icon className="h-4 w-4 text-zinc-300" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{label}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-zinc-700 mt-12 lg:mt-0">© {new Date().getFullYear()} Flashcards</p>
      </div>

      {/* Right — sign in form */}
      <div className="flex flex-col items-center justify-center lg:w-1/2 px-8 py-12 lg:px-16">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h2 className="text-2xl font-bold tracking-tight mb-1">{t("signIn")}</h2>
            <p className="text-zinc-400 text-sm">Accédez à vos decks et continuez à apprendre.</p>
          </div>

          <div className="flex flex-col gap-4">
            <button
              type="button"
              onClick={() => signIn("google", { callbackUrl: `/${locale}/dashboard` })}
              className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-zinc-700 bg-zinc-900 text-zinc-200 font-medium text-sm hover:bg-zinc-800 active:scale-95 transition-all"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {t("google")}
            </button>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-zinc-800" />
              <span className="text-xs text-zinc-600">{t("orContinueWith")}</span>
              <div className="flex-1 h-px bg-zinc-800" />
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="email" className="text-sm font-medium text-zinc-300">{t("email")}</label>
                <input
                  id="email"
                  type="email"
                  placeholder={t("emailPlaceholder")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-zinc-500 transition-colors"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="password" className="text-sm font-medium text-zinc-300">{t("password")}</label>
                <input
                  id="password"
                  type="password"
                  placeholder={t("passwordPlaceholder")}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-zinc-500 transition-colors"
                />
              </div>
              {error && <p className="text-red-400 text-sm">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-white text-zinc-950 font-semibold text-sm hover:bg-zinc-100 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-1"
              >
                {loading ? t("signingIn") : t("signIn")}
              </button>
            </form>

            <p className="text-center text-sm text-zinc-500 mt-2">
              {t("noAccount")}{" "}
              <Link href="/auth/signup" className="text-zinc-300 hover:text-white underline underline-offset-4 transition-colors">
                {t("signUpLink")}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
