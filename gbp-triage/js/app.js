document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('triage-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // 1. Collect Answers
        const formData = new FormData(form);
        let userEvidence = formData.getAll('evidenceReady');
        if (userEvidence && userEvidence.length > 1 && userEvidence.includes('none yet')) {
            userEvidence = userEvidence.filter(val => val !== 'none yet');
        }

        const answers = {
            status: formData.get('status'),
            businessType: formData.get('businessType'),
            staffedHours: formData.get('staffedHours'),
            signage: formData.get('signage'),
            addressType: formData.get('addressType'),
            majorEdits: formData.get('majorEdits'),
            failedVerificationBefore: formData.get('failedVerificationBefore'),
            evidenceReady: userEvidence
        };

        // Deriving Boolean Flags for Evidence Strength
        const hasCore = userEvidence.includes('business registration / license') || userEvidence.includes('utility bill / lease');
        const hasStorefront = userEvidence.includes('storefront photos') || userEvidence.includes('signage photos');
        const hasSAB = userEvidence.includes('vehicle branding photos');
        const hasRel = userEvidence.includes('proof of relationship to the location');

        answers.hasCoreBusinessProof = hasCore;
        answers.hasStorefrontProof = hasStorefront;
        answers.hasServiceAreaProof = hasSAB;
        answers.hasRelationshipProof = hasRel;

        // 2. Generic Evaluator Engine
        const { ISSUE_BUCKETS, EVIDENCE_ITEMS, ACTION_STEPS, WARNINGS, RULES, OFFICIAL_LINKS } = window.GBP_DATA;
        
        // Use Sets to deduplicate items from matching rules
        const buckets = new Set();
        const evidence = new Set();
        const actions = new Set();
        const warnings = new Set();
        const links = new Set();

        // Sort rules by descending priority for evaluation
        const sortedRules = [...RULES].sort((a, b) => b.priority - a.priority);

        sortedRules.forEach(rule => {
            let matches = true;
            for (const key in rule.when) {
                const userVal = answers[key];
                const ruleVals = rule.when[key];
                
                if (Array.isArray(userVal)) {
                    // Checkbox array intersection
                    const intersects = userVal.some(val => ruleVals.includes(val));
                    if (!intersects) {
                        matches = false;
                        break;
                    }
                } else {
                    // Single choice
                    if ((userVal === undefined || userVal === null || userVal === '') || !ruleVals.includes(userVal)) {
                        matches = false;
                        break;
                    }
                }
            }

            if (matches) {
                if (rule.adds_issue_buckets) rule.adds_issue_buckets.forEach(id => buckets.add(id));
                if (rule.adds_evidence_items) rule.adds_evidence_items.forEach(id => evidence.add(id));
                if (rule.adds_actions) rule.adds_actions.forEach(id => actions.add(id));
                if (rule.adds_warnings) rule.adds_warnings.forEach(id => warnings.add(id));
                if (rule.adds_links) rule.adds_links.forEach(id => links.add(id));
            }
        });

        // 3. Render Results Safely & Defensively
        renderResultsPanel(buckets, evidence, actions, warnings, links, ISSUE_BUCKETS, EVIDENCE_ITEMS, ACTION_STEPS, WARNINGS, OFFICIAL_LINKS);
    });
});

function renderResultsPanel(bucketIds, evidenceIds, actionIds, warningIds, linkIds, ISSUE_BUCKETS, EVIDENCE_ITEMS, ACTION_STEPS, WARNINGS, OFFICIAL_LINKS) {
    const resultsArea = document.getElementById('results-area');
    resultsArea.innerHTML = '';
    
    let html = `
        <div class="results-panel">
            <div class="disclaimer-alert">
                <strong>Important:</strong> This is preparation guidance, not a diagnosis or a guarantee of reinstatement.
            </div>
    `;

    // Issue Buckets
    if (bucketIds.size > 0) {
        const sortedBucketIds = Array.from(bucketIds).sort((a, b) => ISSUE_BUCKETS[b].priority - ISSUE_BUCKETS[a].priority);
        html += `<div class="results-section"><h2>1. Likely Issue Buckets</h2><p class="section-intro">Based on your answers, these are possible triggers.</p><div class="issue-list">`;
        sortedBucketIds.forEach(id => {
            const b = ISSUE_BUCKETS[id];
            html += `
                <div class="card issue-card border-${b.severity === 'Fix now' ? 'red' : 'amber'}">
                    <h3>${b.title} <span class="severity-tag tag-${b.severity.replace(' ', '-').toLowerCase()}">${b.severity}</span></h3>
                    <p>${b.plain_explanation}</p>
                    <p class="safe-reasoning"><em>Why this may apply:</em> ${b.why_this_may_apply}</p>
                </div>
            `;
        });
        html += `</div></div>`;
    } else {
        html += `<div class="results-section"><h2>1. Likely Issue Buckets</h2><p>No immediate obvious triggers detected from these answers alone, but it is still important to review Google guidelines.</p></div>`;
    }

    // Evidence
    html += `<div class="results-section"><h2>2. What to gather before appeal</h2><p class="section-intro">Preparation guidance for your proof format.</p><ul class="evidence-list">`;
    if (evidenceIds.size > 0) {
        evidenceIds.forEach(id => {
            const e = EVIDENCE_ITEMS[id];
            html += `<li><span class="format-tag">${e.format}</span> ${e.label}</li>`;
        });
    } else {
        html += `<li>No specific additional evidence dynamically targeted. Prepare standard registration and utility proof.</li>`;
    }
    html += `</ul></div>`;

    // Actions
    html += `<div class="results-section"><h2>3. Recommended Action Order</h2><ol class="action-list">`;
    if (actionIds.size > 0) {
        const sortedActionIds = Array.from(actionIds).sort((a, b) => ACTION_STEPS[a].order - ACTION_STEPS[b].order);
        sortedActionIds.forEach(id => {
            html += `<li>${ACTION_STEPS[id].text}</li>`;
        });
    } else {
         html += `<li>Review standard guidelines.</li>`;
    }
    html += `</ol></div>`;

    // Warnings
    if (warningIds.size > 0) {
        html += `<div class="results-section"><h2>What Not To Do</h2><ul class="warning-list">`;
        warningIds.forEach(id => {
            html += `<li class="text-red"><strong>Avoid:</strong> ${WARNINGS[id].text}</li>`;
        });
        html += `</ul></div>`;
    }

    // Official Links
    html += `<div class="results-section"><h2>4. Official Google Paths</h2><ul class="official-links">`;
    if (linkIds.size > 0) {
        linkIds.forEach(id => {
            html += `<li><a href="${OFFICIAL_LINKS[id].url}" target="_blank" rel="noopener">${OFFICIAL_LINKS[id].label}</a></li>`;
        });
    } else {
        html += `<li><a href="${OFFICIAL_LINKS["GUIDELINES"].url}" target="_blank" rel="noopener">${OFFICIAL_LINKS["GUIDELINES"].label}</a></li>`;
    }
    html += `</ul></div>`;

    html += `</div>`; // end results-panel
    resultsArea.innerHTML = html;
    resultsArea.scrollIntoView({ behavior: 'smooth' });
}
