"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { Button, buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RichEditor } from "@/components/editor/RichEditor";
import { ChevronLeft } from "lucide-react";
import type { JSONContent } from "@tiptap/react";
import { emptyTiptap } from "@/lib/tiptap";
import { cn } from "@/lib/utils";

interface CardFormProps {
  deckId: string;
  cardId?: string;
  initialFront?: JSONContent;
  initialBack?: JSONContent;
  mode: "create" | "edit";
}

export function CardForm({ deckId, cardId, initialFront, initialBack, mode }: CardFormProps) {
  const t = useTranslations("cardForm");
  const locale = useLocale();
  const router = useRouter();
  const [front, setFront] = useState<JSONContent>(initialFront ?? emptyTiptap());
  const [back, setBack] = useState<JSONContent>(initialBack ?? emptyTiptap());
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (mode === "create") {
      await fetch(`/api/decks/${deckId}/cards`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ front, back }),
      });
    } else {
      await fetch(`/api/decks/${deckId}/cards/${cardId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ front, back }),
      });
    }
    router.push(`/${locale}/decks/${deckId}`);
    router.refresh();
    setLoading(false);
  };

  return (
    <div className="max-w-3xl">
      <Link
        href={`/decks/${deckId}`}
        className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "mb-6 -ml-1")}
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        {t("backToDeck")}
      </Link>

      <h1 className="text-2xl font-bold mb-8">
        {mode === "create" ? t("createTitle") : t("editTitle")}
      </h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <Label className="text-base font-semibold">{t("front")}</Label>
          <RichEditor content={front} onChange={setFront} placeholder={t("frontPlaceholder")} />
        </div>
        <div className="flex flex-col gap-2">
          <Label className="text-base font-semibold">{t("back")}</Label>
          <RichEditor content={back} onChange={setBack} placeholder={t("backPlaceholder")} />
        </div>
        <div className="flex gap-3">
          <Button type="submit" disabled={loading}>
            {mode === "create" ? t("create") : t("save")}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            {t("cancel")}
          </Button>
        </div>
      </form>
    </div>
  );
}
