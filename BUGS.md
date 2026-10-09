# Renovation Tracker bugs

## RT-001 — ChatGPT embedded browser cannot open the workspace

Status: Open. Priority: High.

Evidence: Latest production GET /api/state succeeds with HTTP 200 in Chrome (Chrome 150/macOS). The ChatGPT browser rendering path (Chrome 119/Windows, Cloudflare browser rendering) still receives HTTP 403. The user reports a blank page and repeated crashes in ChatGPT, with no visible sign-in account or recovery screen. The HTTP 403 may be one symptom; a rendering/session problem has not been ruled out. Do not mark this fixed based on unit tests or successful deployment alone.

Changes already published: configured owner email, repair of incorrectly initialized owner records without deleting project data, a visible sign-in page instead of automatic redirects, and account-specific access error with a top-level ChatGPT sign-in link.

Next checks: identify the email displayed on the ChatGPT error screen; compare trusted identity behavior with Chrome; test the real embedded sign-in flow. Do not grant owner access based on browser headers, user-agent, or an unverified identity. Any access-policy change requires the user's approval.

Acceptance: The user's ChatGPT browser displays the real project, opens all owner views, and retains authorized writes without exposing finances or other tasks to contractors.

## RT-002 — Initial owner record blocked the actual owner

Status: Fixed for Chrome; regression tests pass.

Cause: Initial owner identity depended on the first authenticated request. Fix: explicitly bind the owner to the owner email configured privately in Sites, prevent unrelated initial requests from creating the project, and repair the original owner binding while preserving project records.
