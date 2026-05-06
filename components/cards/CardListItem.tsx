"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { RichEditor } from "@/components/editor/RichEditor";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import type { CardSummary } from "@/types";

export function CardListItem({
  card,
  index,
  deckId,
}: {
  card: CardSummary;
  index: number;
  deckId: string;
}) {
  const t = useTranslations("deck");
  const locale = useLocale();
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);

  const handleDelete = async () => {
    await fetch(`/api/decks/${deckId}/cards/${card.id}`, { method: "DELETE" });
    router.refresh();
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        <span className="text-sm text-muted-foreground w-6 shrink-0">{index}</span>
        <div className="flex-1 min-w-0 pointer-events-none">
          <RichEditor content={card.front} editable={false} />
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={<Button variant="ghost" size="icon" className="h-7 w-7" />}
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => router.push(`/${locale}/decks/${deckId}/cards/${card.id}/edit`)}
              >
                <Pencil className="h-4 w-4 mr-2" />
                {t("editCard")}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={(e: React.MouseEvent) => { e.stopPropagation(); handleDelete(); }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {t("deleteCard")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {expanded ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </div>
      {expanded && (
        <div className="border-t px-4 py-3 bg-muted/20">
          <p className="text-xs font-medium text-muted-foreground mb-2">{t("back")}</p>
          <RichEditor content={card.back} editable={false} />
        </div>
      )}
    </div>
  );
}
