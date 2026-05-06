import { getTranslations } from "next-intl/server";
import { DeckForm } from "@/components/decks/DeckForm";

export default async function NewDeckPage() {
  const t = await getTranslations("deckForm");
  return (
    <main className="min-h-dvh bg-zinc-950 text-white">
      <div className="max-w-xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold mb-8">{t("createTitle")}</h1>
        <DeckForm mode="create" />
      </div>
    </main>
  );
}
