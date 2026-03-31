(() => {
  const form = document.getElementById("triage-form");
  const runButton = document.getElementById("run-triage");
  const resultsRoot = document.getElementById("triage-results-root");
  const announcement = document.getElementById("tool-announcement");
  const evidenceError = document.getElementById("evidenceReady-error");
  const evidenceInputs = Array.from(document.querySelectorAll('input[name="evidenceReady"]'));

  if (!form || !runButton || !resultsRoot || !announcement) {
    return;
  }

  const issueBuckets = {
    "address-eligibility-risk": {
      title: "Address eligibility risk",
      description:
        "This usually means the listed address may not match the kind of location Google expects for this type of profile.",
    },
    "signage-storefront-evidence-risk": {
      title: "Signage / storefront evidence risk",
      description:
        "This usually means the listing may be hard to verify as a real customer-facing location with permanent branding.",
    },
    "service-area-representation-risk": {
      title: "Service-area representation risk",
      description:
        "This usually means the public setup may not cleanly match a service-area or hybrid operating model.",
    },
    "recent-edit-profile-change-risk": {
      title: "Recent-edit / profile-change risk",
      description:
        "This usually means recent major edits may have triggered a fresh review or a mismatch with older evidence.",
    },
    "verification-mismatch-risk": {
      title: "Verification mismatch risk",
      description:
        "This usually means the profile details, documents, photos, or verification method may not be lining up cleanly.",
    },
    "ownership-access-issue": {
      title: "Ownership / access issue",
      description:
        "This usually means the next step may depend on proving business control, business legitimacy, or the relationship to the location.",
    },
    "evidence-gap-before-appeal": {
      title: "Evidence gap before appeal",
      description:
        "This usually means the next appeal or verification attempt may be weak unless the document and photo set is improved first.",
    },
    "profile-consistency-review": {
      title: "Profile consistency review",
      description:
        "No single issue stands out from the answers alone, so the safest move is a careful consistency review before using the official path.",
    },
  };

  const evidenceCatalog = {
    "business-registration": {
      label: "Business registration or license",
      category: "Documents",
      description: "Use the clearest official business proof you have.",
    },
    "utility-bill-lease": {
      label: "Utility bill or lease for the listed location",
      category: "Documents",
      description: "Use documents that connect the business to the real location.",
    },
    "storefront-photos": {
      label: "Current exterior and interior storefront photos",
      category: "Photos",
      description: "Show the actual location as a customer would encounter it.",
    },
    "signage-photos": {
      label: "Permanent signage photos",
      category: "Photos",
      description: "Include clear branding visible at the location.",
    },
    "vehicle-branding-photos": {
      label: "Vehicle branding photos",
      category: "Photos",
      description: "Useful when the business operates in the field instead of a public storefront.",
    },
    "website-match": {
      label: "Website with matching business details",
      category: "Consistency",
      description: "The business name, address, phone, and services should line up cleanly.",
    },
    "local-phone": {
      label: "Local phone number that matches public business details",
      category: "Consistency",
      description: "Use the number shown consistently across the profile and website when possible.",
    },
    "location-relationship-proof": {
      label: "Proof of relationship to the location",
      category: "Location proof",
      description: "Use documents that show the business really operates from or controls the location.",
    },
    "staff-at-location-proof": {
      label: "Proof the location is staffed during stated hours",
      category: "Location proof",
      description: "Useful when a public storefront or hybrid address is claimed.",
    },
    "service-area-proof": {
      label: "Service-area proof that matches real operations",
      category: "Service-area proof",
      description: "Use job photos, service records, or other proof that supports the stated operating area.",
    },
    "ownership-authorization": {
      label: "Ownership or manager authorization proof",
      category: "Ownership proof",
      description: "Useful when account control or business relationship needs to be clarified.",
    },
    "video-verification-setup": {
      label: "Video verification proof or walkthrough plan",
      category: "Verification evidence",
      description: "Prepare the business, location, tools, and signage evidence needed for a clean video submission.",
    },
  };

  const actionSteps = {
    "pause-edits": "Stop making more profile edits while you review eligibility and evidence gaps.",
    "review-eligibility":
      "Check whether the location setup and business type look eligible under Google's current rules.",
    "confirm-business-model":
      "Confirm whether this should be a storefront, service-area business, or hybrid setup.",
    "gather-core-evidence":
      "Gather matching documents and current photos before another appeal or verification attempt.",
    "confirm-consistency":
      "Confirm your website, address, phone, and public branding all match the listing.",
    "prepare-service-area-proof":
      "Prepare service-area proof that matches how the business really operates.",
    "prepare-verification-evidence":
      "Prepare the exact photos, documents, or video evidence most likely to be requested next.",
    "review-denial-gap":
      "Review what was missing or inconsistent before resubmitting anything after an appeal denial.",
    "confirm-ownership":
      "Collect ownership, manager, and location relationship proof before using the next official path.",
    "use-correct-google-path":
      "Use the correct official Google appeal or verification path for the current status.",
  };

  const warningLabels = {
    "no-repeat-appeals":
      "Do not submit repeated appeals before fixing obvious eligibility or evidence gaps.",
    "no-mismatched-docs":
      "Do not upload documents or screenshots that show a different name, address, phone, or business model.",
    "no-virtual-office-storefront":
      "Do not use a virtual office, mailbox, or similar setup as if it were a staffed storefront.",
    "no-more-edits":
      "Do not keep editing key business details while troubleshooting unless an official step specifically requires it.",
    "no-hidden-address-confusion":
      "Do not present a service-area business like a public storefront if customers are not served there.",
    "no-staged-photos":
      "Do not upload photos that do not clearly match the real location, signage, staff setup, or service model.",
    "no-blind-resubmission":
      "Do not resubmit blindly after an appeal denial without improving the evidence set first.",
  };

  const officialLinks = {
    general: [
      {
        title: "Google Business Profile policies",
        url: "https://support.google.com/business/answer/13763036?hl=en",
        description: "Review the baseline eligibility and representation rules first.",
      },
      {
        title: "Ownership and access help",
        url: "https://support.google.com/business/answer/3403100?hl=en",
        description: "Useful when control of the listing or business relationship needs to be proved.",
      },
    ],
    suspended: [
      {
        title: "Suspension appeal path",
        url: "https://support.google.com/business/answer/4569145?hl=en",
        description: "Use this after reviewing eligibility and gathering matching evidence.",
      },
    ],
    disabled: [
      {
        title: "Disabled profile help",
        url: "https://support.google.com/business/answer/4569145?hl=en",
        description: "Use the official disabled-profile guidance that fits this status.",
      },
    ],
    verification_failed: [
      {
        title: "Verification troubleshooting",
        url: "https://support.google.com/business/answer/2566416?hl=en",
        description: "Use the verification route instead of a suspension appeal if that is the real issue.",
      },
      {
        title: "Video verification help",
        url: "https://support.google.com/business/answer/14271705?hl=en",
        description: "Useful when Google is asking for video evidence of the business and location.",
      },
    ],
    appeal_denied: [
      {
        title: "Appeal review guidance",
        url: "https://support.google.com/business/answer/13597551?hl=en",
        description: "Review the official appeal flow before sending more evidence.",
      },
    ],
  };

  const statusLabels = {
    suspended: "Suspended",
    disabled: "Disabled",
    verification_failed: "Verification failed",
    appeal_denied: "Appeal denied",
  };

  const riskyAddressTypes = new Set(["shared_office", "coworking", "virtual_office", "mailbox"]);
  const severityRank = { "Fix now": 3, Review: 2, "Possible issue": 1 };

  function isAddressBusiness(answers) {
    return answers.businessType === "storefront" || answers.businessType === "hybrid";
  }

  function normalizeAnswers() {
    const formData = new FormData(form);
    return {
      status: formData.get("status"),
      businessType: formData.get("businessType"),
      staffedHours: formData.get("staffedHours"),
      signage: formData.get("signage"),
      addressType: formData.get("addressType"),
      recentEdits: formData.get("recentEdits"),
      failedVerificationBefore: formData.get("failedVerificationBefore"),
      evidenceReady: formData.getAll("evidenceReady"),
    };
  }

  function clearEvidenceValidation() {
    if (!evidenceInputs.length) {
      return;
    }

    evidenceInputs[0].setCustomValidity("");
    evidenceInputs[0].removeAttribute("aria-invalid");
    if (evidenceError) {
      evidenceError.hidden = true;
    }
  }

  function validateEvidence() {
    const hasSelection = evidenceInputs.some((input) => input.checked);
    if (hasSelection) {
      clearEvidenceValidation();
      return true;
    }

    evidenceInputs[0].setCustomValidity("Select at least one evidence option.");
    evidenceInputs[0].reportValidity();
    evidenceInputs[0].setAttribute("aria-invalid", "true");
    if (evidenceError) {
      evidenceError.hidden = false;
    }
    return false;
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
    }

    if (event.target.value !== "none-yet" && event.target.checked) {
      noneYetInput.checked = false;
    }

    if (evidenceInputs.some((input) => input.checked)) {
      clearEvidenceValidation();
    }
  }

  function addFinding(findings, id, severity, score, why) {
    const current = findings.get(id) || {
      id,
      title: issueBuckets[id].title,
      explanation: issueBuckets[id].description,
      severity,
      severityLevel: severityRank[severity],
      score: 0,
      reasons: [],
    };

    current.score += score;
    if (severityRank[severity] > current.severityLevel) {
      current.severity = severity;
      current.severityLevel = severityRank[severity];
    }
    current.reasons.push(why);
    findings.set(id, current);
  }

  function addEvidence(evidenceMap, answers, id, reason) {
    const item = evidenceCatalog[id];
    if (!item) {
      return;
    }

    const current = evidenceMap.get(id) || {
      id,
      label: item.label,
      category: item.category,
      description: item.description,
      ready: answers.evidenceReady.includes(id),
      reasons: [],
    };
    current.ready = answers.evidenceReady.includes(id);
    if (!current.reasons.includes(reason)) {
      current.reasons.push(reason);
    }
    evidenceMap.set(id, current);
  }

  function addAction(actionScores, id, score) {
    actionScores.set(id, Math.max(actionScores.get(id) || 0, score));
  }

  function evaluate(answers) {
    const findings = new Map();
    const evidenceMap = new Map();
    const actionScores = new Map();
    const warningSet = new Set(["no-mismatched-docs"]);

    if (isAddressBusiness(answers) && answers.staffedHours === "no") {
      addFinding(
        findings,
        "address-eligibility-risk",
        "Fix now",
        10,
        "You selected a storefront or hybrid setup, but the listed address is not staffed during stated hours.",
      );
      addAction(actionScores, "review-eligibility", 90);
      addAction(actionScores, "confirm-business-model", 84);
      addAction(actionScores, "gather-core-evidence", 82);
      warningSet.add("no-virtual-office-storefront");
      warningSet.add("no-more-edits");
    } else if (isAddressBusiness(answers) && answers.staffedHours === "not_sure") {
      addFinding(
        findings,
        "address-eligibility-risk",
        "Review",
        8,
        "You are not sure whether the listed address is staffed during stated hours, which can create eligibility uncertainty.",
      );
      addAction(actionScores, "review-eligibility", 84);
      addAction(actionScores, "confirm-business-model", 78);
      warningSet.add("no-more-edits");
    }

    if (riskyAddressTypes.has(answers.addressType)) {
      addFinding(
        findings,
        "address-eligibility-risk",
        "Fix now",
        12,
        "You selected a shared-office, coworking, virtual-office, or mailbox-style address, which often creates location eligibility risk.",
      );
      addAction(actionScores, "review-eligibility", 95);
      addAction(actionScores, "confirm-business-model", 88);
      addAction(actionScores, "gather-core-evidence", 85);
      warningSet.add("no-virtual-office-storefront");
      warningSet.add("no-more-edits");
    } else if (answers.addressType === "not_sure") {
      addFinding(
        findings,
        "address-eligibility-risk",
        "Review",
        5,
        "You are not sure what type of address is on the listing, so location eligibility is worth reviewing first.",
      );
      addAction(actionScores, "review-eligibility", 76);
      addAction(actionScores, "confirm-business-model", 74);
    }

    if (isAddressBusiness(answers) && answers.signage === "no") {
      addFinding(
        findings,
        "signage-storefront-evidence-risk",
        "Fix now",
        9,
        "You selected a storefront or hybrid setup, but you do not have permanent signage visible at the location.",
      );
      addAction(actionScores, "gather-core-evidence", 86);
      addAction(actionScores, "prepare-verification-evidence", 80);
      warningSet.add("no-staged-photos");
    } else if (isAddressBusiness(answers) && answers.signage === "not_sure") {
      addFinding(
        findings,
        "signage-storefront-evidence-risk",
        "Review",
        6,
        "You are not sure whether the location has permanent signage, so storefront evidence may be weak.",
      );
      addAction(actionScores, "gather-core-evidence", 78);
      addAction(actionScores, "prepare-verification-evidence", 72);
      warningSet.add("no-staged-photos");
    }

    if (answers.businessType === "service_area") {
      addFinding(
        findings,
        "service-area-representation-risk",
        "Review",
        6,
        "You selected a service-area business, so the public setup needs to match a business that serves customers away from a public storefront.",
      );
      addAction(actionScores, "confirm-business-model", 82);
      addAction(actionScores, "prepare-service-area-proof", 80);
      addAction(actionScores, "confirm-consistency", 78);
      warningSet.add("no-hidden-address-confusion");
    } else if (answers.businessType === "hybrid") {
      addFinding(
        findings,
        "service-area-representation-risk",
        "Possible issue",
        4,
        "You selected a hybrid business, so both the public storefront evidence and the service-area setup need to be consistent.",
      );
      addAction(actionScores, "confirm-business-model", 74);
      addAction(actionScores, "prepare-service-area-proof", 72);
    }

    if (answers.recentEdits === "yes") {
      addFinding(
        findings,
        "recent-edit-profile-change-risk",
        "Review",
        7,
        "You said major profile edits were made recently, which can trigger review or create a mismatch with older evidence.",
      );
      addAction(actionScores, "pause-edits", 88);
      addAction(actionScores, "confirm-consistency", 80);
      warningSet.add("no-more-edits");
    } else if (answers.recentEdits === "not_sure") {
      addFinding(
        findings,
        "recent-edit-profile-change-risk",
        "Possible issue",
        4,
        "You are not sure whether recent edits happened, so a quick profile-history check is still worth doing.",
      );
      addAction(actionScores, "pause-edits", 72);
    }

    if (answers.failedVerificationBefore === "yes") {
      addFinding(
        findings,
        "verification-mismatch-risk",
        "Review",
        8,
        "You said verification has already failed before, which often points to a mismatch between the listing and the evidence being used.",
      );
      addAction(actionScores, "prepare-verification-evidence", 88);
      addAction(actionScores, "confirm-consistency", 82);
      warningSet.add("no-staged-photos");
    }

    if (answers.status === "verification_failed") {
      addFinding(
        findings,
        "verification-mismatch-risk",
        "Review",
        6,
        "The current status is verification failed, so the next step is usually evidence quality and verification-path alignment rather than a generic appeal.",
      );
      addAction(actionScores, "prepare-verification-evidence", 92);
      addAction(actionScores, "confirm-consistency", 86);
      addAction(actionScores, "use-correct-google-path", 84);
    }

    if (answers.status === "disabled") {
      addFinding(
        findings,
        "ownership-access-issue",
        "Review",
        7,
        "Disabled status often requires a careful review of business legitimacy, ownership, and listing control before the official next step.",
      );
      addAction(actionScores, "confirm-ownership", 94);
      addAction(actionScores, "review-eligibility", 84);
      addAction(actionScores, "use-correct-google-path", 82);
      warningSet.add("no-repeat-appeals");
    }

    if ((answers.status === "appeal_denied" || answers.status === "disabled") && !answers.evidenceReady.includes("business-registration")) {
      addFinding(
        findings,
        "ownership-access-issue",
        "Review",
        6,
        "You do not yet have business registration or license evidence marked ready, which can weaken ownership or legitimacy proof.",
      );
      addAction(actionScores, "confirm-ownership", 88);
      addAction(actionScores, "gather-core-evidence", 82);
    }

    if (isAddressBusiness(answers) && !answers.evidenceReady.includes("location-relationship-proof")) {
      addFinding(
        findings,
        "ownership-access-issue",
        "Review",
        6,
        "You have not marked proof of relationship to the location as ready, which can matter when the listing uses a public address.",
      );
      addAction(actionScores, "confirm-ownership", 80);
      addAction(actionScores, "gather-core-evidence", 78);
    }

    if (answers.evidenceReady.includes("none-yet")) {
      addFinding(
        findings,
        "evidence-gap-before-appeal",
        "Fix now",
        11,
        "You said no evidence is ready yet, so the next submission is likely to be weak unless you prepare documents and photos first.",
      );
      addAction(actionScores, "gather-core-evidence", 96);
      addAction(actionScores, "confirm-consistency", 82);
      warningSet.add("no-repeat-appeals");
    } else if (answers.evidenceReady.length <= 2) {
      addFinding(
        findings,
        "evidence-gap-before-appeal",
        "Review",
        7,
        "You only marked a small number of evidence items as ready, so the evidence set may still be thin for appeal or verification.",
      );
      addAction(actionScores, "gather-core-evidence", 84);
      addAction(actionScores, "confirm-consistency", 76);
      warningSet.add("no-repeat-appeals");
    }

    if (answers.status === "appeal_denied") {
      addFinding(
        findings,
        "evidence-gap-before-appeal",
        "Fix now",
        8,
        "An appeal denial usually means the next move should be a stronger evidence set, not a faster resubmission.",
      );
      addAction(actionScores, "review-denial-gap", 98);
      addAction(actionScores, "gather-core-evidence", 94);
      addAction(actionScores, "use-correct-google-path", 88);
      warningSet.add("no-blind-resubmission");
      warningSet.add("no-repeat-appeals");
    }

    if (answers.status === "suspended" || answers.status === "disabled" || answers.status === "appeal_denied") {
      addEvidence(evidenceMap, answers, "business-registration", "These are common starting points when the profile is already restricted or an appeal has stalled.");
      addEvidence(evidenceMap, answers, "website-match", "These are common starting points when the profile is already restricted or an appeal has stalled.");
      addEvidence(evidenceMap, answers, "local-phone", "These are common starting points when the profile is already restricted or an appeal has stalled.");
      addEvidence(evidenceMap, answers, "ownership-authorization", "These are common starting points when the profile is already restricted or an appeal has stalled.");
    }

    if (answers.businessType === "storefront" || answers.businessType === "hybrid") {
      addEvidence(evidenceMap, answers, "storefront-photos", "Address-based businesses usually need clear location and signage evidence.");
      addEvidence(evidenceMap, answers, "signage-photos", "Address-based businesses usually need clear location and signage evidence.");
      addEvidence(evidenceMap, answers, "utility-bill-lease", "Address-based businesses usually need clear location and signage evidence.");
      addEvidence(evidenceMap, answers, "location-relationship-proof", "Address-based businesses usually need clear location and signage evidence.");
    }

    if (answers.businessType === "service_area") {
      addEvidence(evidenceMap, answers, "business-registration", "Service-area businesses usually need proof that the operating model matches the listing setup.");
      addEvidence(evidenceMap, answers, "website-match", "Service-area businesses usually need proof that the operating model matches the listing setup.");
      addEvidence(evidenceMap, answers, "local-phone", "Service-area businesses usually need proof that the operating model matches the listing setup.");
      addEvidence(evidenceMap, answers, "service-area-proof", "Service-area businesses usually need proof that the operating model matches the listing setup.");
      addEvidence(evidenceMap, answers, "vehicle-branding-photos", "Service-area businesses usually need proof that the operating model matches the listing setup.");
    }

    if (answers.businessType === "hybrid") {
      addEvidence(evidenceMap, answers, "service-area-proof", "Hybrid businesses often need both storefront evidence and service-area proof.");
      addEvidence(evidenceMap, answers, "vehicle-branding-photos", "Hybrid businesses often need both storefront evidence and service-area proof.");
    }

    if (isAddressBusiness(answers) && (answers.staffedHours === "no" || answers.staffedHours === "not_sure")) {
      addEvidence(evidenceMap, answers, "staff-at-location-proof", "If the staffing setup is unclear, location evidence becomes more important.");
      addEvidence(evidenceMap, answers, "location-relationship-proof", "If the staffing setup is unclear, location evidence becomes more important.");
    }

    if (isAddressBusiness(answers) && (answers.signage === "no" || answers.signage === "not_sure")) {
      addEvidence(evidenceMap, answers, "storefront-photos", "If signage is missing or uncertain, current photo evidence becomes a priority.");
      addEvidence(evidenceMap, answers, "signage-photos", "If signage is missing or uncertain, current photo evidence becomes a priority.");
    }

    if (answers.status === "verification_failed" || answers.failedVerificationBefore === "yes") {
      addEvidence(evidenceMap, answers, "video-verification-setup", "Repeated verification friction usually calls for tighter evidence and a cleaner verification submission.");
      addEvidence(evidenceMap, answers, "website-match", "Repeated verification friction usually calls for tighter evidence and a cleaner verification submission.");
      addEvidence(evidenceMap, answers, "local-phone", "Repeated verification friction usually calls for tighter evidence and a cleaner verification submission.");
    }

    if (riskyAddressTypes.has(answers.addressType)) {
      addEvidence(evidenceMap, answers, "utility-bill-lease", "Riskier address setups need stronger proof if the business is truly eligible at that location.");
      addEvidence(evidenceMap, answers, "location-relationship-proof", "Riskier address setups need stronger proof if the business is truly eligible at that location.");
      if (isAddressBusiness(answers)) {
        addEvidence(evidenceMap, answers, "staff-at-location-proof", "Riskier address setups need stronger proof if the business is truly eligible at that location.");
      }
    }

    if (answers.status === "suspended") {
      addAction(actionScores, "review-eligibility", 86);
      addAction(actionScores, "gather-core-evidence", 80);
    }

    addAction(actionScores, "use-correct-google-path", Math.max(actionScores.get("use-correct-google-path") || 0, 70));

    if (answers.signage === "no" || answers.signage === "not_sure" || answers.status === "verification_failed") {
      warningSet.add("no-staged-photos");
    }

    if (answers.status === "suspended" || answers.status === "disabled" || answers.status === "appeal_denied") {
      warningSet.add("no-more-edits");
    }

    let buckets = Array.from(findings.values())
      .sort((left, right) => (right.score - left.score) || (right.severityLevel - left.severityLevel))
      .slice(0, 4)
      .map((item) => ({
        title: item.title,
        explanation: item.explanation,
        severity: item.severity,
        why: item.reasons.slice(0, 2).join(" "),
      }));

    if (!buckets.length) {
      buckets = [
        {
          title: issueBuckets["profile-consistency-review"].title,
          explanation: issueBuckets["profile-consistency-review"].description,
          severity: "Possible issue",
          why: "No single pattern stood out from the answers alone, so a careful consistency review is still the safest next step.",
        },
      ];
    }

    const evidenceGroups = Array.from(evidenceMap.values())
      .sort((left, right) => left.category.localeCompare(right.category) || Number(left.ready) - Number(right.ready))
      .reduce((groups, item) => {
        const match = groups.find((group) => group.category === item.category);
        if (match) {
          match.items.push(item);
        } else {
          groups.push({ category: item.category, items: [item] });
        }
        return groups;
      }, []);

    const actions = Array.from(actionScores.entries())
      .sort((left, right) => right[1] - left[1])
      .slice(0, 5)
      .map(([id]) => actionSteps[id]);

    const links = [...officialLinks.general, ...(officialLinks[answers.status] || [])].filter(
      (link, index, list) => list.findIndex((candidate) => candidate.url === link.url) === index,
    );

    const warnings = Array.from(warningSet).map((id) => warningLabels[id]);

    return {
      statusLabel: statusLabels[answers.status] || "Profile",
      buckets,
      evidenceGroups,
      actions,
      links,
      warnings,
    };
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
            ${results.buckets
              .map((bucket) => {
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
              })
              .join("")}
          </div>
        </section>
        <section class="results-section" aria-labelledby="evidence-heading">
          <div class="section-heading">
            <h4 id="evidence-heading">2. What to gather before appeal</h4>
            <p>This checklist is preparation guidance, not a guarantee of reinstatement.</p>
          </div>
          <div class="evidence-groups">
            ${results.evidenceGroups
              .map(
                (group) => `
                  <article class="evidence-card">
                    <h5>${group.category}</h5>
                    <ul class="evidence-list">
                      ${group.items
                        .map(
                          (item) => `
                            <li class="evidence-list__item">
                              <div class="evidence-list__header">
                                <span>${item.label}</span>
                                <span class="state-tag ${item.ready ? "state-tag--ready" : "state-tag--todo"}">${item.ready ? "Ready" : "Gather"}</span>
                              </div>
                              <p>${item.description}</p>
                              <p class="why-line"><strong>Why this is showing:</strong> ${item.reasons[0]}</p>
                            </li>
                          `,
                        )
                        .join("")}
                    </ul>
                  </article>
                `,
              )
              .join("")}
          </div>
        </section>
        <section class="results-section" aria-labelledby="actions-heading">
          <div class="section-heading">
            <h4 id="actions-heading">3. Recommended action order</h4>
          </div>
          <ol class="ordered-list">
            ${results.actions.map((action) => `<li>${action}</li>`).join("")}
          </ol>
        </section>
        <section class="results-section" aria-labelledby="links-heading">
          <div class="section-heading">
            <h4 id="links-heading">4. Official next-step links</h4>
          </div>
          <ul class="link-list">
            ${results.links
              .map(
                (link) => `
                  <li class="link-list__item">
                    <a href="${link.url}" target="_blank" rel="noopener noreferrer">${link.title}</a>
                    <p>${link.description}</p>
                  </li>
                `,
              )
              .join("")}
          </ul>
        </section>
        <section class="results-section" aria-labelledby="warnings-heading">
          <div class="section-heading">
            <h4 id="warnings-heading">5. What not to do</h4>
          </div>
          <ul class="warning-list">
            ${results.warnings.map((warning) => `<li>${warning}</li>`).join("")}
          </ul>
        </section>
      </section>
    `;
  }

  function runChecker() {
    clearEvidenceValidation();
    if (!form.reportValidity()) {
      return;
    }

    if (!validateEvidence()) {
      return;
    }

    const results = evaluate(normalizeAnswers());
    resultsRoot.hidden = false;
    resultsRoot.innerHTML = renderResults(results);
    announcement.textContent = `Results updated for ${results.statusLabel}.`;
    const heading = document.getElementById("results-heading");
    if (heading) {
      heading.focus();
    }
  }

  form.addEventListener("change", handleEvidenceExclusivity);
  form.addEventListener("reset", () => {
    window.setTimeout(() => {
      clearEvidenceValidation();
      resultsRoot.hidden = true;
      resultsRoot.innerHTML = "";
      announcement.textContent = "Triage results cleared.";
    }, 0);
  });
  runButton.addEventListener("click", runChecker);
})();
