<div align="center">

# 🧠 StudyMind AI

### Minimalist Active-Recall Study Workspace & AI Knowledge Synthesizer

An intelligent, developer-first productivity workspace that transforms raw study notes, lecture slides, and PDF documents into high-yield structured summaries, interactive 3D flip-card flashcards, and auto-graded comprehension quizzes.

[![Next.js](https://img.shields.io/badge/Next.js-16.4-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0-blue?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-6.4-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-Flash_3.x-orange?style=flat-square&logo=google)](https://ai.google.dev/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

[**Live Demo**](https://ai-powered-study-tool-ten.vercel.app/) 

</div>

---

## 📸 Screenshots & UI Preview

Inspired by Linear and Notion, StudyMind AI features a handcrafted dark zinc aesthetic (`#09090B` / `#18181B`), flat 1px borders, high-contrast monospace metadata counters, and a responsive split-panel workspace.


### 🖥️  Split-Panel Study Workspace Dashbaord 
![Dashboard Preview](./public/screenshots/Dashboard.png )

### 📋  Active-Recall Flashcard Deck
![FlashCard Deck Preview](./public/screenshots/flashcards-deck.png )

### 💬 Auto-Graded Multiple-Choice Quiz
![Multiple-Choice quiz](./public/screenshots/interactive-quiz.png )

### ⚡ Summary
![Summary preview](./public/screenshots/Summary.png )


---

## ✨ Core Features

### 1. 🔐 JWT Authentication & Atomic Credit Economics
- **Stateless & Secure**: Authenticated via HTTP-only, SameSite JWT cookies using `jose` and `bcryptjs` password hashing.
- **Atomic Credit Ledger**: Every user starts with **10 complimentary study credits**.
- **Race-Condition Protection**: All credit deductions occur inside atomic PostgreSQL transactions (`prisma.$transaction`). If parsing or document creation fails, the transaction rolls back cleanly.
- **Top-Up Refill Endpoint**: Instant demo refill button (`+5 Refill`) capped at 20 credits via `POST /api/credits/refill`.

### 2. 📄 Multi-Format Document Ingestion & Parsing
- **PDF Extraction**: Binary PDF uploads parsed server-side via `pdf-parse`, extracting clean plaintext while stripping control artifacts.
- **Direct Text Notes**: Paste raw lecture notes, article excerpts, or code documentation directly.
- **Document Management (CRUD)**:
  - Search & filter uploaded documents in real-time.
  - Inline document title renaming with Zod input validation (`PATCH /api/documents/[id]`).
  - Safe document deletion with cascade cleanup of associated flashcards and quiz questions (`DELETE /api/documents/[id]`).

### 3. 📑 Structured Study Summaries
- Generates a rigorous, three-tier study guide formatted in clean Markdown:
  1. **Executive Overview**: High-level thesis and document context.
  2. **Key Concepts**: Core definitions, principles, and formula explanations.
  3. **Actionable Takeaways**: Concrete bullet points for exam preparation or rapid review.

### 4. 🗂️ Active-Recall Flashcard Decks
- AI-synthesized concept decks focusing on prompt-and-answer retention.
- Interactive card flip animation revealing underlying explanations and definitions.
- Keyboard-friendly navigation with previous/next controls, dot progress indicators, and monospace index badges (`Card 1 / 6`).

### 5. 🎯 Auto-Graded Comprehension Quizzes
- Automatically extracts 5 multiple-choice questions per document using structured JSON output (`generateObject` + Zod).
- Instant client-side grading with emerald/rose feedback and comprehensive rationale explanations.
- Real-time score calculation (`correctCount / totalQuestions`) with instant retake capabilities.

### 6. 🛡️ Resilient Multi-Model AI Fallback Loop
To guarantee zero cut-offs and withstand Gemini rate-limits (429) or temporary capacity spikes (503), the generation engine implements automated tier-cascading:

```
[User Request]
       │
       ▼
┌───────────────────────────┐
│ Google Gemini 3.5 Flash   │ ──(Success)──► [Save to DB & Deduct Credit]
└───────────────────────────┘
       │ (503 / 429)
       ▼
┌───────────────────────────┐
│ Google Gemini 3.1 Flash   │ ──(Success)──► [Save to DB & Deduct Credit]
└───────────────────────────┘
       │ (503 / 429)
       ▼
┌───────────────────────────┐
│ Google Gemini 3.8 Flash   │ ──(Success)──► [Save to DB & Deduct Credit]
└───────────────────────────┘
       │ (All Exhausted)
       ▼
[Return 503 Congestion Error — Zero Credits Lost]
```

- **Guaranteed Completion**: Uses `generateText` and `generateObject` rather than streaming to ensure credits are **only** charged when complete study materials are finalized and persisted.

---

## 🛠️ Tech Stack & Architectural Decisions

| Layer | Technology | Decision Rationale |
|---|---|---|
| **Framework** | **Next.js 16 (App Router)** | Modern server/client hybrid rendering, Turbopack for sub-second HMR, and server actions/route handlers. |
| **Language** | **TypeScript 5** | Strict end-to-end type safety between Prisma models, API payloads, and frontend state. |
| **Styling** | **Tailwind CSS v4** | Handcrafted Linear/Notion dark palette (`zinc-950` / `zinc-900`), flat 1px borders, and monospace data typography. |
| **Database** | **PostgreSQL** | Reliable relational ACID compliance, foreign key cascade rules, and concurrent connection handling. |
| **ORM** | **Prisma ORM 6** | Declarative schema definitions, type-safe queries, connection pooling, and migration history tracking. |
| **AI Engine** | **Vercel AI SDK + Google Gemini** | High token throughput with low latency, structured JSON schema generation (`zodSchema`), and automated fallbacks. |
| **Authentication** | **JOSE + HTTP-Only Cookies** | Secure, XSS-resistant, stateless JWT verification without client-side token exposure. |
| **Validation** | **Zod 3** | Runtime request body validation for credentials, documents, and structured AI schemas. |

---

## 📂 Codebase Structure

```
ai-powered-productivity-tool/
├── prisma/
│   ├── schema.prisma               # PostgreSQL models (User, Document, Flashcard, QuizQuestion)
│   └── migrations/                 # Versioned SQL migration history
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   ├── login/route.ts          # Authenticate user & issue JWT cookie
│   │   │   │   ├── logout/route.ts         # Clear authentication cookie
│   │   │   │   ├── me/route.ts             # Fetch active profile & credit balance
│   │   │   │   └── register/route.ts       # Register new user with 10 free credits
│   │   │   ├── credits/
│   │   │   │   └── refill/route.ts         # Top-up user credits (+5, capped at 20)
│   │   │   ├── documents/
│   │   │   │   ├── route.ts                # Ingest PDF/text & list documents (with cascade relations)
│   │   │   │   └── [id]/
│   │   │   │       ├── route.ts            # PATCH (rename title) & DELETE (cascade delete)
│   │   │   │       ├── study-materials/    # AI Flashcard & Quiz generator (generateObject)
│   │   │   │       └── summary/route.ts    # AI Study Summary generator with fallback loop
│   │   │   └── user/
│   │   │       └── credits/route.ts        # Internal credit balance operations
│   │   ├── favicon.ico
│   │   ├── globals.css                     # Tailwind v4 dark zinc variables & typography
│   │   ├── layout.tsx                      # Root layout importing Geist & Geist Mono fonts
│   │   └── page.tsx                        # Complete Split-Panel Study Workspace UI
│   └── lib/
│       ├── auth.ts                         # JWT signing, verification, and cookie utilities
│       ├── pdf.ts                          # Safe server-side PDF extraction wrapper
│       ├── prisma.ts                       # Singleton Prisma client instance
│       └── validations/
│           └── auth.ts                     # Zod validation schemas for credentials
├── .env.example                            # Sanitized template for environment configuration
├── .gitignore                              # Git exclusion rules (node_modules, .next, .env)
├── package.json                            # Scripts, dependencies, and metadata
├── tailwind.config.ts                      # Tailwind design token configuration
└── tsconfig.json                           # Strict TypeScript configuration
```

---

## 🚀 Getting Started

Follow these steps to set up and run the project locally on your machine.

### Prerequisites
- **Node.js**: `v20.x` or higher
- **PostgreSQL**: Local instance or hosted database (e.g., Neon, Supabase, Railway)
- **Google Gemini API Key**: Free API key from [Google AI Studio](https://aistudio.google.com/)

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/ai-powered-productivity-tool.git
cd ai-powered-productivity-tool
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Copy the provided `.env.example` file to create your local `.env`:
```bash
cp .env.example .env
```

Open `.env` and fill in your connection details:
```env
# PostgreSQL connection string
DATABASE_URL="postgresql://postgres:password@localhost:5432/ai_productivity?schema=public"

# Minimum 32-character secret for signing JWT cookies
JWT_SECRET="super-secret-jwt-key-change-this-in-production-min-32-chars"

# Google AI Studio Gemini API key
GEMINI_API_KEY="AIzaSyYourGeminiApiKeyHere"
```

### 4. Run Prisma Database Migrations
Generate the Prisma Client and run the database migrations:
```bash
npx prisma migrate dev
```

### 5. Start the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the Study Workspace.

---

## 📡 API Reference

All protected endpoints require an authenticated session via the `auth_token` HTTP-only cookie.

| Method | Endpoint | Auth Required | Credits | Description |
|---|---|:---:|:---:|---|
| `POST` | `/api/auth/register` | No | +10 | Registers a new account, hashes password, sets JWT cookie |
| `POST` | `/api/auth/login` | No | — | Validates credentials and sets JWT session cookie |
| `POST` | `/api/auth/logout` | Yes | — | Invalidates session and clears `auth_token` cookie |
| `GET` | `/api/auth/me` | Yes | — | Returns current user profile and credit count |
| `POST` | `/api/credits/refill` | Yes | +5 | Increments user credits by 5 (capped at maximum 20) |
| `GET` | `/api/documents` | Yes | — | Lists user documents with flashcards and quizzes |
| `POST` | `/api/documents` | Yes | -1 | Uploads/parses PDF or text note; saves in transaction |
| `PATCH` | `/api/documents/[id]` | Yes | — | Renames a document title (Zod validated: 1-255 chars) |
| `DELETE` | `/api/documents/[id]` | Yes | — | Deletes document and cascades flashcards & quizzes |
| `POST` | `/api/documents/[id]/summary` | Yes | -1 | Synthesizes three-tier study summary via Gemini fallback loop |
| `POST` | `/api/documents/[id]/study-materials` | Yes | -1 | Generates 6 flip flashcards + 5 multiple-choice quiz questions |

---

## 🧪 Production Build & Type Checking

To verify TypeScript types and generate an optimized production bundle:

```bash
npm run build
```

To run the production server:
```bash
npm run start
```

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
