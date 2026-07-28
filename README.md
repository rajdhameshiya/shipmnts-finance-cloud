# AP Automation - Shipmnts Finance Cloud Prototype

## Setup
npm install
npm start
Opens at http://localhost:3003

For real extraction, copy `.env.example` to `.env`.
Text PDFs can be parsed locally. For image bills or higher quality extraction, set `OPENAI_API_KEY`.

## Demo Flows

### Flow 1 - Discrepancy Detection
1. Open inbox (default page)
2. Click "Upload bill for AI processing"
3. Choose a sample PDF or image bill
4. Click "Run AI processing"
5. The processed bill is automatically added to the inbox and opened
6. Review extracted fields, confidence, job match, and accrual discrepancies
7. Resolve the dispute from the bill detail or Exceptions page
8. Approve the resolved bill so it moves into Drafts
9. Open Drafts, select one or many bills, and move them into Payment Process

Clean upload note: if the uploaded file name contains `clean`, `matched`, `ok`, `valid`, or `approved`, the simulated AI validation treats it as a clean bill and moves it directly to Drafts.

### Flow 2 - Clean Bill Approval
1. Select "Blue Dart Logistics" invoice (second row)
2. All charges match - no discrepancies
3. TDS calculated automatically
4. Click "Approve bill" - bill posted

### Flow 3 - Duplicate Blocked
1. Select "Hapag-Lloyd" invoice (fourth row)
2. Agent blocked it as a duplicate
3. Go to Dashboard - see blocked count

## Role Switcher
Use the role switcher at the bottom of the sidebar to toggle between:
- AP Executive (default - full access)
- Finance Head (dashboard default - approval focus)
- Ops Executive (exceptions focus - no-accrual confirmations)

## Deploy to Vercel

1. Import this GitHub repository into Vercel. The included `vercel.json` configures the Vite build, API functions, and SPA routes.
2. In the Vercel project, create a private Blob store and connect it to the project. Vercel adds `BLOB_READ_WRITE_TOKEN` automatically.
3. Add `OPENAI_API_KEY` under Project Settings > Environment Variables. Optionally add `OPENAI_MODEL`; the default is `gpt-4o-mini`.
4. Deploy, then verify `/api/health` reports `openai-enabled` before uploading an invoice.

Uploaded source invoices are stored in private Vercel Blob storage and displayed through `/api/files`. Bill workflow data is persisted in the current browser using local storage.

The server upload endpoint accepts PDF and image invoices up to 4 MB, keeping requests within Vercel's function body limit.

## Notes
- Seed data is defined in `src/data/seed.ts`.
- Local development uses the Express server; Vercel uses the functions in `api/`.
- All bill states are interactive.
