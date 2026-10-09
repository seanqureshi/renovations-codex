# Renovation Tracker assumptions

- Amounts are US dollars. The sample is $48,000 kitchen + $29,000 primary bath + $8,000 contingency = $85,000.
- Logged expenses, including pending approvals, reserve budget immediately. Accepted quotes reserve their unpaid balance; expenses linked to a quote reduce that balance so spending is not counted twice.
- Warnings use spending plus unpaid commitments and appear above 90% of a room or category budget. Contingency covers room overruns automatically. Category limits and the room cap are tracked separately.
- Owner and partner have full project access; either can approve spending. Contractors see and update status/notes only for their assigned tasks. Unfinished dependencies prevent completion; hidden prerequisite work is shown only as a blocker count.
- Projects are saved and can be switched. People and invitations belong to the household workspace. Starting a project archives the previous project rather than deleting it.
- Receipt reading supports English JPG/PNG/WebP images under 10 MB. Every extraction is an editable draft; confirmation creates a pending expense. OCR assets are served with the app.
- Role previews are read-only. Hosted sign-in uses ChatGPT identity, and the owner is bound to the private Site owner configured in Sites; an invitation is bound to the invited email. The owner must also grant invited people access in the private Site's sharing controls. Sending an invitation opens the household's email app; it does not send automatically.
- Sample contractors and quotes are fictional; the kitchen image is generated illustration. Sample members demonstrate roles, not real invitations.

## Run and test

`npm install`, then `npm start` (http://localhost:3000). Local development uses a sample owner identity; production requires authenticated identity headers. Data is saved in SQLite under `.data/`; hosted builds use D1 and R2. `npm test` checks domain calculations, permissions, dependencies, invitations, receipt drafts, and project preservation. `node tests/browser.mjs` and `node tests/receipt-browser.mjs` exercise browser flows using system Chromium.
