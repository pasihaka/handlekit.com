const fs = require('fs');
const path = require('path');
const GBP_DATA = require('./js/data.js');

const htmlFiles = [
  'index.html',
  'suspended.html',
  'disabled.html',
  'verification-failed.html',
  'appeal-denied.html',
  'evidence-checklist.html',
  'storefront-vs-service-area.html'
];

let errors = [];

function assert(condition, message) {
  if (!condition) errors.push(message);
}

// 1. Data Integrity Checks
const ruleIds = new Set();
GBP_DATA.RULES.forEach((rule, index) => {
  // no duplicate rule IDs
  assert(!ruleIds.has(rule.id), `Duplicate rule ID: ${rule.id}`);
  ruleIds.add(rule.id);

  // every rule has a valid priority
  assert(typeof rule.priority === 'number', `Rule ${rule.id} missing priority`);

  // assert referenced buckets
  if (rule.adds_issue_buckets) {
    rule.adds_issue_buckets.forEach(id => {
      assert(GBP_DATA.ISSUE_BUCKETS[id], `Rule ${rule.id} references missing issue bucket: ${id}`);
    });
  }

  if (rule.adds_evidence_items) {
    rule.adds_evidence_items.forEach(id => {
      assert(GBP_DATA.EVIDENCE_ITEMS[id], `Rule ${rule.id} references missing evidence item: ${id}`);
    });
  }

  if (rule.adds_actions) {
    rule.adds_actions.forEach(id => {
      assert(GBP_DATA.ACTION_STEPS[id], `Rule ${rule.id} references missing action step: ${id}`);
    });
  }

  if (rule.adds_warnings) {
    rule.adds_warnings.forEach(id => {
      assert(GBP_DATA.WARNINGS[id], `Rule ${rule.id} references missing warning: ${id}`);
    });
  }

  if (rule.adds_links) {
    rule.adds_links.forEach(id => {
      assert(GBP_DATA.OFFICIAL_LINKS[id], `Rule ${rule.id} references missing official link: ${id}`);
    });
  }
});


// Confirm at least one issue bucket is defined in the data file
assert(Object.keys(GBP_DATA.ISSUE_BUCKETS).length > 0, "No issue buckets defined");

// 2. HTML Checking
const disclaimerText = "This is preparation guidance, not a diagnosis or a guarantee of reinstatement.";

htmlFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) {
    // If we're building incrementally, we might just warn, but let's assert it must exist
    errors.push(`HTML file missing: ${file}`);
    return;
  }

  const content = fs.readFileSync(filePath, 'utf8');

  assert(content.includes('<title>'), `${file} missing <title> tag`);
  assert(content.includes('<meta name="description"'), `${file} missing meta description`);
  
  const expectedUrl = file === 'index.html' ? 'https://handlekit.com/gbp-triage/' : `https://handlekit.com/gbp-triage/${file}`;
  
  assert(content.includes(`<link rel="canonical" href="${expectedUrl}">`), `${file} missing exact canonical tag ${expectedUrl}`);
  assert(content.includes(`property="og:url" content="${expectedUrl}"`), `${file} missing exact Open Graph URL ${expectedUrl}`);
  assert(content.includes('property="og:'), `${file} missing Open Graph tags`);
  assert(content.includes('href="/gbp-triage/"'), `${file} missing internal link to /gbp-triage/ (homepage)`);
  assert(!content.includes('href="index.html"'), `${file} inconsistently links to index.html instead of /`);
  assert(content.includes('storefront-vs-service-area.html'), `${file} missing internal link to storefront-vs-service-area.html`);
  assert(content.includes(disclaimerText), `${file} missing strict disclaimer text`);
  assert(content.includes('<header class="site-header">'), `${file} missing consistent header`);
  assert(content.includes('<footer class="site-footer">'), `${file} missing consistent footer`);

  if (file === 'index.html') {
    assert(content.includes('<script type="application/ld+json">'), `${file} missing JSON-LD structured data`);
  }
});

if (errors.length > 0) {
  console.error("VALIDATION FAILED with " + errors.length + " errors:");
  errors.forEach(e => console.error(" - " + e));
  process.exit(1);
} else {
  console.log("VALIDATION PASSED!");
  process.exit(0);
}
