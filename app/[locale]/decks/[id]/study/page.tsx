import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { StudySession } from "@/components/study/StudySession";

export default async function StudyPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const locale = await getLocale();
  if (!session?.user) redirect(`/${locale}/auth/signin`);

  const { id } = await params;
  const deck = await prisma.deck.findUnique({ where: { id } });
  if (!deck || deck.userId !== session.user.id) notFound();

  return (
    <StudySession
      deckId={id}
      deckName={deck.name}
      deckColor={deck.color}
    />
  );
}
