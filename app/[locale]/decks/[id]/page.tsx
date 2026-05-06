import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DeckActions } from "@/components/decks/DeckActions";
import { CardListItem } from "@/components/cards/CardListItem";
import { BookOpen, Plus, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

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

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 rounded-full shrink-0" style={{ backgroundColor: deck.color }} />
          <div>
            <h1 className="text-2xl font-bold">{deck.name}</h1>
            {deck.description && (
              <p className="text-muted-foreground text-sm mt-1">{deck.description}</p>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/decks/${id}/study`} className={cn(buttonVariants())}>
            <BookOpen className="h-4 w-4 mr-1.5" />
            {t("study")}
            {dueCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {dueCount}
              </Badge>
            )}
          </Link>
          <Link href={`/decks/${id}/cards/new`} className={cn(buttonVariants({ variant: "outline" }))}>
            <Plus className="h-4 w-4 mr-1.5" />
            {t("addCard")}
          </Link>
          <Link href={`/decks/${id}/import`} className={cn(buttonVariants({ variant: "outline" }))}>
            <Upload className="h-4 w-4 mr-1.5" />
            {t("import")}
          </Link>
          <DeckActions deckId={id} deckName={deck.name} />
        </div>
      </div>

      {deck.cards.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center border rounded-lg">
          <p className="text-muted-foreground">{t("noCards")}</p>
          <div className="flex gap-2">
            <Link href={`/decks/${id}/cards/new`} className={cn(buttonVariants())}>
              <Plus className="h-4 w-4 mr-1.5" />
              {t("addCard")}
            </Link>
            <Link href={`/decks/${id}/import`} className={cn(buttonVariants({ variant: "outline" }))}>
              <Upload className="h-4 w-4 mr-1.5" />
              {t("import")}
            </Link>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {deck.cards.map((card, i) => (
            <CardListItem
              key={card.id}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              card={{ id: card.id, front: card.front as any, back: card.back as any, createdAt: card.createdAt.toISOString() }}
              index={i + 1}
              deckId={id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
