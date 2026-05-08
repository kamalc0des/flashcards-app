import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { DeckForm } from "@/components/decks/DeckForm";

export default async function EditDeckPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const locale = await getLocale();
  if (!session?.user) redirect(`/${locale}/auth/signin`);

  const { id } = await params;
  const t = await getTranslations("deckForm");
  const deck = await prisma.deck.findUnique({ where: { id } });
  if (!deck || deck.userId !== session.user.id) notFound();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">{t("editTitle")}</h1>
      <DeckForm
        mode="edit"
        deckId={id}
        initialData={{ name: deck.name, description: deck.description, color: deck.color }}
      />
    </div>
  );
}
