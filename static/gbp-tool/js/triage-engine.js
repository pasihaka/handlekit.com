const {
  ACTION_RULES,
  ACTION_STEPS,
  BUCKET_RULES,
  EVIDENCE_CATALOG,
  EVIDENCE_RULES,
  ISSUE_BUCKETS,
  STATUS_LABELS,
  WARNING_DEFINITIONS,
  WARNING_RULES,
} = window.TriageData;
const { OFFICIAL_LINKS } = window.SiteContent;

const severityRank = {
  "Fix now": 3,
  Review: 2,
  "Possible issue": 1,
};

const rankToSeverity = {
  3: "Fix now",
  2: "Review",
  1: "Possible issue",
};

const emptyBucket = (bucketId) => ({
  id: bucketId,
  title: ISSUE_BUCKETS[bucketId].title,
  explanation: ISSUE_BUCKETS[bucketId].description,
  severityRank: 0,
  score: 0,
  reasons: [],
});

function normalizeAnswers(formData) {
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

function collectBuckets(answers) {
  const buckets = new Map();
  const actionWeights = new Map();
  const warningIds = new Set();

  for (const rule of BUCKET_RULES) {
    if (!rule.condition(answers)) {
      continue;
    }

    const bucket = buckets.get(rule.bucketId) ?? emptyBucket(rule.bucketId);
    bucket.score += rule.score;
    bucket.severityRank = Math.max(
      bucket.severityRank,
      severityRank[rule.severity] ?? 1,
    );
    bucket.reasons.push(rule.reason(answers));
    buckets.set(rule.bucketId, bucket);

    for (const actionId of rule.actions ?? []) {
      const current = actionWeights.get(actionId) ?? 0;
      actionWeights.set(actionId, Math.max(current, rule.score + 40));
    }

    for (const warningId of rule.warnings ?? []) {
      warningIds.add(warningId);
    }
  }

  return { buckets, actionWeights, warningIds };
}

function collectEvidence(answers) {
  const evidence = new Map();

  for (const rule of EVIDENCE_RULES) {
    if (!rule.condition(answers)) {
      continue;
    }

    for (const evidenceId of rule.evidenceIds) {
      const catalogItem = EVIDENCE_CATALOG[evidenceId];
      if (!catalogItem) {
        continue;
      }

      const entry = evidence.get(evidenceId) ?? {
        id: evidenceId,
        ...catalogItem,
        ready: answers.evidenceReady.includes(evidenceId),
        reasons: [],
      };

      entry.ready = answers.evidenceReady.includes(evidenceId);
      entry.reasons.push(rule.reason);
      evidence.set(evidenceId, entry);
    }
  }

  return evidence;
}

function collectActions(answers, actionWeights) {
  for (const rule of ACTION_RULES) {
    if (!rule.condition(answers)) {
      continue;
    }

    for (const priority of rule.priorities) {
      const current = actionWeights.get(priority.id) ?? 0;
      actionWeights.set(priority.id, Math.max(current, priority.weight));
    }
  }

  return [...actionWeights.entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(0, 5)
    .map(([id]) => ({
      id,
      label: ACTION_STEPS[id],
    }));
}

function collectWarnings(answers, seedWarningIds) {
  const warningIds = new Set(seedWarningIds);

  for (const rule of WARNING_RULES) {
    if (!rule.condition(answers)) {
      continue;
    }

    for (const warningId of rule.warningIds) {
      warningIds.add(warningId);
    }
  }

  return [...warningIds].map((id) => ({
    id,
    label: WARNING_DEFINITIONS[id],
  }));
}

function collectOfficialLinks(answers) {
  const statusLinks = OFFICIAL_LINKS[answers.status] ?? [];
  const combinedLinks = [...OFFICIAL_LINKS.general, ...statusLinks];
  const seen = new Set();

  return combinedLinks.filter((link) => {
    const key = link.url || link.id;
    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function fallbackBucket() {
  return {
    id: "profile-consistency-review",
    title: ISSUE_BUCKETS["profile-consistency-review"].title,
    explanation: ISSUE_BUCKETS["profile-consistency-review"].description,
    severity: "Possible issue",
    score: 1,
    why:
      "No single pattern stood out from the answers alone, so a careful consistency review is still the safest next step.",
  };
}

function finalizeBuckets(bucketMap) {
  const list = [...bucketMap.values()]
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }

      return right.severityRank - left.severityRank;
    })
    .slice(0, 4)
    .map((bucket) => ({
      id: bucket.id,
      title: bucket.title,
      explanation: bucket.explanation,
      severity: rankToSeverity[bucket.severityRank] ?? "Possible issue",
      score: bucket.score,
      why: bucket.reasons.slice(0, 2).join(" "),
    }));

  return list.length ? list : [fallbackBucket()];
}

function groupEvidence(evidenceMap) {
  const byCategory = new Map();

  for (const item of evidenceMap.values()) {
    const group = byCategory.get(item.category) ?? [];
    group.push(item);
    byCategory.set(item.category, group);
  }

  return [...byCategory.entries()]
    .map(([category, items]) => ({
      category,
      items: items.sort((left, right) => Number(left.ready) - Number(right.ready)),
    }))
    .sort((left, right) => left.category.localeCompare(right.category));
}

function evaluateTriage(answers) {
  const { buckets, actionWeights, warningIds } = collectBuckets(answers);
  const evidenceMap = collectEvidence(answers);
  const actions = collectActions(answers, actionWeights);
  const warnings = collectWarnings(answers, warningIds);
  const officialLinks = collectOfficialLinks(answers);

  return {
    statusLabel: STATUS_LABELS[answers.status],
    buckets: finalizeBuckets(buckets),
    evidenceGroups: groupEvidence(evidenceMap),
    actions,
    warnings,
    officialLinks,
  };
}

window.TriageEngine = {
  normalizeAnswers,
  evaluateTriage,
};
