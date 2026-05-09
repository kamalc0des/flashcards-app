export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { DeckCard } from "@/components/decks/DeckCard";
import { Plus } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();
  const locale = await getLocale();
  if (!session?.user) redirect(`/${locale}/auth/signin`);

  const t = await getTranslations("dashboard");

  const decks = await prisma.deck.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { cards: true } } },
  });

  const deckSummaries = decks.map((d) => ({
    id: d.id,
    name: d.name,
    description: d.description,
    color: d.color,
    createdAt: d.createdAt.toISOString(),
    cardCount: d._count.cards,
  }));

  return (
    <main className="min-h-dvh bg-zinc-950 text-white flex flex-col items-center px-4 sm:px-6 py-10 sm:py-14">
      <div className="w-full max-w-7xl">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Flashcards</h1>
            <p className="text-zinc-400 text-sm mt-1">{t("title")}</p>
          </div>
          <Link
            href="/decks/new"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-zinc-950 font-semibold text-sm hover:bg-zinc-100 active:scale-95 transition-all"
          >
            <Plus className="h-4 w-4" />
            {t("newDeck")}
          </Link>
        </div>

        {deckSummaries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-6 text-center">
            <div className="text-4xl">📚</div>
            <div>
              <p className="text-white font-semibold mb-1">{t("empty")}</p>
              <p className="text-zinc-500 text-sm">{t("emptyHint")}</p>
            </div>
            <Link
              href="/decks/new"
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-zinc-950 font-semibold text-sm hover:bg-zinc-100 active:scale-95 transition-all"
            >
              <Plus className="h-4 w-4" />
              {t("newDeck")}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {deckSummaries.map((deck) => (
              <DeckCard key={deck.id} deck={deck} />
            ))}
          </div>
        )}

        <p className="text-center text-zinc-700 text-xs mt-10">
          {t("cardsTotal", { count: deckSummaries.reduce((acc, d) => acc + d.cardCount, 0) })}
        </p>
      </div>
    </main>
  );
}
