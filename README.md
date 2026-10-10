# Classy Doors (كلاسي دور) 🚪

A bilingual (Arabic & English) web application for Classy Doors, specializing in Turkish armored security doors and luxury interior doors in Egypt (with branches in El Shorouk and Giza).

Built with **React**, **Vite**, **TypeScript**, **Tailwind CSS**, **shadcn/ui**, and **Supabase**.

---

## ✨ Features

- **Door Catalog & E-Commerce**:
  - Filter by category (Armored / Exterior vs. Interior), thickness (10cm, 11cm), stock status, and promotional tags.
  - Directional hinge specification (Right opening vs. Left opening).
  - Guest cart with local storage persistence and automated cloud synchronization on login.
  - Multi-item checkout flow.
- **Product Authenticity & Verification**:
  - Scan door QR codes or 1D barcodes via camera scanner or image upload using `html5-qrcode`.
  - Instant lookup of authentic door models and specifications.
  - URL verification link support (`/?code=XXXXX` and `/verification?code=XXXXX`).
  - Special Turkish authenticity certification certificate (`999999`).
- **Admin Management Portal (`/admin`)**:
  - Complete door inventory management (CRUD, photos, stock toggle, featured flag, promotional tags).
  - High-resolution Code128 barcode generation and PNG export.
  - Comprehensive order management with status tracking (`Pending`, `Confirmed`, `Done`, `Canceled`).
- **User Accounts & Orders**:
  - Phone or Email password authentication with profile persistence.
  - Order history tracking and self-service cancellation for pending orders.
- **Design & Localization**:
  - Full Arabic (RTL) and English (LTR) language support with preference persisted in local storage.
  - Editorial luxury typography using Cairo and Playfair Display fonts with a modern liquid-glass theme.

---

## 🛠️ Tech Stack

- **Frontend**: [React 18](https://react.dev/), [Vite](https://vitejs.dev/), [TypeScript](https://www.typescriptlang.org/)
- **UI Components & Icons**: [shadcn/ui](https://ui.shadcn.com/), [Radix UI](https://www.radix-ui.com/), [Lucide React](https://lucide.dev/), [Framer Motion](https://www.framer.com/motion/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Backend & Database**: [Supabase](https://supabase.com/) (PostgreSQL, Row Level Security, Auth, Storage, Edge Functions)
- **Barcodes & QR**: `html5-qrcode`, `jsbarcode`
- **Analytics & Speed Insights**: `@vercel/analytics`, `@vercel/speed-insights`

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- npm or bun

### 1. Clone the repository

```bash
git clone https://github.com/Classy-Door/classy-doors.git
cd classy-doors
```

### 2. Environment Configuration

Copy the example environment file:

```bash
cp .env.example .env
```

Configure your Supabase environment variables in `.env`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-supabase-anon-key
VITE_SUPABASE_PROJECT_ID=your-project-id
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Run Locally

```bash
npm run dev
```

The application will be accessible at `http://localhost:8080`.

### 5. Build for Production

```bash
npm run build
```

---

## 🗄️ Database Migrations

Database schema, tables, RLS policies, and triggers are located in [`supabase/migrations/`](./supabase/migrations).

To apply migrations locally with the Supabase CLI:

```bash
supabase db reset
```

Or push them to your linked Supabase project:

```bash
supabase db push
```

---

## 🌐 Deployment on Vercel

1. Import this repository into [Vercel](https://vercel.com/).
2. Add the environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
   - `VITE_SUPABASE_PROJECT_ID`
3. Deploy! Single-Page Application (SPA) routing is pre-configured in [`vercel.json`](./vercel.json).
