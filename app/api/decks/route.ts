import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const decks = await prisma.deck.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { cards: true } },
      cards: {
        include: {
          cardReviews: {
            where: { userId: session.user.id, due: { lte: new Date() } },
            select: { id: true },
          },
        },
      },
    },
  });

  const result = decks.map((d) => ({
    id: d.id,
    name: d.name,
    description: d.description,
    color: d.color,
    createdAt: d.createdAt.toISOString(),
    cardCount: d._count.cards,
    dueCount: d.cards.filter((c) => c.cardReviews.length > 0).length,
  }));

  return NextResponse.json(result);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const deck = await prisma.deck.create({
    data: {
      userId: session.user.id,
      name: parsed.data.name,
      description: parsed.data.description,
      color: parsed.data.color ?? "#6366f1",
    },
  });

  return NextResponse.json(deck, { status: 201 });
}
