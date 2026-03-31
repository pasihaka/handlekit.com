(function () {
  var config = window.HomepageCheckerData;
  var siteContent = window.SiteContent || {};
  var officialLinks = siteContent.OFFICIAL_LINKS || { general: [] };
  var form = document.getElementById("triage-form");
  var runButton = document.getElementById("run-triage");
  var resultsRoot = document.getElementById("triage-results-root");
  var announcement = document.getElementById("tool-announcement");
  var evidenceInputs = Array.prototype.slice.call(document.querySelectorAll('input[name="evidenceReady"]'));
  var noneYetValue = "none-yet";
  var severityWeight = { "Fix now": 3, Review: 2, "Possible issue": 1 };
  var riskyAddressTypes = new Set((config && config.riskyAddressTypes) || []);

  if (!config || !form || !runButton || !resultsRoot || !announcement) {
    return;
  }

  function isAddressBusiness(answers) {
    return answers.businessType === "storefront" || answers.businessType === "hybrid";
  }

  function getAnswers() {
    var formData = new FormData(form);
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

  function addBucket(bucketMap, bucketId, severity, score, why) {
    var definition = config.issueBuckets[bucketId];
    if (!definition) return;
    var current = bucketMap.get(bucketId) || {
      id: bucketId,
      title: definition.title,
      explanation: definition.description,
      severity: severity,
      severityLevel: severityWeight[severity] || 1,
      score: 0,
      reasons: [],
    };
    current.score += score;
    if ((severityWeight[severity] || 1) > current.severityLevel) {
      current.severity = severity;
      current.severityLevel = severityWeight[severity] || 1;
    }
    current.reasons.push(why);
    bucketMap.set(bucketId, current);
  }

  function addEvidence(evidenceMap, answers, evidenceId, reason) {
    var item = config.evidenceCatalog[evidenceId];
    if (!item) return;
    var current = evidenceMap.get(evidenceId) || {
      id: evidenceId,
      label: item.label,
      category: item.category,
      description: item.description,
      ready: answers.evidenceReady.indexOf(evidenceId) !== -1,
      reasons: [],
    };
    current.ready = answers.evidenceReady.indexOf(evidenceId) !== -1;
    if (current.reasons.indexOf(reason) === -1) current.reasons.push(reason);
    evidenceMap.set(evidenceId, current);
  }

  function addAction(actionMap, actionId, weight) {
    actionMap.set(actionId, Math.max(actionMap.get(actionId) || 0, weight));
  }

  function addWarning(warningSet, warningId) {
    if (config.warnings[warningId]) warningSet.add(warningId);
  }

  function buildResults(answers) {
    var buckets = new Map();
    var evidence = new Map();
    var actions = new Map();
    var warnings = new Set(["no-mismatched-docs"]);
    var readyEvidence = answers.evidenceReady.filter(function (item) { return item !== noneYetValue; });
    var markedNoneYet = answers.evidenceReady.indexOf(noneYetValue) !== -1;
    var readyCount = readyEvidence.length;
    var addressBusiness = isAddressBusiness(answers);

    addAction(actions, "use-correct-google-path", 60);

    if (answers.status === "suspended" || answers.status === "disabled" || answers.status === "appeal_denied") {
      addAction(actions, "pause-edits", 92);
      addWarning(warnings, "no-more-edits");
      addEvidence(evidence, answers, "business-registration", "Restricted profiles usually need clear baseline business proof before the next official step.");
      addEvidence(evidence, answers, "website-match", "Restricted profiles usually need clean consistency across public details and evidence.");
      addEvidence(evidence, answers, "local-phone", "Restricted profiles usually need clean consistency across public details and evidence.");
    }

    if (addressBusiness && answers.staffedHours === "no") {
      addBucket(buckets, "address-eligibility-risk", "Fix now", 96, "You selected a storefront or hybrid setup, but the listed address is not staffed during stated hours.");
      addAction(actions, "review-eligibility", 100);
      addAction(actions, "confirm-business-model", 94);
      addAction(actions, "gather-core-evidence", 88);
      addWarning(warnings, "no-virtual-office-storefront");
    } else if (addressBusiness && answers.staffedHours === "not_sure") {
      addBucket(buckets, "address-eligibility-risk", "Review", 70, "You are not sure whether the listed address is staffed during stated hours, which can create eligibility uncertainty.");
      addAction(actions, "review-eligibility", 84);
      addAction(actions, "confirm-business-model", 76);
    }

    if (riskyAddressTypes.has(answers.addressType)) {
      addBucket(buckets, "address-eligibility-risk", "Fix now", 100, "You selected a shared office, coworking, virtual office, or mailbox-style address, which often creates eligibility risk.");
      addAction(actions, "review-eligibility", 100);
      addAction(actions, "confirm-business-model", 96);
      addAction(actions, "gather-core-evidence", 90);
      addWarning(warnings, "no-virtual-office-storefront");
    } else if (answers.addressType === "not_sure") {
      addBucket(buckets, "address-eligibility-risk", "Review", 58, "You are not sure what type of address is on the listing, so location eligibility is one of the first things to review.");
      addAction(actions, "review-eligibility", 78);
      addAction(actions, "confirm-business-model", 72);
    }

    if (addressBusiness && answers.signage === "no") {
      addBucket(buckets, "signage-storefront-evidence-risk", "Fix now", 86, "You selected a storefront or hybrid setup, but you do not have permanent signage visible at the location.");
      addAction(actions, "gather-core-evidence", 90);
      addAction(actions, "prepare-verification-evidence", 80);
      addWarning(warnings, "no-staged-photos");
    } else if (addressBusiness && answers.signage === "not_sure") {
      addBucket(buckets, "signage-storefront-evidence-risk", "Review", 62, "You are not sure whether the location has permanent signage, so storefront evidence may be weak.");
      addAction(actions, "gather-core-evidence", 82);
      addAction(actions, "prepare-verification-evidence", 74);
      addWarning(warnings, "no-staged-photos");
    }

    if (answers.businessType === "service_area") {
      addBucket(buckets, "service-area-representation-risk", "Review", 80, "You selected a service-area business, so the public setup needs to match a business that serves customers away from a public storefront.");
      addAction(actions, "confirm-business-model", 86);
      addAction(actions, "prepare-service-area-proof", 84);
      addAction(actions, "confirm-consistency", 82);
      addWarning(warnings, "no-hidden-address-confusion");
    } else if (answers.businessType === "hybrid") {
      addBucket(buckets, "service-area-representation-risk", "Possible issue", 50, "You selected a hybrid business, so both the public storefront evidence and the service-area setup need to be consistent.");
      addAction(actions, "confirm-business-model", 74);
      addAction(actions, "prepare-service-area-proof", 68);
      addWarning(warnings, "no-hidden-address-confusion");
    }

    if (answers.recentEdits === "yes") {
      addBucket(buckets, "recent-edit-profile-change-risk", "Review", 76, "You said major profile edits were made recently, which can trigger review or create a mismatch with older evidence.");
      addAction(actions, "pause-edits", 96);
      addAction(actions, "confirm-consistency", 84);
      addWarning(warnings, "no-more-edits");
    } else if (answers.recentEdits === "not_sure") {
      addBucket(buckets, "recent-edit-profile-change-risk", "Possible issue", 48, "You are not sure whether recent edits happened, so a quick profile-history check is still worth doing.");
      addAction(actions, "pause-edits", 74);
      addAction(actions, "confirm-consistency", 66);
    }

    if (answers.status === "verification_failed") {
      addBucket(buckets, "verification-mismatch-risk", "Fix now", 92, "The current status is verification failed, so the setup and the submitted proof may not be lining up cleanly.");
      addAction(actions, "prepare-verification-evidence", 96);
      addAction(actions, "confirm-consistency", 88);
      addWarning(warnings, "no-staged-photos");
    } else if (answers.failedVerificationBefore === "yes") {
      addBucket(buckets, "verification-mismatch-risk", "Review", 78, "You said verification failed before, which often points to an evidence or setup mismatch worth fixing first.");
      addAction(actions, "prepare-verification-evidence", 88);
      addAction(actions, "confirm-consistency", 80);
    } else if (answers.failedVerificationBefore === "not_sure") {
      addBucket(buckets, "verification-mismatch-risk", "Possible issue", 44, "You are not sure whether verification failed before, so it is still worth checking for repeated mismatch patterns.");
      addAction(actions, "prepare-verification-evidence", 64);
    }

    if (answers.status === "disabled") {
      addBucket(buckets, "ownership-access-issue", "Review", 68, "Disabled profiles can overlap with access, ownership, or business-control questions that need cleaner proof.");
      addAction(actions, "confirm-ownership", 86);
      addEvidence(evidence, answers, "ownership-authorization", "Disabled status often calls for clearer proof of control over the business and listing.");
    }

    if (answers.status === "appeal_denied") {
      addBucket(buckets, "ownership-access-issue", "Review", 74, "An appeal denial usually means the next step is stronger evidence and cleaner consistency, not a quick resubmission.");
      addAction(actions, "review-denial-gap", 100);
      addAction(actions, "gather-core-evidence", 94);
      addAction(actions, "confirm-ownership", 90);
      addWarning(warnings, "no-blind-resubmission");
      addWarning(warnings, "no-repeat-appeals");
      addEvidence(evidence, answers, "ownership-authorization", "After an appeal denial, stronger proof of control and business legitimacy is often worth preparing.");
      addEvidence(evidence, answers, "utility-bill-lease", "After an appeal denial, stronger location proof is often worth preparing before any resubmission.");
    }

    if (markedNoneYet) {
      addBucket(buckets, "evidence-gap-before-appeal", "Fix now", 94, "You marked \"none yet\" for the evidence list, so evidence prep is likely one of the first things to fix before the next step.");
      addAction(actions, "gather-core-evidence", 100);
      addWarning(warnings, "no-repeat-appeals");
    } else if (readyCount === 0) {
      addBucket(buckets, "evidence-gap-before-appeal", "Review", 60, "You did not mark any evidence as ready in this form, so evidence prep is still worth reviewing before the next step.");
      addAction(actions, "gather-core-evidence", 82);
    } else if (readyCount <= 1) {
      addBucket(buckets, "evidence-gap-before-appeal", "Review", 66, "Only one evidence item is marked ready, so the current proof set may still be thin for appeal or re-verification.");
      addAction(actions, "gather-core-evidence", 86);
      addWarning(warnings, "no-repeat-appeals");
    }

    if (addressBusiness) {
      addEvidence(evidence, answers, "utility-bill-lease", "Address-based listings usually need stronger proof tying the business to the listed location.");
      addEvidence(evidence, answers, "location-relationship-proof", "Address-based listings usually need stronger proof tying the business to the listed location.");
      addEvidence(evidence, answers, "storefront-photos", "Address-based listings usually need current location evidence that matches the live setup.");
      addEvidence(evidence, answers, "signage-photos", "Address-based listings usually need current location evidence that matches the live setup.");
    }

    if (answers.businessType === "service_area") {
      addEvidence(evidence, answers, "business-registration", "Service-area businesses usually need proof that the operating model matches the listing setup.");
      addEvidence(evidence, answers, "website-match", "Service-area businesses usually need proof that the operating model matches the listing setup.");
      addEvidence(evidence, answers, "local-phone", "Service-area businesses usually need proof that the operating model matches the listing setup.");
      addEvidence(evidence, answers, "service-area-proof", "Service-area businesses usually need proof that the operating model matches the listing setup.");
      addEvidence(evidence, answers, "vehicle-branding-photos", "Service-area businesses often benefit from photos that support real field operations.");
    }

    if (answers.businessType === "hybrid") {
      addEvidence(evidence, answers, "service-area-proof", "Hybrid businesses often need both storefront evidence and service-area proof.");
      addEvidence(evidence, answers, "vehicle-branding-photos", "Hybrid businesses often need both storefront evidence and service-area proof.");
    }

    if (addressBusiness && (answers.staffedHours === "no" || answers.staffedHours === "not_sure")) {
      addEvidence(evidence, answers, "staff-at-location-proof", "If the staffing setup is unclear, proof of real staffed operations becomes more important.");
      addEvidence(evidence, answers, "location-relationship-proof", "If the staffing setup is unclear, proof of real staffed operations becomes more important.");
    }

    if (addressBusiness && (answers.signage === "no" || answers.signage === "not_sure")) {
      addEvidence(evidence, answers, "storefront-photos", "If signage is missing or uncertain, current storefront photos are one of the first things to gather.");
      addEvidence(evidence, answers, "signage-photos", "If signage is missing or uncertain, current signage photos are one of the first things to gather.");
    }

    if (answers.status === "verification_failed" || answers.failedVerificationBefore === "yes") {
      addEvidence(evidence, answers, "video-verification-setup", "Verification friction often means the next submission needs a cleaner photo or video plan.");
      addEvidence(evidence, answers, "website-match", "Verification friction often means the public details need to match the evidence more tightly.");
      addEvidence(evidence, answers, "local-phone", "Verification friction often means the public details need to match the evidence more tightly.");
    }

    if (riskyAddressTypes.has(answers.addressType)) {
      addEvidence(evidence, answers, "utility-bill-lease", "Riskier address setups need stronger proof if the business is truly eligible at that location.");
      addEvidence(evidence, answers, "location-relationship-proof", "Riskier address setups need stronger proof if the business is truly eligible at that location.");
      if (addressBusiness) addEvidence(evidence, answers, "staff-at-location-proof", "Riskier address setups need stronger proof if the business is truly eligible at that location.");
    }

    var bucketList = Array.from(buckets.values()).sort(function (left, right) {
      return right.score !== left.score ? right.score - left.score : right.severityLevel - left.severityLevel;
    }).slice(0, 4).map(function (bucket) {
      return { title: bucket.title, explanation: bucket.explanation, severity: bucket.severity, why: bucket.reasons.slice(0, 2).join(" ") };
    });

    if (!bucketList.length) {
      bucketList = [{ title: config.issueBuckets["profile-consistency-review"].title, explanation: config.issueBuckets["profile-consistency-review"].description, severity: "Possible issue", why: "No single pattern stood out from the answers alone, so a careful consistency review is still the safest next step." }];
    }

    var evidenceGroups = Array.from(evidence.values()).sort(function (left, right) {
      return left.category !== right.category ? left.category.localeCompare(right.category) : Number(left.ready) - Number(right.ready);
    }).reduce(function (groups, item) {
      var group = groups.find(function (candidate) { return candidate.category === item.category; });
      if (group) group.items.push(item);
      else groups.push({ category: item.category, items: [item] });
      return groups;
    }, []);

    var actionList = Array.from(actions.entries()).sort(function (left, right) {
      return right[1] - left[1];
    }).slice(0, 5).map(function (entry) {
      return config.actionSteps[entry[0]];
    }).filter(Boolean);

    var linkList = [].concat(officialLinks.general || []).concat(officialLinks[answers.status] || []).filter(function (link, index, list) {
      var key = link.url || link.title;
      return list.findIndex(function (candidate) { return (candidate.url || candidate.title) === key; }) === index;
    });

    var warningList = Array.from(warnings).map(function (warningId) {
      return config.warnings[warningId];
    }).filter(Boolean);

    return {
      statusLabel: config.statusLabels[answers.status] || "Profile",
      buckets: bucketList,
      evidenceGroups: evidenceGroups,
      actions: actionList,
      officialLinks: linkList,
      warnings: warningList,
    };
  }

  function renderBuckets(buckets) {
    return buckets.map(function (bucket) {
      var severityClass = bucket.severity.toLowerCase().replace(/\s+/g, "-");
      return '<article class="bucket-card"><div class="bucket-card__header"><h5>' + bucket.title + '</h5><span class="severity severity--' + severityClass + '">' + bucket.severity + '</span></div><p>' + bucket.explanation + '</p><p class="why-line"><strong>Why this may apply:</strong> ' + bucket.why + "</p></article>";
    }).join("");
  }

  function renderEvidenceGroups(evidenceGroups) {
    return evidenceGroups.map(function (group) {
      var items = group.items.map(function (item) {
        return '<li class="evidence-list__item"><div class="evidence-list__header"><span>' + item.label + '</span><span class="state-tag ' + (item.ready ? "state-tag--ready" : "state-tag--todo") + '">' + (item.ready ? "Ready" : "Gather") + '</span></div><p>' + item.description + '</p><p class="why-line"><strong>Why this is showing:</strong> ' + item.reasons[0] + "</p></li>";
      }).join("");
      return '<article class="evidence-card"><h5>' + group.category + '</h5><ul class="evidence-list">' + items + "</ul></article>";
    }).join("");
  }

  function renderSimpleList(items) {
    return items.map(function (item) {
      return "<li>" + item + "</li>";
    }).join("");
  }

  function renderLinks(links) {
    return links.map(function (link) {
      return '<li class="link-list__item"><a href="' + link.url + '" target="_blank" rel="noopener noreferrer">' + link.title + "</a><p>" + link.description + "</p></li>";
    }).join("");
  }

  function renderResults(results) {
    resultsRoot.hidden = false;
    resultsRoot.innerHTML = '<section class="results-panel" aria-labelledby="results-heading"><div class="results-header"><p class="eyebrow">Structured output</p><h3 id="results-heading" tabindex="-1">Preparation guidance for ' + results.statusLabel + '</h3><p>This does not prove the reason for the restriction. It highlights patterns that may deserve review before the official next step.</p></div><section class="results-section" aria-labelledby="buckets-heading"><div class="section-heading"><h4 id="buckets-heading">1. Likely issue buckets</h4><p>These are likely review areas based on your answers, not an exact diagnosis.</p></div><div class="bucket-grid">' + renderBuckets(results.buckets) + '</div></section><section class="results-section" aria-labelledby="evidence-heading"><div class="section-heading"><h4 id="evidence-heading">2. What to gather before appeal</h4><p>This checklist is preparation guidance, not a guarantee of reinstatement.</p></div><div class="evidence-groups">' + renderEvidenceGroups(results.evidenceGroups) + '</div></section><section class="results-section" aria-labelledby="actions-heading"><div class="section-heading"><h4 id="actions-heading">3. Recommended action order</h4></div><ol class="ordered-list">' + renderSimpleList(results.actions) + '</ol></section><section class="results-section" aria-labelledby="links-heading"><div class="section-heading"><h4 id="links-heading">4. Official next-step links</h4></div><ul class="link-list">' + renderLinks(results.officialLinks) + '</ul></section><section class="results-section" aria-labelledby="warnings-heading"><div class="section-heading"><h4 id="warnings-heading">5. What not to do</h4></div><ul class="warning-list">' + renderSimpleList(results.warnings) + "</ul></section></section>";
    announcement.textContent = "Results updated for " + results.statusLabel + ". " + results.buckets.length + " likely issue buckets shown.";
    var heading = document.getElementById("results-heading");
    if (heading) heading.focus();
  }

  function clearResults() {
    resultsRoot.hidden = true;
    resultsRoot.innerHTML = "";
    announcement.textContent = "Triage results cleared.";
  }

  function handleEvidenceChoice(event) {
    if (event.target.name !== "evidenceReady") return;
    if (event.target.value === noneYetValue && event.target.checked) {
      evidenceInputs.forEach(function (input) {
        if (input.value !== noneYetValue) input.checked = false;
      });
      return;
    }
    if (event.target.value !== noneYetValue && event.target.checked) {
      evidenceInputs.forEach(function (input) {
        if (input.value === noneYetValue) input.checked = false;
      });
    }
  }

  function handleRun(event) {
    if (event) event.preventDefault();
    if (!form.reportValidity()) return;
    renderResults(buildResults(getAnswers()));
  }

  form.addEventListener("submit", handleRun);
  form.addEventListener("change", handleEvidenceChoice);
  form.addEventListener("reset", function () {
    window.setTimeout(clearResults, 0);
  });
  runButton.addEventListener("click", handleRun);
})();
