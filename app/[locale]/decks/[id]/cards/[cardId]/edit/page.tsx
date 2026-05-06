import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { CardForm } from "@/components/cards/CardForm";
import type { JSONContent } from "@tiptap/react";

export default async function EditCardPage({
  params,
}: {
  params: Promise<{ id: string; cardId: string }>;
}) {
  const session = await auth();
  const locale = await getLocale();
  if (!session?.user) redirect(`/${locale}/auth/signin`);

  const { id, cardId } = await params;
  const card = await prisma.card.findUnique({
    where: { id: cardId },
    include: { deck: true },
  });
  if (!card || card.deckId !== id || card.deck.userId !== session.user.id) notFound();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <CardForm
        deckId={id}
        cardId={cardId}
        initialFront={card.front as JSONContent}
        initialBack={card.back as JSONContent}
        mode="edit"
      />
    </div>
  );
}
