import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { CardForm } from "@/components/cards/CardForm";

export default async function NewCardPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const locale = await getLocale();
  if (!session?.user) redirect(`/${locale}/auth/signin`);

  const { id } = await params;
  const deck = await prisma.deck.findUnique({ where: { id } });
  if (!deck || deck.userId !== session.user.id) notFound();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <CardForm deckId={id} mode="create" />
    </div>
  );
}
