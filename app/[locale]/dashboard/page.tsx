import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { buttonVariants } from "@/components/ui/button";
import { DeckCard } from "@/components/decks/DeckCard";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export default async function DashboardPage() {
  const session = await auth();
  const locale = await getLocale();
  if (!session?.user) redirect(`/${locale}/auth/signin`);

  const t = await getTranslations("dashboard");
  const now = new Date();

  const decks = await prisma.deck.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { cards: true } },
      cards: {
        include: {
          cardReviews: {
            where: { userId: session.user.id, due: { lte: now } },
            select: { id: true },
          },
        },
      },
    },
  });

  const deckSummaries = decks.map((d) => ({
    id: d.id,
    name: d.name,
    description: d.description,
    color: d.color,
    createdAt: d.createdAt.toISOString(),
    cardCount: d._count.cards,
    dueCount: d.cards.filter((c) => c.cardReviews.length > 0).length,
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <Link href="/decks/new" className={cn(buttonVariants())}>
          <Plus className="h-4 w-4 mr-1.5" />
          {t("newDeck")}
        </Link>
      </div>

      {deckSummaries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
          <p className="text-muted-foreground">{t("empty")}</p>
          <Link href="/decks/new" className={cn(buttonVariants())}>
            <Plus className="h-4 w-4 mr-1.5" />
            {t("newDeck")}
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {deckSummaries.map((deck) => (
            <DeckCard key={deck.id} deck={deck} />
          ))}
        </div>
      )}
    </div>
  );
}
