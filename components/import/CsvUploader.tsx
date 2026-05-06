"use client";

import { useState, useRef } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { Link } from "@/i18n/navigation";
import Papa from "papaparse";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, ChevronLeft } from "lucide-react";

interface CsvUploaderProps {
  deckId: string;
}

export function CsvUploader({ deckId }: CsvUploaderProps) {
  const t = useTranslations("import");
  const locale = useLocale();
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<string[][]>([]);
  const [frontCol, setFrontCol] = useState("0");
  const [backCol, setBackCol] = useState("1");
  const [dragging, setDragging] = useState(false);
  const [status, setStatus] = useState<"idle" | "importing" | "success" | "error">("idle");
  const [importedCount, setImportedCount] = useState(0);

  const parseFile = (file: File) => {
    Papa.parse(file, {
      delimiter: "",
      skipEmptyLines: true,
      complete: (results) => {
        setRows(results.data as string[][]);
        setStatus("idle");
      },
    });
  };

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    parseFile(file);
  };

  const handleImport = async () => {
    setStatus("importing");
    const fi = parseInt(frontCol);
    const bi = parseInt(backCol);
    const pairs = rows
      .filter((r) => r.length > Math.max(fi, bi))
      .map((r) => [r[fi] ?? "", r[bi] ?? ""] as [string, string]);

    const res = await fetch(`/api/decks/${deckId}/import`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rows: pairs }),
    });

    if (res.ok) {
      const data = await res.json();
      setImportedCount(data.imported);
      setStatus("success");
      router.refresh();
    } else {
      setStatus("error");
    }
  };

  const colOptions = rows[0]
    ? Array.from({ length: rows[0].length }, (_, i) => String(i))
    : ["0", "1"];

  return (
    <div className="max-w-2xl">
      <Link
        href={`/decks/${deckId}`}
        className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "mb-6 -ml-1")}
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        {t("backToDeck")}
      </Link>

      <h1 className="text-2xl font-bold mb-8">{t("title")}</h1>

      {/* Drop zone */}
      <div
        className={`border-2 border-dashed rounded-lg p-10 flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors ${
          dragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
        }`}
        onClick={() => fileRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFile(e.dataTransfer.files[0]);
        }}
      >
        <Upload className="h-8 w-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground text-center">
          {dragging ? t("dropzoneActive") : t("dropzone")}
        </p>
        <input
          ref={fileRef}
          type="file"
          accept=".csv,.txt"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>

      {rows.length > 0 && (
        <div className="mt-6 flex flex-col gap-5">
          <p className="text-sm text-muted-foreground">{t("rows", { count: rows.length })}</p>

          {/* Column mapping */}
          <div className="flex flex-wrap gap-4">
            <div className="flex flex-col gap-1.5">
              <Label>{t("frontColumn")}</Label>
              <Select value={frontCol} onValueChange={(v) => setFrontCol(v ?? "0")}>
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {colOptions.map((c) => (
                    <SelectItem key={c} value={c}>
                      {t("columnIndex", { n: parseInt(c) + 1 })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>{t("backColumn")}</Label>
              <Select value={backCol} onValueChange={(v) => setBackCol(v ?? "1")}>
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {colOptions.map((c) => (
                    <SelectItem key={c} value={c}>
                      {t("columnIndex", { n: parseInt(c) + 1 })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Preview table */}
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 font-medium text-muted-foreground w-8">#</th>
                  <th className="text-left p-3 font-medium">{t("frontColumn")}</th>
                  <th className="text-left p-3 font-medium">{t("backColumn")}</th>
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 20).map((row, i) => (
                  <tr key={i} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="p-3 text-muted-foreground">{i + 1}</td>
                    <td className="p-3 truncate max-w-[200px]">{row[parseInt(frontCol)] ?? ""}</td>
                    <td className="p-3 truncate max-w-[200px]">{row[parseInt(backCol)] ?? ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {status === "success" && (
            <p className="text-green-600 text-sm font-medium">
              {t("success", { count: importedCount })}
            </p>
          )}
          {status === "error" && (
            <p className="text-destructive text-sm">{t("error")}</p>
          )}

          <Button
            onClick={handleImport}
            disabled={status === "importing"}
            className="self-start"
          >
            <Upload className="h-4 w-4 mr-2" />
            {status === "importing"
              ? t("importing")
              : t("importButton", { count: rows.length })}
          </Button>
        </div>
      )}
    </div>
  );
}
