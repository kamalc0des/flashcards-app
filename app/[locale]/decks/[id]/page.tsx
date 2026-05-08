export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { DeckManager } from "@/components/decks/DeckManager";
import { CardListItem } from "@/components/cards/CardListItem";
import { BookOpen, Plus, Upload, Download, ChevronLeft } from "lucide-react";

export default async function DeckDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const locale = await getLocale();
  if (!session?.user) redirect(`/${locale}/auth/signin`);

  const { id } = await params;
  const t = await getTranslations("deck");

  const deck = await prisma.deck.findUnique({
    where: { id },
    include: { cards: { orderBy: { createdAt: "asc" } } },
  });

  if (!deck || deck.userId !== session.user.id) notFound();

  const dueCount = await prisma.cardReview.count({
    where: { userId: session.user.id, card: { deckId: id }, due: { lte: new Date() } },
  });

  const suspendedCount = deck.cards.filter((c) => c.suspended).length;

  return (
    <main className="min-h-dvh bg-zinc-950 text-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        {/* Back */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-zinc-500 hover:text-white transition-colors text-sm mb-8"
        >
          <ChevronLeft className="h-4 w-4" />
          {t("myDecks")}
        </Link>

        {/* Inline editable name/description */}
        <div className="mb-3">
          <DeckManager
            deckId={id}
            initialName={deck.name}
            initialDescription={deck.description}
          />
        </div>

        {/* Stats row */}
        <p className="text-zinc-600 text-xs mb-6">
          {t(deck.cards.length > 1 ? "cardCountPlural" : "cardCount", { count: deck.cards.length })}
          {dueCount > 0 && <span className="text-amber-400 ml-2">· {t("dueCount", { count: dueCount })}</span>}
          {suspendedCount > 0 && <span className="ml-2">· {t("suspendedCount", { count: suspendedCount })}</span>}
        </p>

        {/* Action buttons */}
        <div className="flex gap-2 mb-8 flex-wrap">
          <Link
            href={`/decks/${id}/study`}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-zinc-950 font-semibold text-sm hover:bg-zinc-100 active:scale-95 transition-all"
          >
            <BookOpen className="h-4 w-4" />
            {t("study")}
            {dueCount > 0 && (
              <span className="bg-zinc-950/20 text-zinc-950 text-xs font-bold px-1.5 py-0.5 rounded-md">{dueCount}</span>
            )}
          </Link>
          <Link
            href={`/decks/${id}/cards/new`}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-700 text-zinc-300 font-semibold text-sm hover:bg-zinc-800 active:scale-95 transition-all"
          >
            <Plus className="h-4 w-4" />
            {t("addCard")}
          </Link>
          <Link
            href={`/decks/${id}/import`}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-700 text-zinc-300 font-semibold text-sm hover:bg-zinc-800 active:scale-95 transition-all"
          >
            <Upload className="h-4 w-4" />
            {t("import")}
          </Link>
          {deck.cards.length > 0 && (
            <a
              href={`/api/decks/${id}/export`}
              download
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-700 text-zinc-300 font-semibold text-sm hover:bg-zinc-800 active:scale-95 transition-all"
            >
              <Download className="h-4 w-4" />
              {t("export")}
            </a>
          )}
        </div>

        {/* Cards */}
        {deck.cards.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-5 text-center rounded-2xl border border-zinc-800 bg-zinc-900">
            <div className="text-3xl">🃏</div>
            <div>
              <p className="text-white font-semibold mb-1">{t("noCards")}</p>
              <p className="text-zinc-500 text-sm">{t("noCardsHint")}</p>
            </div>
            <div className="flex gap-2">
              <Link
                href={`/decks/${id}/cards/new`}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-zinc-950 font-semibold text-sm hover:bg-zinc-100 active:scale-95 transition-all"
              >
                <Plus className="h-4 w-4" />
                {t("addCard")}
              </Link>
              <Link
                href={`/decks/${id}/import`}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-700 text-zinc-300 font-semibold text-sm hover:bg-zinc-800 active:scale-95 transition-all"
              >
                <Upload className="h-4 w-4" />
                {t("import")}
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
            {deck.cards.map((card, i) => (
              <CardListItem
                key={card.id}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                card={{ id: card.id, front: card.front as any, back: card.back as any, createdAt: card.createdAt.toISOString(), suspended: card.suspended }}
                index={i + 1}
                deckId={id}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
