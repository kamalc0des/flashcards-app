import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { textToTiptap } from "@/lib/tiptap";
import { NextResponse } from "next/server";
import { z } from "zod";

const importSchema = z.object({
  rows: z.array(z.tuple([z.string(), z.string()])).max(2000),
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
  const parsed = importSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const data = parsed.data.rows.map(([front, back]) => ({
    deckId: id,
    front: textToTiptap(front),
    back: textToTiptap(back),
  }));

  await prisma.card.createMany({ data });

  return NextResponse.json({ imported: data.length });
}
