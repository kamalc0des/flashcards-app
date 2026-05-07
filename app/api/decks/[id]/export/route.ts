import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { tiptapToPlainText } from "@/lib/tiptap";
import { NextResponse } from "next/server";
import type { JSONContent } from "@tiptap/react";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const deck = await prisma.deck.findUnique({
    where: { id },
    include: { cards: { orderBy: { createdAt: "asc" } } },
  });

  if (!deck || deck.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const escape = (s: string) => `"${s.replace(/"/g, '""')}"`;

  const rows = deck.cards.map((card) => {
    const front = tiptapToPlainText(card.front as JSONContent);
    const back = tiptapToPlainText(card.back as JSONContent);
    return `${escape(front)},${escape(back)}`;
  });

  const csv = rows.join("\n");
  const filename = `${deck.name.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.csv`;

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
