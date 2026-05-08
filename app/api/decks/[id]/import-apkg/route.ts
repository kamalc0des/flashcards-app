import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { htmlToTiptap } from "@/lib/tiptap";
import { NextResponse } from "next/server";
import AdmZip from "adm-zip";
import Database from "better-sqlite3";
import { decompress } from "fzstd";
import os from "os";
import path from "path";
import fs from "fs";

function extractDb(zip: AdmZip): Buffer {
  // Prefer the newer zstd-compressed format (.anki21b) which contains all cards
  const zstdEntry = zip.getEntry("collection.anki21b");
  if (zstdEntry) {
    const compressed = zstdEntry.getData();
    const decompressed = decompress(compressed);
    return Buffer.from(decompressed);
  }

  // Fall back to uncompressed formats
  const entry = zip.getEntry("collection.anki21") ?? zip.getEntry("collection.anki2");
  if (!entry) throw new Error("No collection database found in .apkg");
  return entry.getData();
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const deck = await prisma.deck.findUnique({ where: { id } });
  if (!deck || deck.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  // 50 MB max
  if (file.size > 50 * 1024 * 1024) {
    return NextResponse.json({ error: "File too large (max 50 MB)" }, { status: 413 });
  }
  if (!file.name.endsWith(".apkg")) {
    return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  let dbBuf: Buffer;
  try {
    const zip = new AdmZip(buffer);
    dbBuf = extractDb(zip);
  } catch {
    return NextResponse.json({ error: "Invalid .apkg file" }, { status: 400 });
  }

  const tmpPath = path.join(os.tmpdir(), `anki-${Date.now()}.db`);
  fs.writeFileSync(tmpPath, dbBuf);

  let imported = 0;
  try {
    const db = new Database(tmpPath, { readonly: true });
    const notes = db.prepare("SELECT flds FROM notes").all() as { flds: string }[];
    db.close();

    const FIELD_SEP = "\x1f";
    const pairs = notes
      .map((n) => n.flds.split(FIELD_SEP))
      .filter((fields) => fields.length >= 2)
      .map((fields) => ({ front: fields[0].trim(), back: fields[1].trim() }))
      .filter((p) => p.front && p.back);

    const data = pairs.map(({ front, back }) => ({
      deckId: id,
      front: htmlToTiptap(front),
      back: htmlToTiptap(back),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    })) as any[];

    await prisma.card.createMany({ data });
    imported = data.length;
  } finally {
    fs.unlinkSync(tmpPath);
  }

  return NextResponse.json({ imported });
}
