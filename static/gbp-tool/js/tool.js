const { evaluateTriage, normalizeAnswers } = window.TriageEngine;

const form = document.querySelector("#triage-form");
const resultsRoot = document.querySelector("#triage-results-root");
const announcement = document.querySelector("#tool-announcement");
const evidenceInputs = [...document.querySelectorAll('input[name="evidenceReady"]')];
const evidenceError = document.querySelector("#evidenceReady-error");

if (form && resultsRoot) {
  form.addEventListener("change", handleEvidenceExclusivity);
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!validateEvidenceGroup(true)) {
      return;
    }

    if (!form.reportValidity()) {
      return;
    }

    const answers = normalizeAnswers(new FormData(form));
    const results = evaluateTriage(answers);
    resultsRoot.hidden = false;
    resultsRoot.innerHTML = renderResults(results);
    announcement.textContent = `Results updated for ${results.statusLabel}. ${results.buckets.length} likely issue buckets and ${results.evidenceGroups.length} evidence sections shown.`;

    const targetHeading = document.querySelector("#results-heading");
    if (targetHeading) {
      targetHeading.focus();
    }
  });

  form.addEventListener("reset", () => {
    window.setTimeout(() => {
      clearEvidenceValidation();
      resultsRoot.hidden = true;
      resultsRoot.innerHTML = "";
      announcement.textContent = "Triage results cleared.";
    }, 0);
  });
}

function handleEvidenceExclusivity(event) {
  if (event.target.name !== "evidenceReady") {
    return;
  }

  const noneYetInput = evidenceInputs.find((input) => input.value === "none-yet");

  if (!noneYetInput) {
    return;
  }

  if (event.target.value === "none-yet" && event.target.checked) {
    evidenceInputs
      .filter((input) => input.value !== "none-yet")
      .forEach((input) => {
        input.checked = false;
      });
    validateEvidenceGroup(false);
    return;
  }

  if (event.target.value !== "none-yet" && event.target.checked) {
    noneYetInput.checked = false;
  }

  validateEvidenceGroup(false);
}

function validateEvidenceGroup(showMessage = false) {
  if (!evidenceInputs.length) {
    return true;
  }

  const hasSelection = evidenceInputs.some((input) => input.checked);
  const firstInput = evidenceInputs[0];

  if (hasSelection) {
    clearEvidenceValidation();
    return true;
  }

  if (!showMessage) {
    clearEvidenceValidation();
    return false;
  }

  firstInput.setCustomValidity("Select at least one evidence option.");
  firstInput.reportValidity();
  firstInput.setAttribute("aria-invalid", "true");

  if (evidenceError) {
    evidenceError.hidden = false;
  }

  return false;
}

function clearEvidenceValidation() {
  if (!evidenceInputs.length) {
    return;
  }

  const firstInput = evidenceInputs[0];
  firstInput.setCustomValidity("");
  firstInput.removeAttribute("aria-invalid");

  if (evidenceError) {
    evidenceError.hidden = true;
  }
}

function renderResults(results) {
  return `
    <section class="results-panel" aria-labelledby="results-heading">
      <div class="results-header">
        <p class="eyebrow">Structured output</p>
        <h3 id="results-heading" tabindex="-1">Preparation guidance for ${results.statusLabel}</h3>
        <p>This does not prove the reason for the restriction. It highlights patterns that may deserve review before the official next step.</p>
      </div>

      <section class="results-section" aria-labelledby="buckets-heading">
        <div class="section-heading">
          <h4 id="buckets-heading">1. Likely issue buckets</h4>
          <p>These are likely review areas based on your answers, not an exact diagnosis.</p>
        </div>
        <div class="bucket-grid">
          ${results.buckets.map(renderBucket).join("")}
        </div>
      </section>

      <section class="results-section" aria-labelledby="evidence-heading">
        <div class="section-heading">
          <h4 id="evidence-heading">2. What to gather before appeal</h4>
          <p>This checklist is preparation guidance, not a guarantee of reinstatement.</p>
        </div>
        <div class="evidence-groups">
          ${results.evidenceGroups.map(renderEvidenceGroup).join("")}
        </div>
      </section>

      <section class="results-section" aria-labelledby="actions-heading">
        <div class="section-heading">
          <h4 id="actions-heading">3. Recommended action order</h4>
        </div>
        <ol class="ordered-list">
          ${results.actions
            .map((action) => `<li>${action.label}</li>`)
            .join("")}
        </ol>
      </section>

      <section class="results-section" aria-labelledby="links-heading">
        <div class="section-heading">
          <h4 id="links-heading">4. Official next-step links</h4>
        </div>
        <ul class="link-list">
          ${results.officialLinks.map(renderLink).join("")}
        </ul>
      </section>

      <section class="results-section" aria-labelledby="warnings-heading">
        <div class="section-heading">
          <h4 id="warnings-heading">5. What not to do</h4>
        </div>
        <ul class="warning-list">
          ${results.warnings.map((warning) => `<li>${warning.label}</li>`).join("")}
        </ul>
      </section>
    </section>
  `;
}

function renderBucket(bucket) {
  const severityClass = bucket.severity.toLowerCase().replace(/\s+/g, "-");
  return `
    <article class="bucket-card">
      <div class="bucket-card__header">
        <h5>${bucket.title}</h5>
        <span class="severity severity--${severityClass}">${bucket.severity}</span>
      </div>
      <p>${bucket.explanation}</p>
      <p class="why-line"><strong>Why this may apply:</strong> ${bucket.why}</p>
    </article>
  `;
}

function renderEvidenceGroup(group) {
  return `
    <article class="evidence-card">
      <h5>${group.category}</h5>
      <ul class="evidence-list">
        ${group.items
          .map(
            (item) => `
              <li class="evidence-list__item">
                <div class="evidence-list__header">
                  <span>${item.label}</span>
                  <span class="state-tag ${
                    item.ready ? "state-tag--ready" : "state-tag--todo"
                  }">${item.ready ? "Ready" : "Gather"}</span>
                </div>
                <p>${item.description}</p>
                <p class="why-line"><strong>Why this is showing:</strong> ${item.reasons[0]}</p>
              </li>
            `,
          )
          .join("")}
      </ul>
    </article>
  `;
}

function renderLink(link) {
  return `
    <li class="link-list__item">
      <a href="${link.url}" target="_blank" rel="noopener noreferrer">${link.title}</a>
      <p>${link.description}</p>
    </li>
  `;
}
