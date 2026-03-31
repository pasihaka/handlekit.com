const SITE = {
  name: "Google Business Profile Suspension Triage & Appeal Prep Checker",
  shortName: "GBP Suspension Triage Checker",
  domain: "https://www.example.com",
  ogImage: "https://www.example.com/assets/og-card.png",
};

// Replace this disclaimer copy if you want to tighten or soften the tone later.
const DISCLAIMER_TEXT = {
  short:
    "This tool gives preparation guidance only. It does not diagnose the exact reason for suspension, replace official Google guidance, provide legal advice, or guarantee reinstatement.",
  full:
    "This checker is a preparation tool, not a diagnosis. It highlights likely issue buckets, likely evidence gaps, and an official next step based on your answers. It does not prove why a profile was suspended, disabled, or denied. It does not guarantee reinstatement, replace official Google guidance, or provide legal advice.",
};

// Edit these official Google Business Profile URLs if Google changes them later.
const GOOGLE_BUSINESS_PROFILE_POLICIES_URL =
  "https://support.google.com/business/answer/13763036?hl=en";
const GOOGLE_SUSPENSION_APPEAL_URL =
  "https://support.google.com/business/answer/4569145?hl=en";
const GOOGLE_DISABLED_PROFILE_HELP_URL =
  "https://support.google.com/business/answer/4569145?hl=en";
const GOOGLE_VERIFICATION_HELP_URL =
  "https://support.google.com/business/answer/2566416?hl=en";
const GOOGLE_VIDEO_VERIFICATION_HELP_URL =
  "https://support.google.com/business/answer/14271705?hl=en";
const GOOGLE_OWNERSHIP_ACCESS_HELP_URL =
  "https://support.google.com/business/answer/3403100?hl=en";
const GOOGLE_APPEAL_REVIEW_HELP_URL =
  "https://support.google.com/business/answer/13597551?hl=en";

// Edit these labels and descriptions if you want a different set of official links.
const OFFICIAL_LINKS = {
  general: [
    {
      id: "policies",
      title: "Google Business Profile policies",
      url: GOOGLE_BUSINESS_PROFILE_POLICIES_URL,
      description: "Review the baseline eligibility and representation rules first.",
    },
    {
      id: "ownership",
      title: "Ownership and access help",
      url: GOOGLE_OWNERSHIP_ACCESS_HELP_URL,
      description: "Useful when control of the listing or business relationship needs to be proved.",
    },
  ],
  suspended: [
    {
      id: "suspension-appeal",
      title: "Suspension appeal path",
      url: GOOGLE_SUSPENSION_APPEAL_URL,
      description: "Use this after reviewing eligibility and gathering matching evidence.",
    },
    {
      id: "policies-suspended",
      title: "Profile policy review",
      url: GOOGLE_BUSINESS_PROFILE_POLICIES_URL,
      description: "Check location, signage, and business model alignment before appealing.",
    },
  ],
  disabled: [
    {
      id: "disabled-help",
      title: "Disabled profile help",
      url: GOOGLE_DISABLED_PROFILE_HELP_URL,
      description: "Use the official disabled-profile guidance that fits this status.",
    },
    {
      id: "ownership-disabled",
      title: "Ownership and access review",
      url: GOOGLE_OWNERSHIP_ACCESS_HELP_URL,
      description: "Useful when disabled status overlaps with access or proof issues.",
    },
  ],
  verification_failed: [
    {
      id: "verification-help",
      title: "Verification troubleshooting",
      url: GOOGLE_VERIFICATION_HELP_URL,
      description: "Use the verification route instead of a suspension appeal if that is the real issue.",
    },
    {
      id: "video-help",
      title: "Video verification help",
      url: GOOGLE_VIDEO_VERIFICATION_HELP_URL,
      description: "Useful when Google is asking for video evidence of the business and location.",
    },
  ],
  appeal_denied: [
    {
      id: "appeal-review",
      title: "Appeal review guidance",
      url: GOOGLE_APPEAL_REVIEW_HELP_URL,
      description: "Review the official appeal flow before sending more evidence.",
    },
    {
      id: "policies-appeal",
      title: "Profile policy review",
      url: GOOGLE_BUSINESS_PROFILE_POLICIES_URL,
      description: "Re-check eligibility and consistency before resubmitting anything.",
    },
  ],
  evidence: [
    {
      id: "policies-evidence",
      title: "Policy and eligibility reference",
      url: GOOGLE_BUSINESS_PROFILE_POLICIES_URL,
      description: "Use this while deciding which documents and photos are worth preparing.",
    },
    {
      id: "verification-evidence",
      title: "Verification help",
      url: GOOGLE_VERIFICATION_HELP_URL,
      description: "Useful if the evidence checklist is for an unresolved verification issue.",
    },
  ],
  business_types: [
    {
      id: "policy-models",
      title: "Business model eligibility policies",
      url: GOOGLE_BUSINESS_PROFILE_POLICIES_URL,
      description: "Use this when deciding whether the listing should be storefront, service-area, or hybrid.",
    },
    {
      id: "verification-models",
      title: "Verification troubleshooting",
      url: GOOGLE_VERIFICATION_HELP_URL,
      description: "Helpful if the business model setup and evidence are not aligning during verification.",
    },
  ],
};

window.SiteContent = {
  SITE,
  DISCLAIMER_TEXT,
  GOOGLE_BUSINESS_PROFILE_POLICIES_URL,
  GOOGLE_SUSPENSION_APPEAL_URL,
  GOOGLE_DISABLED_PROFILE_HELP_URL,
  GOOGLE_VERIFICATION_HELP_URL,
  GOOGLE_VIDEO_VERIFICATION_HELP_URL,
  GOOGLE_OWNERSHIP_ACCESS_HELP_URL,
  GOOGLE_APPEAL_REVIEW_HELP_URL,
  OFFICIAL_LINKS,
};
