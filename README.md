# Renovation Tracker

Source and code review repository for the app published at https://renovation-tracker-home.lemonyrain.chatgpt.site/.

## Run locally

Use Node.js 24 or newer (the local server uses Node's SQLite API).

```sh
npm ci
npm test
npm run build
npm start
```

Open http://localhost:3000. Local development uses a sample owner and stores data under ignored `.data/`. The included kitchen and primary bath plan totals $85,000, including $8,000 contingency.

`npm test` covers budgets, quote payments, permissions, task dependencies, project archives, invitations, receipt confirmation and sign-in recovery. Browser tests require system Chromium at `/usr/bin/chromium` and a running local server; run `node tests/browser.mjs` and `node tests/receipt-browser.mjs` against isolated sample data because they create and approve test expenses.

## Publication and data

Production uses a Cloudflare Worker, D1 and R2 through Sites. `.openai/hosting.json` preserves the existing Site identity. `RENOVATION_OWNER_EMAIL` is configured privately through Sites; never commit its value or credentials. `npm run build` creates the Worker and static assets, including the receipt OCR reader and English language data.

GitHub is the source review repository. Pushing or merging here does not automatically publish to Sites; no deployment automation is configured. Publish reviewed changes separately through Sites while preserving its existing identity and private audience. Production database records and receipt files remain on the existing Site and are not stored in this repository.

## Known status and maintenance

Chrome is confirmed working by the user and production HTTP 200 responses. The real ChatGPT embedded browser still crashes or fails to load; automated sign-in tests do not prove that issue resolved. See [bugs](BUGS.md), [assumptions](ASSUMPTIONS.md) and the [Dot handoff](DOT_HANDOFF.md). No Dot has been activated by this repository import.

Ask the owner before sending contractor messages, approving actual spending, or changing anyone's access. Use isolated sample data for testing and preserve production records.
