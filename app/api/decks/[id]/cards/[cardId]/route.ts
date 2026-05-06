import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { z } from "zod";
import { isValidTiptapJson } from "@/lib/security";

const updateSchema = z.object({
  front: z.record(z.string(), z.unknown()).optional(),
  back: z.record(z.string(), z.unknown()).optional(),
});

async function getCardOrFail(cardId: string, deckId: string, userId: string) {
  const card = await prisma.card.findUnique({ where: { id: cardId }, include: { deck: true } });
  if (!card || card.deckId !== deckId || card.deck.userId !== userId) return null;
  return card;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string; cardId: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, cardId } = await params;
  const card = await getCardOrFail(cardId, id, session.user.id);
  if (!card) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(card);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; cardId: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, cardId } = await params;
  const card = await getCardOrFail(cardId, id, session.user.id);
  if (!card) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  if (parsed.data.front !== undefined && !isValidTiptapJson(parsed.data.front)) {
    return NextResponse.json({ error: "Invalid card content" }, { status: 400 });
  }
  if (parsed.data.back !== undefined && !isValidTiptapJson(parsed.data.back)) {
    return NextResponse.json({ error: "Invalid card content" }, { status: 400 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updated = await prisma.card.update({ where: { id: cardId }, data: parsed.data as any });
  return NextResponse.json(updated);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; cardId: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, cardId } = await params;
  const card = await getCardOrFail(cardId, id, session.user.id);
  if (!card) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.card.delete({ where: { id: cardId } });
  return new NextResponse(null, { status: 204 });
}
