# Spendora Touchbase

Date: March 11, 2026

## What changed today

- Refined the dashboard and insights split so `Dashboard` feels more operational and `Insights` feels more analytical.
- Added smoother UI motion across cards, sections, and mobile sidebar transitions.
- Improved the dashboard greeting chip so it reacts to local time and shows a matching icon.
- Added `Small wins` plus a fallback empty state so the card still appears for fresh users.
- Added trend explanations in `Insights` with plain-language summaries.
- Added monthly report actions for copy, download, and print/PDF.
- Reworked the print layout so exported reports look like documents instead of website screenshots.
- Added merchant intelligence:
  - dedicated `merchant` field
  - merchant autocomplete from past entries
  - `Tab` and `Enter` keyboard autofill on highlighted suggestions
- Added backup and restore in `Settings` with merge and replace flows.
- Added lightweight toast notifications for saves, edits, deletes, exports, imports, copy, and print actions.
- Added PWA support so the app can be installed and used offline after the first online load.
- Added About and FAQ informational pages in the sidebar.
- Wired in a custom app icon for browser/PWA install use.

## Current product shape

### Dashboard

- Monthly overview
- Summary cards
- `Small wins`
- Monthly budget
- Category breakdown
- Category budget watch
- Recent expenses

### Insights

- Summary insight cards
- Trend notes
- Monthly trend chart
- Category distribution chart
- Spending rhythm
- Monthly momentum
- Monthly report export area

### Expenses

- Search and filters
- Edit and delete flows
- Merchant-aware expense display

### Add Expense

- Clean entry form
- Merchant autocomplete
- Category selection
- Notes

### Settings

- Currency
- Monthly budget
- Category budgets
- Category management
- Backup export/import/restore

## Technical structure

### Language and stack

- Language: TypeScript
- Framework: Next.js 16 with the App Router
- UI: React 19
- Styling: Tailwind CSS 4
- Motion: Framer Motion
- Icons: Lucide React
- Charts: Recharts
- Local database: Dexie on top of IndexedDB
- PWA layer: custom manifest + service worker setup

### Main file types

- `.tsx` for app routes, React components, and page UI
- `.ts` for logic, hooks, data helpers, and database utilities
- `.css` for global styling and print rules
- `.png` and `.ico` for app icons and visual assets
- `.sql` for the Supabase migration snapshot in the repo
- `.json` for exported backups

### Practical tooling and extensions used in the app

- Merchant autocomplete and autofill
- Toast notifications for user feedback
- Backup export/import/restore
- Print-friendly report export
- Installable PWA behavior with offline support
- Local browser storage instead of backend auth/sync

### App routes

- `app/page.tsx`: Dashboard
- `app/insights/page.tsx`: Insights and reports
- `app/expenses/page.tsx`: Expense list, filters, edit/delete
- `app/add-expense/page.tsx`: New expense form
- `app/settings/page.tsx`: Preferences, budgets, categories, backup tools
- `app/about/page.tsx`: About page
- `app/faqs/page.tsx`: FAQ and usage guide
- `app/offline/page.tsx`: Offline fallback page

### Core folders

- `src/components/`: UI, cards, charts, expense interactions, PWA helpers
- `src/features/expenses/`: expense logic, presets, filters, formatting, hooks
- `src/features/insights/`: trend, report, and narrative helpers
- `src/features/settings/`: budget and currency hooks/constants
- `src/lib/db/`: Dexie/IndexedDB schema and local backup/import logic

### Data model direction

- Local-first
- IndexedDB-backed
- No user accounts
- Per-device/browser storage
- Backup/restore used instead of cloud sync

## Deployment status

- GitHub repo connected: `macyhood2527-oss/Spendora`
- Vercel deployment flow is active from `main`
- PWA support is in place
- Offline usage works after first online load and cache install

## Notes and reminders

- Deployed environments use separate local browser storage from localhost.
- Fresh users will not share data unless they import a backup.
- If a new icon or PWA update does not appear right away, a hard refresh or reinstall may be needed.
- Browser print/PDF is working, but a dedicated export route could still make reporting even more robust later.

## Good next steps

- Add onboarding demo data for first-time users.
- Add a simple confirmation step before destructive restore flows.
- Improve report exports further with richer comparison tables.
- Consider a standalone export route if PDF reliability needs to be stronger.
