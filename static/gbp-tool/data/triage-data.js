const TRIAGE_QUESTIONS = [
  {
    id: "status",
    legend: "Current status",
    type: "radio",
    required: true,
    options: [
      { value: "suspended", label: "Suspended" },
      { value: "disabled", label: "Disabled" },
      { value: "verification_failed", label: "Verification failed" },
      { value: "appeal_denied", label: "Appeal denied" },
    ],
  },
  {
    id: "businessType",
    legend: "Business type",
    type: "radio",
    required: true,
    options: [
      { value: "storefront", label: "Storefront" },
      { value: "service_area", label: "Service-area business" },
      { value: "hybrid", label: "Hybrid" },
    ],
  },
  {
    id: "staffedHours",
    legend: "Is the listed address staffed during stated hours?",
    type: "radio",
    required: true,
    options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
      { value: "not_sure", label: "Not sure" },
    ],
  },
  {
    id: "signage",
    legend: "Do you have permanent signage visible at the location?",
    type: "radio",
    required: true,
    options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
      { value: "not_sure", label: "Not sure" },
    ],
  },
  {
    id: "addressType",
    legend: "Is the listed address any of these?",
    type: "radio",
    required: true,
    options: [
      { value: "shared_office", label: "Shared office" },
      { value: "coworking", label: "Coworking space" },
      { value: "virtual_office", label: "Virtual office" },
      { value: "mailbox", label: "Mailbox / PO box / mail service" },
      { value: "none", label: "None of these" },
      { value: "not_sure", label: "Not sure" },
    ],
  },
  {
    id: "recentEdits",
    legend: "Did you make major profile edits recently?",
    type: "radio",
    required: true,
    options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
      { value: "not_sure", label: "Not sure" },
    ],
  },
  {
    id: "failedVerificationBefore",
    legend: "Have you failed verification before?",
    type: "radio",
    required: true,
    options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
      { value: "not_sure", label: "Not sure" },
    ],
  },
  {
    id: "evidenceReady",
    legend: "Do you already have evidence ready?",
    type: "checkbox",
    helpText: "Select every item you already have. If you have none, choose \"None yet.\"",
    options: [
      { value: "business-registration", label: "business registration / license" },
      { value: "utility-bill-lease", label: "utility bill / lease" },
      { value: "storefront-photos", label: "storefront photos" },
      { value: "signage-photos", label: "signage photos" },
      { value: "vehicle-branding-photos", label: "vehicle branding photos" },
      {
        value: "website-match",
        label: "website with matching business details",
      },
      { value: "local-phone", label: "local phone number" },
      {
        value: "location-relationship-proof",
        label: "proof of relationship to the location",
      },
      { value: "none-yet", label: "none yet" },
    ],
  },
];

