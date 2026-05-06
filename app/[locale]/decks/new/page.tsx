import { getTranslations } from "next-intl/server";
import { DeckForm } from "@/components/decks/DeckForm";

export default async function NewDeckPage() {
  const t = await getTranslations("deckForm");
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">{t("createTitle")}</h1>
      <DeckForm mode="create" />
    </div>
  );
}
