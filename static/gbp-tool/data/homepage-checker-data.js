window.HomepageCheckerData = {
  statusLabels: {
    suspended: "Suspended",
    disabled: "Disabled",
    verification_failed: "Verification failed",
    appeal_denied: "Appeal denied",
  },
  // Edit issue labels and descriptions here.
  issueBuckets: {
    "address-eligibility-risk": {
      title: "Address eligibility risk",
      description: "This usually means the listed address may not match the kind of location Google expects for this type of profile.",
    },
    "signage-storefront-evidence-risk": {
      title: "Signage / storefront evidence risk",
      description: "This usually means the listing may be hard to verify as a real customer-facing location with permanent branding.",
    },
    "service-area-representation-risk": {
      title: "Service-area representation risk",
      description: "This usually means the public setup may not cleanly match a service-area or hybrid operating model.",
    },
    "recent-edit-profile-change-risk": {
      title: "Recent-edit / profile-change risk",
      description: "This usually means recent major edits may have triggered a fresh review or a mismatch with older evidence.",
    },
    "verification-mismatch-risk": {
      title: "Verification mismatch risk",
      description: "This usually means the profile details, documents, photos, or verification method may not be lining up cleanly.",
    },
    "ownership-access-issue": {
      title: "Ownership / access issue",
      description: "This usually means the next step may depend on proving business control, business legitimacy, or the relationship to the location.",
    },
    "evidence-gap-before-appeal": {
      title: "Evidence gap before appeal",
      description: "This usually means the next appeal or verification attempt may be weak unless the document and photo set is improved first.",
    },
    "profile-consistency-review": {
      title: "Profile consistency review",
      description: "No single issue stands out from the answers alone, so the safest move is a careful consistency review before using the official path.",
    },
  },
  // Edit evidence checklist labels here.
  evidenceCatalog: {
    "business-registration": { label: "Business registration or license", category: "Documents", description: "Use the clearest official business proof you have." },
    "utility-bill-lease": { label: "Utility bill or lease for the listed location", category: "Documents", description: "Use documents that connect the business to the real location." },
    "storefront-photos": { label: "Current exterior and interior storefront photos", category: "Photos", description: "Show the actual location as a customer would encounter it." },
    "signage-photos": { label: "Permanent signage photos", category: "Photos", description: "Include clear branding visible at the location." },
    "vehicle-branding-photos": { label: "Vehicle branding photos", category: "Photos", description: "Useful when the business operates in the field instead of a public storefront." },
    "website-match": { label: "Website with matching business details", category: "Consistency", description: "The business name, address, phone, and services should line up cleanly." },
    "local-phone": { label: "Local phone number that matches public business details", category: "Consistency", description: "Use the number shown consistently across the profile and website when possible." },
    "location-relationship-proof": { label: "Proof of relationship to the location", category: "Location proof", description: "Use documents that show the business really operates from or controls the location." },
    "staff-at-location-proof": { label: "Proof the location is staffed during stated hours", category: "Location proof", description: "Useful when a public storefront or hybrid address is claimed." },
    "service-area-proof": { label: "Service-area proof that matches real operations", category: "Service-area proof", description: "Use job photos, service records, or other proof that supports the stated operating area." },
    "ownership-authorization": { label: "Ownership or manager authorization proof", category: "Ownership proof", description: "Useful when account control or business relationship needs to be clarified." },
    "video-verification-setup": { label: "Video verification proof or walkthrough plan", category: "Verification evidence", description: "Prepare the business, location, tools, and signage evidence needed for a cleaner video submission." },
  },
  // Edit action order labels here.
  actionSteps: {
    "pause-edits": "Stop making more profile edits while you review eligibility and evidence gaps.",
    "review-eligibility": "Check whether the location setup and business type look eligible under Google's current rules.",
    "confirm-business-model": "Confirm whether this should be a storefront, service-area business, or hybrid setup.",
    "gather-core-evidence": "Gather matching documents and current photos before another appeal or verification attempt.",
    "confirm-consistency": "Confirm your website, address, phone, and public branding all match the listing.",
    "prepare-service-area-proof": "Prepare service-area proof that matches how the business really operates.",
    "prepare-verification-evidence": "Prepare the exact photos, documents, or video evidence most likely to be requested next.",
    "review-denial-gap": "Review what was missing or inconsistent before resubmitting anything after an appeal denial.",
    "confirm-ownership": "Collect ownership, manager, and location relationship proof before using the next official path.",
    "use-correct-google-path": "Use the correct official Google appeal or verification path for the current status.",
  },
  // Edit warning copy here.
  warnings: {
    "no-repeat-appeals": "Do not submit repeated appeals before fixing obvious eligibility or evidence gaps.",
    "no-mismatched-docs": "Do not upload documents or screenshots that show a different name, address, phone, or business model.",
    "no-virtual-office-storefront": "Do not use a virtual office, mailbox, or similar setup as if it were a staffed storefront.",
    "no-more-edits": "Do not keep editing key business details while troubleshooting unless an official step specifically requires it.",
    "no-hidden-address-confusion": "Do not present a service-area business like a public storefront if customers are not served there.",
    "no-staged-photos": "Do not upload photos that do not clearly match the real location, signage, staff setup, or service model.",
    "no-blind-resubmission": "Do not resubmit blindly after an appeal denial without improving the evidence set first.",
  },
  riskyAddressTypes: ["shared_office", "coworking", "virtual_office", "mailbox"],
};
