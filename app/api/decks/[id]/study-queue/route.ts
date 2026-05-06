import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const deck = await prisma.deck.findUnique({ where: { id } });
  if (!deck || deck.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const now = new Date();

  // Cards with a review that's due
  const dueCards = await prisma.card.findMany({
    where: {
      deckId: id,
      cardReviews: { some: { userId: session.user.id, due: { lte: now } } },
    },
    include: {
      cardReviews: { where: { userId: session.user.id } },
    },
    orderBy: { createdAt: "asc" },
  });

  // New cards (no review at all for this user)
  const newCards = await prisma.card.findMany({
    where: {
      deckId: id,
      cardReviews: { none: { userId: session.user.id } },
    },
    include: { cardReviews: true },
    orderBy: { createdAt: "asc" },
    take: 20,
  });

  const allCards = [...dueCards, ...newCards].map((c) => ({
    id: c.id,
    front: c.front,
    back: c.back,
    review: c.cardReviews[0]
      ? {
          ease: c.cardReviews[0].ease,
          interval: c.cardReviews[0].interval,
          reps: c.cardReviews[0].reps,
          lapses: c.cardReviews[0].lapses,
          due: c.cardReviews[0].due.toISOString(),
        }
      : null,
  }));

  return NextResponse.json(allCards);
}
