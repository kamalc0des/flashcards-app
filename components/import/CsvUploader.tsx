"use client";

import { useState, useRef } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { Link } from "@/i18n/navigation";
import Papa from "papaparse";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, ChevronLeft, Package } from "lucide-react";

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
  const [apkgFile, setApkgFile] = useState<File | null>(null);

  const parseFile = (file: File) => {
    if (file.name.endsWith(".apkg")) {
      setApkgFile(file);
      setRows([]);
      setStatus("idle");
      return;
    }
    setApkgFile(null);
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

  const handleImportApkg = async () => {
    if (!apkgFile) return;
    setStatus("importing");
    const form = new FormData();
    form.append("file", apkgFile);
    const res = await fetch(`/api/decks/${deckId}/import-apkg`, {
      method: "POST",
      body: form,
    });
    if (res.ok) {
      const data = await res.json();
      setImportedCount(data.imported);
      setStatus("success");
      router.push(`/${locale}/decks/${deckId}`);
    } else {
      setStatus("error");
    }
  };

  const handleImportCsv = async () => {
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
      router.push(`/${locale}/decks/${deckId}`);
    } else {
      setStatus("error");
    }
  };

  const colOptions = rows[0]
    ? Array.from({ length: rows[0].length }, (_, i) => String(i))
    : ["0", "1"];

  return (
    <main className="min-h-dvh bg-zinc-950 text-white">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <Link
          href={`/decks/${deckId}`}
          className="inline-flex items-center gap-1.5 text-zinc-500 hover:text-white transition-colors text-sm mb-8"
        >
          <ChevronLeft className="h-4 w-4" />
          {t("backToDeck")}
        </Link>

        <h1 className="text-2xl font-bold mb-2">{t("title")}</h1>
        <p className="text-zinc-500 text-sm mb-8">Supports Anki (.apkg) and CSV/TSV files</p>

        {/* Drop zone */}
        <div
          className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors ${
            dragging ? "border-zinc-500 bg-zinc-800/30" : "border-zinc-700 hover:border-zinc-500"
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
          <Upload className="h-8 w-8 text-zinc-500" />
          <p className="text-sm text-zinc-500 text-center">
            {dragging ? "Drop it!" : "Drop an .apkg or .csv/.txt file here, or click to browse"}
          </p>
          <p className="text-xs text-zinc-700">Supports Anki exports (.apkg) and CSV/TSV</p>
          <input
            ref={fileRef}
            type="file"
            accept=".apkg,.csv,.txt"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
        </div>

        {/* Anki .apkg preview */}
        {apkgFile && (
          <div className="mt-6 flex flex-col gap-4">
            <div className="flex items-center gap-3 p-4 rounded-xl border border-zinc-800 bg-zinc-900">
              <Package className="h-5 w-5 text-zinc-400 shrink-0" />
              <div>
                <p className="text-sm font-medium text-white">{apkgFile.name}</p>
                <p className="text-xs text-zinc-500">{(apkgFile.size / 1024).toFixed(0)} KB · Anki package</p>
              </div>
            </div>
            <p className="text-xs text-zinc-500">
              Cards will be imported from the first two fields of each note (front → back). HTML formatting is preserved.
            </p>

            {status === "success" && (
              <p className="text-green-400 text-sm font-medium">
                ✓ {importedCount} cards imported successfully
              </p>
            )}
            {status === "error" && (
              <p className="text-red-400 text-sm">Failed to parse the .apkg file. Make sure it&apos;s a valid Anki export.</p>
            )}

            <button
              onClick={handleImportApkg}
              disabled={status === "importing"}
              className="self-start flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-zinc-950 font-semibold text-sm hover:bg-zinc-100 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Package className="h-4 w-4" />
              {status === "importing" ? "Importing…" : `Import from ${apkgFile.name}`}
            </button>
          </div>
        )}

        {/* CSV preview */}
        {rows.length > 0 && (
          <div className="mt-6 flex flex-col gap-5">
            <p className="text-sm text-zinc-400">{t("rows", { count: rows.length })}</p>

            {/* Column mapping */}
            <div className="flex flex-wrap gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-zinc-300">{t("frontColumn")}</label>
                <Select value={frontCol} onValueChange={(v) => setFrontCol(v ?? "0")}>
                  <SelectTrigger className="w-36 bg-zinc-800 border-zinc-700 text-zinc-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-700">
                    {colOptions.map((c) => (
                      <SelectItem key={c} value={c} className="text-zinc-200 hover:bg-zinc-800">
                        {t("columnIndex", { n: parseInt(c) + 1 })}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-zinc-300">{t("backColumn")}</label>
                <Select value={backCol} onValueChange={(v) => setBackCol(v ?? "1")}>
                  <SelectTrigger className="w-36 bg-zinc-800 border-zinc-700 text-zinc-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-700">
                    {colOptions.map((c) => (
                      <SelectItem key={c} value={c} className="text-zinc-200 hover:bg-zinc-800">
                        {t("columnIndex", { n: parseInt(c) + 1 })}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Preview table */}
            <div className="overflow-x-auto rounded-xl border border-zinc-800">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-900">
                    <th className="text-left p-3 font-medium text-zinc-500 w-8">#</th>
                    <th className="text-left p-3 font-medium text-zinc-300">{t("frontColumn")}</th>
                    <th className="text-left p-3 font-medium text-zinc-300">{t("backColumn")}</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.slice(0, 20).map((row, i) => (
                    <tr key={i} className="border-b border-zinc-800 last:border-0 hover:bg-zinc-900/50">
                      <td className="p-3 text-zinc-600">{i + 1}</td>
                      <td className="p-3 truncate max-w-[200px] text-zinc-300">{row[parseInt(frontCol)] ?? ""}</td>
                      <td className="p-3 truncate max-w-[200px] text-zinc-400">{row[parseInt(backCol)] ?? ""}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {status === "success" && (
              <p className="text-green-400 text-sm font-medium">
                {t("success", { count: importedCount })}
              </p>
            )}
            {status === "error" && (
              <p className="text-red-400 text-sm">{t("error")}</p>
            )}

            <button
              onClick={handleImportCsv}
              disabled={status === "importing"}
              className="self-start flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-zinc-950 font-semibold text-sm hover:bg-zinc-100 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Upload className="h-4 w-4" />
              {status === "importing"
                ? t("importing")
                : t("importButton", { count: rows.length })}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
