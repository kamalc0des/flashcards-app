import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, FileText, Upload } from "lucide-react";
import { auth } from "@/lib/auth";
import { cn } from "@/lib/utils";

export default async function LandingPage() {
  const session = await auth();
  return <LandingContent isSignedIn={!!session} />;
}

function LandingContent({ isSignedIn }: { isSignedIn: boolean }) {
  const t = useTranslations("landing");
  const nt = useTranslations("nav");

  const features = [
    { icon: Brain, title: t("features.spaced.title"), desc: t("features.spaced.desc") },
    { icon: FileText, title: t("features.editor.title"), desc: t("features.editor.desc") },
    { icon: Upload, title: t("features.import.title"), desc: t("features.import.desc") },
  ];

  return (
    <div className="flex flex-col">
      <section className="flex flex-col items-center justify-center text-center px-4 py-24 gap-6">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight max-w-3xl">
          {t("hero.title")}
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-xl">
          {t("hero.subtitle")}
        </p>
        <div className="flex gap-3 flex-wrap justify-center">
          {isSignedIn ? (
            <Link href="/dashboard" className={cn(buttonVariants({ size: "lg" }))}>
              {nt("dashboard")}
            </Link>
          ) : (
            <>
              <Link href="/auth/signup" className={cn(buttonVariants({ size: "lg" }))}>
                {t("hero.cta")}
              </Link>
              <Link href="/auth/signin" className={cn(buttonVariants({ variant: "outline", size: "lg" }))}>
                {t("hero.signIn")}
              </Link>
            </>
          )}
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 pb-24 w-full">
        <h2 className="text-2xl font-semibold text-center mb-10">{t("features.title")}</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((f) => (
            <Card key={f.title} className="text-center">
              <CardHeader className="items-center">
                <div className="rounded-full bg-primary/10 p-3 mb-2">
                  <f.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">{f.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
