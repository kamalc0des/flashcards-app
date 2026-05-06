import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { sm2 } from "@/lib/sm2";
import { NextResponse } from "next/server";
import { z } from "zod";

const reviewSchema = z.object({
  cardId: z.string(),
  quality: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)]),
});

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const deck = await prisma.deck.findUnique({ where: { id } });
  if (!deck || deck.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json();
  const parsed = reviewSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { cardId, quality } = parsed.data;

  const existing = await prisma.cardReview.findUnique({
    where: { cardId_userId: { cardId, userId: session.user.id } },
  });

  const currentState = existing
    ? { ease: existing.ease, interval: existing.interval, reps: existing.reps, lapses: existing.lapses }
    : { ease: 2.5, interval: 1, reps: 0, lapses: 0 };

  const next = sm2(currentState, quality);

  const review = await prisma.cardReview.upsert({
    where: { cardId_userId: { cardId, userId: session.user.id } },
    create: {
      cardId,
      userId: session.user.id,
      ease: next.ease,
      interval: next.interval,
      reps: next.reps,
      lapses: next.lapses,
      due: next.due,
      reviewedAt: new Date(),
    },
    update: {
      ease: next.ease,
      interval: next.interval,
      reps: next.reps,
      lapses: next.lapses,
      due: next.due,
      reviewedAt: new Date(),
    },
  });

  return NextResponse.json(review);
}
