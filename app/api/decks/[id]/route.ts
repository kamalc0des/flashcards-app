import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { z } from "zod";
import { sanitizeText } from "@/lib/security";

async function getDeckOrFail(id: string, userId: string) {
  const deck = await prisma.deck.findUnique({ where: { id } });
  if (!deck || deck.userId !== userId) return null;
  return deck;
}

const updateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).nullable().optional(),
});

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const deck = await getDeckOrFail(id, session.user.id);
  if (!deck) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const cards = await prisma.card.findMany({
    where: { deckId: id },
    orderBy: { createdAt: "asc" },
    select: { id: true, front: true, back: true, createdAt: true },
  });

  const dueCount = await prisma.cardReview.count({
    where: { userId: session.user.id, card: { deckId: id }, due: { lte: new Date() } },
  });

  return NextResponse.json({
    ...deck,
    createdAt: deck.createdAt.toISOString(),
    updatedAt: deck.updatedAt.toISOString(),
    cardCount: cards.length,
    dueCount,
    cards: cards.map((c) => ({ ...c, createdAt: c.createdAt.toISOString() })),
  });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const deck = await getDeckOrFail(id, session.user.id);
  if (!deck) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const updated = await prisma.deck.update({
    where: { id },
    data: {
      ...(parsed.data.name !== undefined && { name: sanitizeText(parsed.data.name) }),
      ...(parsed.data.description !== undefined && {
        description: parsed.data.description ? sanitizeText(parsed.data.description) : null,
      }),
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const deck = await getDeckOrFail(id, session.user.id);
  if (!deck) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.deck.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
