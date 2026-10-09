# Renovation Tracker maintenance assignment

Maintain Renovation Tracker: https://renovation-tracker-home.lemonyrain.chatgpt.site/

First verify it works in Chrome and ChatGPT. Track bugs in BUGS.md and prepare tested fixes. The ChatGPT blank-page/access issue is still open; Chrome is confirmed working by the user and production HTTP 200 responses. Do not report both browsers verified until the real ChatGPT embedded browser renders and operates the project.

Ask the user before sending contractor messages, approving any actual spending, or changing anyone's access. Test spending approvals only against isolated sample data. Preserve existing project records and Site privacy. Never reset production data as a troubleshooting shortcut.

## Implementation and verification

Source: /workspace/renovations-codex. App: vanilla JS UI, Node local server, Cloudflare Worker production API, D1 workspace records, R2 receipt files. Site project ID is preserved in .openai/hosting.json. Owner identity is configured privately through RENOVATION_OWNER_EMAIL in Sites; do not put its value or credentials into source or handoff notes.

Run npm test and npm run build. Tests cover budgets, quote payment offsets, role filtering, dependencies, project archives, invitations, receipt confirmation, configured owner recovery and embedded sign-in behavior. tests/browser.mjs and tests/receipt-browser.mjs exercise local flows with system Chromium. Use isolated DATA_DIR for any tests that modify data. Recheck current production logs when diagnosing user-reported failures. The existing browser tests do not establish real ChatGPT compatibility.

Follow Sites hosting instructions for source synchronization, credentials, deployment and terminal status verification. Plugin scripts were unavailable in this environment; prior publication used the source repository credential in hidden stdin, a Worker build archive with .openai/hosting.json, dist and drizzle, then native private deployment. Never expose or save credential tokens. Preserve the existing project and audience.

## Boundaries

The current tracker sends invitation emails only when the user chooses its email-client link. Invitees also require private Site access. Role previews are read-only. Pending expenses reserve budget; accepted quotes reserve only their unpaid balance. Receipt OCR assets are served locally with the app; extraction always needs confirmation.

## Notifications

Report meaningful failures, completed tested fixes or decisions that require the user. Do not repeatedly announce an unchanged browser failure. Bring a concrete fix and its evidence for review. Do not claim an active Dot or background monitor exists unless its creation is confirmed.
