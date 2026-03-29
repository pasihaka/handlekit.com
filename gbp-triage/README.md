# Google Business Profile Suspension Triage Checker

A static, SEO-friendly web utility designed to help users identify potential missing evidence and common policy pitfalls before appealing a Google Business Profile suspension or disablement.

## Setup & Testing

This is a flat, static HTML/CSS/JS application that does not require a backend. 

**Important Note on Local Testing:**
Because this project utilizes root-relative subdirectory tagging (e.g., `href="/gbp-triage/"`), **you must serve the parent directory through a local static server to test the navigation correctly.**

Do **not** double-click to open `index.html` or internal pages directly into your browser via `file://`. Root-relative paths like `<a href="/gbp-triage/">` will resolve to your operating system's hard drive root, breaking navigation.

To run properly locally:
1. Ensure Node.js is installed.
2. From the **parent directory** of this folder, run: `npx serve .`
3. Open `http://localhost:3000/gbp-triage/` in your web browser.

## Handlekit Root Integration
This tool is designed to live at `https://handlekit.com/gbp-triage/`. 
- **Authority**: The root domain's `robots.txt` (`https://handlekit.com/robots.txt`) is the authoritative file for crawlers. 
- **Sitemap**: The root site must either include the triage sitemap in its sitemap index or reference `https://handlekit.com/gbp-triage/sitemap.xml` in the root `robots.txt`.

## Data Rules engine
The structure is built around declarative rules processing. Business rules are not hardcoded in `app.js`. The main decision logic is entirely data-driven through `js/data.js`.

## Validation
To test for structure and integrity logic, run:
`node validate.js`
