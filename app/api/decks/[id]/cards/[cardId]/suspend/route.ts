import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string; cardId: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, cardId } = await params;
  const deck = await prisma.deck.findUnique({ where: { id } });
  if (!deck || deck.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const card = await prisma.card.findUnique({ where: { id: cardId } });
  if (!card || card.deckId !== id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updated = await prisma.card.update({
    where: { id: cardId },
    data: { suspended: !card.suspended },
  });

  return NextResponse.json({ suspended: updated.suspended });
}
