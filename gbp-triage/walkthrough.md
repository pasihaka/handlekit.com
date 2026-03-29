# GBP Triage Tool — Project Walkthrough

## What the tool does

This is a static, client-side web utility that helps users prepare evidence and understand likely risk areas before filing a Google Business Profile reinstatement appeal. It does not diagnose the exact reason for suspension and does not guarantee any outcome.

## Architecture

### Pages

Seven plain HTML files cover the four supported status types (suspended, disabled, verification failed, appeal denied), plus supporting reference pages. Each page carries its own canonical tag, `og:url`, and meta description. All pages use `twitter:card="summary"` — no image assets are referenced in the metadata.

### Rule data (`js/data.js`)

Business logic is defined as a declarative data structure, not as procedural code. The file exports an object (`GBP_DATA`) with these top-level keys:

- `ISSUE_BUCKETS` — named risk categories with titles, severity labels, and explanations
- `EVIDENCE_ITEMS` — document and photo types a user might gather
- `ACTION_STEPS` — ordered recommended steps
- `WARNINGS` — things to avoid
- `OFFICIAL_LINKS` — Google support links
- `RULES` — an array of rule objects

Each rule object uses a `when` field (a plain object mapping input names to allowed values), plus arrays of IDs that reference the other data sections. `app.js` evaluates these rules; no logic is embedded inside `data.js` itself.

### Evaluator (`js/app.js`)

`app.js` reads the user's form answers, iterates `GBP_DATA.RULES`, checks each rule's `when` conditions against the answers, and collects the union of all matching buckets, evidence items, actions, warnings, and links. Results are then sorted by priority and rendered into the DOM. The rendering code does not contain business-logic decisions; those live entirely in `data.js`.

### Validation (`validate.js`)

A Node.js script that checks:

- No duplicate rule IDs in `RULES`
- Every ID referenced in `adds_issue_buckets`, `adds_evidence_items`, `adds_actions`, `adds_warnings`, and `adds_links` exists in the corresponding data object
- Every HTML file has a `<title>`, meta description, matching canonical, matching `og:url`, disclaimer text, header, and footer
- `index.html` contains a JSON-LD block with the deployment URL
- No page links to `index.html` instead of `/gbp-triage/`
- All canonicals and `og:url` tags use the `https://handlekit.com/gbp-triage/` prefix

Run with: `node validate.js`

## Uncertainty framing

The tool uses probability-based language throughout. Phrases like "likely cause", "possible trigger", "may apply", and "this does not identify the exact reason" are intentional. The disclaimer "This is preparation guidance, not a diagnosis or a guarantee of reinstatement." appears on every page.

## Nuanced Evidence-Gap Logic

We replaced the simple "none yet" check with a sophisticated proof-strength evaluator.
- **Flag Derivation**: `app.js` now derives boolean flags (`hasCoreBusinessProof`, `hasStorefrontProof`, etc.) from selected evidence.
- **Evaluator Fix**: Updated the generic rule engine to correctly handle boolean `false` values, ensuring "missing proof" states trigger appropriate risks.
- **Specific Risk Rules**:
    - **Storefronts**: Trigger `evidence_gap` if storefront photos/signage are missing.
    - **SABs**: Trigger `evidence_gap` if vehicle branding OR relationship proof is missing.
    - **High Risk (Appeal Denied)**: Trigger `evidence_gap` if core registration/utility proof is missing.

## Final Logic Verification

The follow scenarios were manually verified in the tool:

````carousel
![Case 11: Storefront Gap](file:///C:/Users/Pasi/.gemini/antigravity/brain/3e4af8d1-cde4-4589-8502-8899d6bc0ee5/case_11_storefront_gap_1774797211624.png)
<!-- slide -->
![Case 12: SAB Gap](file:///C:/Users/Pasi/.gemini/antigravity/brain/3e4af8d1-cde4-4589-8502-8899d6bc0ee5/case_12_sab_gap_1774797256173.png)
<!-- slide -->
![Case 13: Appeal Denied Gap](file:///C:/Users/Pasi/.gemini/antigravity/brain/3e4af8d1-cde4-4589-8502-8899d6bc0ee5/case_13_appeal_denied_gap_1774797296353.png)
````

## Local testing & Production Deployment

### Local Testing
Because pages use root-relative subdirectory links (`href="/gbp-triage/"`), you must serve the **parent directory** through a local static server to test the navigation. 

1. From the parent directory of `gbp-triage`, run: `npx serve .`
2. Open `http://localhost:PORT/gbp-triage/`.

### Handlekit Integration
- **Authoritative robots.txt**: The file `https://handlekit.com/robots.txt` is the source of truth for all crawlers. The file inside `/gbp-triage/` is a portability artifact.
- **Sitemap Indexing**: The root site must expose a sitemap reference to `https://handlekit.com/gbp-triage/sitemap.xml`.
- **Domain Strategy**: All canonicals and social tags are hardcoded to `handlekit.com/gbp-triage/`.