// Edit bucket titles and descriptions here when you want to change the tool output.
const ISSUE_BUCKETS = {
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

// Edit evidence labels and categories here when you want to expand the checklist.
const EVIDENCE_CATALOG = {
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

const ACTION_STEPS = {
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

const WARNING_DEFINITIONS = {
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

const riskyAddressTypes = new Set([
  "shared_office",
  "coworking",
  "virtual_office",
  "mailbox",
]);

const addressBasedBusiness = (answers) =>
  answers.businessType === "storefront" || answers.businessType === "hybrid";

// Edit scoring, severity, and reasons here to tune the checker.
const BUCKET_RULES = [
  {
    bucketId: "address-eligibility-risk",
    score: 10,
    severity: "Fix now",
    condition: (answers) =>
      addressBasedBusiness(answers) && answers.staffedHours === "no",
    reason: () =>
      "You selected a storefront or hybrid setup, but the listed address is not staffed during stated hours.",
    actions: ["review-eligibility", "confirm-business-model", "gather-core-evidence"],
    warnings: ["no-virtual-office-storefront", "no-more-edits"],
  },
  {
    bucketId: "address-eligibility-risk",
    score: 8,
    severity: "Review",
    condition: (answers) =>
      addressBasedBusiness(answers) && answers.staffedHours === "not_sure",
    reason: () =>
      "You are not sure whether the listed address is staffed during stated hours, which can create eligibility uncertainty.",
    actions: ["review-eligibility", "confirm-business-model"],
    warnings: ["no-more-edits"],
  },
  {
    bucketId: "address-eligibility-risk",
    score: 12,
    severity: "Fix now",
    condition: (answers) => riskyAddressTypes.has(answers.addressType),
    reason: (answers) =>
      `You selected ${answers.addressType.replace("_", " ")} as the listed address type, which often creates location eligibility risk.`,
    actions: ["review-eligibility", "confirm-business-model", "gather-core-evidence"],
    warnings: ["no-virtual-office-storefront", "no-more-edits"],
  },
  {
    bucketId: "address-eligibility-risk",
    score: 5,
    severity: "Review",
    condition: (answers) => answers.addressType === "not_sure",
    reason: () =>
      "You are not sure what type of address is on the listing, so location eligibility is worth reviewing first.",
    actions: ["review-eligibility", "confirm-business-model"],
    warnings: ["no-more-edits"],
  },
  {
    bucketId: "signage-storefront-evidence-risk",
    score: 9,
    severity: "Fix now",
    condition: (answers) =>
      addressBasedBusiness(answers) && answers.signage === "no",
    reason: () =>
      "You selected a storefront or hybrid setup, but you do not have permanent signage visible at the location.",
    actions: ["gather-core-evidence", "prepare-verification-evidence"],
    warnings: ["no-staged-photos", "no-mismatched-docs"],
  },
  {
    bucketId: "signage-storefront-evidence-risk",
    score: 6,
    severity: "Review",
    condition: (answers) =>
      addressBasedBusiness(answers) && answers.signage === "not_sure",
    reason: () =>
      "You are not sure whether the location has permanent signage, so storefront evidence may be weak.",
    actions: ["gather-core-evidence", "prepare-verification-evidence"],
    warnings: ["no-staged-photos"],
  },
  {
    bucketId: "service-area-representation-risk",
    score: 6,
    severity: "Review",
    condition: (answers) => answers.businessType === "service_area",
    reason: () =>
      "You selected a service-area business, so the public setup needs to match a business that serves customers away from a public storefront.",
    actions: [
      "confirm-business-model",
      "prepare-service-area-proof",
      "confirm-consistency",
    ],
    warnings: ["no-hidden-address-confusion", "no-mismatched-docs"],
  },
  {
    bucketId: "service-area-representation-risk",
    score: 4,
    severity: "Possible issue",
    condition: (answers) => answers.businessType === "hybrid",
    reason: () =>
      "You selected a hybrid business, so both the public storefront evidence and the service-area setup need to be consistent.",
    actions: [
      "confirm-business-model",
      "prepare-service-area-proof",
      "confirm-consistency",
    ],
    warnings: ["no-hidden-address-confusion"],
  },
  {
    bucketId: "recent-edit-profile-change-risk",
    score: 7,
    severity: "Review",
    condition: (answers) => answers.recentEdits === "yes",
    reason: () =>
      "You said major profile edits were made recently, which can trigger review or create a mismatch with older evidence.",
    actions: ["pause-edits", "confirm-consistency"],
    warnings: ["no-more-edits"],
  },
  {
    bucketId: "recent-edit-profile-change-risk",
    score: 4,
    severity: "Possible issue",
    condition: (answers) => answers.recentEdits === "not_sure",
    reason: () =>
      "You are not sure whether recent edits happened, so a quick profile-history check is still worth doing.",
    actions: ["pause-edits", "confirm-consistency"],
    warnings: ["no-more-edits"],
  },
  {
    bucketId: "verification-mismatch-risk",
    score: 8,
    severity: "Review",
    condition: (answers) => answers.failedVerificationBefore === "yes",
    reason: () =>
      "You said verification has already failed before, which often points to a mismatch between the listing and the evidence being used.",
    actions: ["prepare-verification-evidence", "confirm-consistency"],
    warnings: ["no-mismatched-docs", "no-staged-photos"],
  },
  {
    bucketId: "verification-mismatch-risk",
    score: 6,
    severity: "Review",
    condition: (answers) => answers.status === "verification_failed",
    reason: () =>
      "The current status is verification failed, so the next step is usually evidence quality and verification-path alignment rather than a generic appeal.",
    actions: [
      "prepare-verification-evidence",
      "confirm-consistency",
      "use-correct-google-path",
    ],
    warnings: ["no-mismatched-docs"],
  },
  {
    bucketId: "ownership-access-issue",
    score: 7,
    severity: "Review",
    condition: (answers) => answers.status === "disabled",
    reason: () =>
      "Disabled status often requires a careful review of business legitimacy, ownership, and listing control before the official next step.",
    actions: ["confirm-ownership", "review-eligibility", "use-correct-google-path"],
    warnings: ["no-repeat-appeals", "no-mismatched-docs"],
  },
  {
    bucketId: "ownership-access-issue",
    score: 6,
    severity: "Review",
    condition: (answers) =>
      (answers.status === "appeal_denied" || answers.status === "disabled") &&
      !answers.evidenceReady.includes("business-registration"),
    reason: () =>
      "You do not yet have business registration or license evidence marked ready, which can weaken ownership or legitimacy proof.",
    actions: ["confirm-ownership", "gather-core-evidence"],
    warnings: ["no-mismatched-docs"],
  },
  {
    bucketId: "ownership-access-issue",
    score: 6,
    severity: "Review",
    condition: (answers) =>
      addressBasedBusiness(answers) &&
      !answers.evidenceReady.includes("location-relationship-proof"),
    reason: () =>
      "You have not marked proof of relationship to the location as ready, which can matter when the listing uses a public address.",
    actions: ["confirm-ownership", "gather-core-evidence"],
    warnings: ["no-mismatched-docs"],
  },
  {
    bucketId: "evidence-gap-before-appeal",
    score: 11,
    severity: "Fix now",
    condition: (answers) => answers.evidenceReady.includes("none-yet"),
    reason: () =>
      "You said no evidence is ready yet, so the next submission is likely to be weak unless you prepare documents and photos first.",
    actions: ["gather-core-evidence", "confirm-consistency"],
    warnings: ["no-repeat-appeals", "no-mismatched-docs"],
  },
  {
    bucketId: "evidence-gap-before-appeal",
    score: 7,
    severity: "Review",
    condition: (answers) =>
      !answers.evidenceReady.includes("none-yet") && answers.evidenceReady.length <= 2,
    reason: (answers) =>
      `Only ${answers.evidenceReady.length} evidence item${
        answers.evidenceReady.length === 1 ? "" : "s"
      } is marked ready, so the evidence set may still be thin for appeal or verification.`,
    actions: ["gather-core-evidence", "confirm-consistency"],
    warnings: ["no-repeat-appeals", "no-mismatched-docs"],
  },
  {
    bucketId: "evidence-gap-before-appeal",
    score: 8,
    severity: "Fix now",
    condition: (answers) => answers.status === "appeal_denied",
    reason: () =>
      "An appeal denial usually means the next move should be a stronger evidence set, not a faster resubmission.",
    actions: ["review-denial-gap", "gather-core-evidence", "use-correct-google-path"],
    warnings: ["no-blind-resubmission", "no-repeat-appeals"],
  },
];

// Edit the checklist logic here if you want different evidence recommendations.
const EVIDENCE_RULES = [
  {
    condition: (answers) =>
      answers.status === "suspended" ||
      answers.status === "disabled" ||
      answers.status === "appeal_denied",
    evidenceIds: [
      "business-registration",
      "website-match",
      "local-phone",
      "ownership-authorization",
    ],
    reason:
      "These are common starting points when the profile is already restricted or an appeal has stalled.",
  },
  {
    condition: (answers) =>
      answers.businessType === "storefront" || answers.businessType === "hybrid",
    evidenceIds: [
      "storefront-photos",
      "signage-photos",
      "utility-bill-lease",
      "location-relationship-proof",
    ],
    reason:
      "Address-based businesses usually need clear location and signage evidence.",
  },
  {
    condition: (answers) => answers.businessType === "service_area",
    evidenceIds: [
      "business-registration",
      "website-match",
      "local-phone",
      "service-area-proof",
      "vehicle-branding-photos",
    ],
    reason:
      "Service-area businesses usually need proof that the operating model matches the listing setup.",
  },
  {
    condition: (answers) => answers.businessType === "hybrid",
    evidenceIds: ["service-area-proof", "vehicle-branding-photos"],
    reason:
      "Hybrid businesses often need both storefront evidence and service-area proof.",
  },
  {
    condition: (answers) =>
      addressBasedBusiness(answers) &&
      (answers.staffedHours === "no" || answers.staffedHours === "not_sure"),
    evidenceIds: ["staff-at-location-proof", "location-relationship-proof"],
    reason:
      "If the staffing setup is unclear, location evidence becomes more important.",
  },
  {
    condition: (answers) =>
      addressBasedBusiness(answers) &&
      (answers.signage === "no" || answers.signage === "not_sure"),
    evidenceIds: ["storefront-photos", "signage-photos"],
    reason:
      "If signage is missing or uncertain, current photo evidence becomes a priority.",
  },
  {
    condition: (answers) =>
      answers.status === "verification_failed" ||
      answers.failedVerificationBefore === "yes",
    evidenceIds: ["video-verification-setup", "website-match", "local-phone"],
    reason:
      "Repeated verification friction usually calls for tighter evidence and a cleaner verification submission.",
  },
  {
    condition: (answers) => riskyAddressTypes.has(answers.addressType),
    evidenceIds: [
      "utility-bill-lease",
      "location-relationship-proof",
      "staff-at-location-proof",
    ],
    reason:
      "Riskier address setups need stronger proof if the business is truly eligible at that location.",
  },
];

const ACTION_RULES = [
  {
    condition: () => true,
    priorities: [{ id: "use-correct-google-path", weight: 60 }],
  },
  {
    condition: (answers) => answers.status === "suspended",
    priorities: [
      { id: "review-eligibility", weight: 85 },
      { id: "gather-core-evidence", weight: 75 },
    ],
  },
  {
    condition: (answers) => answers.status === "disabled",
    priorities: [
      { id: "confirm-ownership", weight: 90 },
      { id: "review-eligibility", weight: 80 },
    ],
  },
  {
    condition: (answers) => answers.status === "verification_failed",
    priorities: [
      { id: "prepare-verification-evidence", weight: 88 },
      { id: "confirm-consistency", weight: 82 },
    ],
  },
  {
    condition: (answers) => answers.status === "appeal_denied",
    priorities: [
      { id: "review-denial-gap", weight: 95 },
      { id: "gather-core-evidence", weight: 90 },
    ],
  },
];

const WARNING_RULES = [
  {
    condition: () => true,
    warningIds: ["no-mismatched-docs"],
  },
  {
    condition: (answers) =>
      answers.status === "suspended" ||
      answers.status === "disabled" ||
      answers.status === "appeal_denied",
    warningIds: ["no-repeat-appeals", "no-more-edits"],
  },
  {
    condition: (answers) => answers.status === "appeal_denied",
    warningIds: ["no-blind-resubmission"],
  },
  {
    condition: (answers) => riskyAddressTypes.has(answers.addressType),
    warningIds: ["no-virtual-office-storefront"],
  },
  {
    condition: (answers) => answers.businessType === "service_area",
    warningIds: ["no-hidden-address-confusion"],
  },
  {
    condition: (answers) =>
      answers.signage === "no" ||
      answers.signage === "not_sure" ||
      answers.status === "verification_failed",
    warningIds: ["no-staged-photos"],
  },
];

const STATUS_LABELS = {
  suspended: "Suspended",
  disabled: "Disabled",
  verification_failed: "Verification failed",
  appeal_denied: "Appeal denied",
};

window.TriageData = {
  TRIAGE_QUESTIONS,
  ISSUE_BUCKETS,
  EVIDENCE_CATALOG,
  ACTION_STEPS,
  WARNING_DEFINITIONS,
  BUCKET_RULES,
  EVIDENCE_RULES,
  ACTION_RULES,
  WARNING_RULES,
  STATUS_LABELS,
};
