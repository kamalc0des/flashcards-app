"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DeckSummary } from "@/types";

export function DeckCard({ deck }: { deck: DeckSummary }) {
  const t = useTranslations("dashboard");
  const dt = useTranslations("deck");

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div
              className="w-3 h-3 rounded-full shrink-0 mt-0.5"
              style={{ backgroundColor: deck.color }}
            />
            <CardTitle className="text-base leading-snug">{deck.name}</CardTitle>
          </div>
          {deck.dueCount > 0 && (
            <Badge variant="destructive" className="shrink-0 text-xs">
              {t("due", { count: deck.dueCount })}
            </Badge>
          )}
        </div>
        {deck.description && (
          <p className="text-sm text-muted-foreground pl-5 line-clamp-2">{deck.description}</p>
        )}
      </CardHeader>
      <CardContent className="flex items-center justify-between pt-0">
        <span className="text-sm text-muted-foreground">
          {t("cards", { count: deck.cardCount })}
        </span>
        <Link
          href={`/decks/${deck.id}/study`}
          className={cn(buttonVariants({ size: "sm" }))}
        >
          <BookOpen className="h-3.5 w-3.5 mr-1.5" />
          {dt("study")}
        </Link>
      </CardContent>
    </Card>
  );
}
