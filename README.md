# Flashcards

A full-stack spaced repetition flashcard app built for serious learners. Create decks, study with the SM-2 algorithm, import from Anki, and track your progress — all in a clean, fast interface.

**Live:** [flashcards.kamalcodes.dev](https://flashcards.kamalcodes.dev)

---

## Features

- **Spaced repetition (SM-2)** — Cards are scheduled based on your performance. Correct answers push the card further into the future; incorrect ones bring it back sooner.
- **Session management** — Sessions are capped at 20 cards. If you quit mid-session, your progress is saved and you can resume exactly where you left off.
- **Rich card editor** — Format cards with bold, italic, inline code, code blocks with syntax highlighting, colors, highlights, and bullet lists — powered by TipTap.
- **Anki import (.apkg)** — Import your existing Anki decks directly. Supports the modern zstd-compressed `.anki21b` format as well as legacy formats.
- **CSV import / export** — Import tab or comma-separated files. Export any deck as an HTML-formatted CSV to share with others, preserving all formatting.
- **Card suspension** — Disable individual cards without deleting them. Suspended cards are skipped in study sessions.
- **Bilingual (EN / FR)** — Full English and French support via next-intl. Switch languages from the navbar.
- **Responsive** — Works on mobile, tablet, and desktop. The study session is locked to viewport height — no scrolling needed.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router, TypeScript) |
| UI | shadcn/ui + Tailwind CSS v4 |
| Auth | Auth.js v5 (next-auth) — Google OAuth + email/password |
| Database | PostgreSQL + Prisma ORM (Neon) |
| Card editor | TipTap with StarterKit, Color, Highlight, CodeBlockLowlight |
| Spaced repetition | SM-2 algorithm (custom implementation) |
| i18n | next-intl (English + French) |
| Anki import | adm-zip + fzstd + better-sqlite3 |
| CSV parsing | papaparse |
| Deployment | Vercel (auto-deploy on push to `develop`) |

---

## Project Structure

```
├── app/
│   ├── [locale]/              # All pages under locale prefix (/en, /fr)
│   │   ├── auth/              # Sign in / Sign up
│   │   ├── dashboard/         # Deck list
│   │   └── decks/[id]/        # Deck detail, study, import, card editor
│   └── api/
│       └── decks/[id]/
│           ├── cards/         # Card CRUD
│           ├── study/         # POST review result (SM-2)
│           ├── study-queue/   # GET due cards
│           ├── import/        # CSV bulk import
│           ├── import-apkg/   # Anki .apkg import
│           └── export/        # CSV export
├── components/
│   ├── auth/                  # SignInForm, SignUpForm
│   ├── cards/                 # CardListItem
│   ├── decks/                 # DeckCard, DeckForm, DeckManager
│   ├── editor/                # RichEditor, EditorToolbar
│   ├── import/                # CsvUploader
│   ├── layout/                # Navbar
│   └── study/                 # StudySession, StudyCard, ReviewButtons
├── lib/
│   ├── auth.ts                # Auth.js config
│   ├── db.ts                  # Prisma singleton
│   ├── sm2.ts                 # SM-2 algorithm
│   ├── tiptap.ts              # TipTap helpers (HTML ↔ JSON)
│   └── security.ts            # Input sanitization, rate limiting, validation
├── messages/
│   ├── en.json
│   └── fr.json
└── prisma/
    └── schema.prisma
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- A PostgreSQL database (e.g. [Neon](https://neon.tech))
- A Google OAuth app (for Google sign-in)

### Installation

```bash
git clone https://github.com/kamalc0des/flashcards-app.git
cd flashcards-app
npm install
```

### Environment Variables

Create a `.env` file at the root:

```env
# Database
DATABASE_URL="postgresql://..."        # pooled connection
DIRECT_URL="postgresql://..."          # direct connection (for migrations)

# Auth.js
AUTH_SECRET="..."                      # openssl rand -base64 32
AUTH_URL="http://localhost:3000"

# Google OAuth
AUTH_GOOGLE_ID="..."
AUTH_GOOGLE_SECRET="..."
```

### Database Setup

```bash
npx prisma migrate dev
```

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## SM-2 Algorithm

Cards are rated as **Correct** or **Incorrect** after each review:

- **Incorrect** — card is requeued in the current session and the interval resets to 1 day.
- **Correct** — interval grows exponentially based on the ease factor (starts at 2.5). The sequence is roughly: 1 day → 6 days → ~15 days → ...

Only cards rated Correct count toward the session's mastered total.

---

## License

MIT
