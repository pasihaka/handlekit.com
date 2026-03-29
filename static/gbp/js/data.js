const GBP_DATA = {
  ISSUE_BUCKETS: {
    "appeal_denied_risk": {
      title: "High Standard / Appeal Denied Status",
      severity: "Fix now",
      plain_explanation: "Because your appeal was already denied, the review may place greater weight on well-organized, consistent proof.",
      why_this_may_apply: "This may apply because your appeal was denied, increasing the focus on strong, consistent evidence.",
      priority: 100
    },
    "address_eligibility_risk": {
      title: "Address Eligibility Risk",
      severity: "Fix now",
      plain_explanation: "Your chosen address type or lack of staffed hours may indicate an address-eligibility problem under Google's guidelines.",
      why_this_may_apply: "This may apply because you indicated your location is not staffed during hours or uses an ineligible address type (e.g., virtual office, coworking).",
      priority: 90
    },
    "signage_risk": {
      title: "Signage / Storefront Evidence Risk",
      severity: "Fix now",
      plain_explanation: "A storefront business without fixed, permanent signage can trigger verification issues or suspension.",
      why_this_may_apply: "This may apply because you operate a storefront but lack permanent signage.",
      priority: 80
    },
    "evidence_gap": {
      title: "Evidence Gap Before Appeal",
      severity: "Fix now",
      plain_explanation: "Appealing without sufficient, matching evidence may increase the risk of denial.",
      why_this_may_apply: "This may apply because you do not have key evidence documents ready yet.",
      priority: 70
    },
    "verification_mismatch_risk": {
      title: "Verification Mismatch Risk",
      severity: "Review",
      plain_explanation: "Past verification failures suggest Google may not have been able to confidently link your physical location to official documentation.",
      why_this_may_apply: "This may apply because you have failed verification before.",
      priority: 60
    },
    "service_area_representation_risk": {
      title: "Service-Area Representation Risk",
      severity: "Review",
      plain_explanation: "Service-area businesses are commonly expected to hide their address and provide alternative proof of operations (like vehicles and matching local licenses).",
      why_this_may_apply: "This may apply because you operate a service-area business and need specialized documentation.",
      priority: 50
    },
    "recent_edit_risk": {
      title: "Recent-Edit / Profile-Change Risk",
      severity: "Possible issue",
      plain_explanation: "Major changes to core business details (name, category, address) can trigger reverification or, in some cases, suspension.",
      why_this_may_apply: "This may apply because you made major profile edits recently.",
      priority: 40
    }
  },
  
  EVIDENCE_ITEMS: {
    "storefront_photos_exterior": { label: "Wide-angle storefront photos showing signage and adjacent buildings", format: "Photo" },
    "storefront_photos_signage": { label: "Close-up of permanent, affixed signage outside", format: "Photo" },
    "storefront_photos_interior": { label: "Interior photos showing tools of trade and customer areas", format: "Photo" },
    "sab_vehicle_branding": { label: "Branded vehicle photos (showing license plate and logo)", format: "Photo" },
    "sab_tools_of_trade": { label: "Tools of trade / equipment at base location", format: "Photo" },
    "business_registration": { label: "Official business registration or local municipality license", format: "Document" },
    "utility_bill": { label: "Utility bill showing the matching business name and address", format: "Document" },
    "website_consistency": { label: "Website contact page updated to align closely with GBP details", format: "Link/Proof" }
  },

  ACTION_STEPS: {
    "stop_edits": { text: "Stop making further profile edits while troubleshooting.", order: 10 },
    "check_eligibility": { text: "Check whether the location/business type setup is eligible under Google guidelines.", order: 20 },
    "gather_storefront": { text: "Gather matching storefront photos and signage proof.", order: 30 },
    "gather_sab": { text: "Gather vehicle branding and official registration documents for service-area.", order: 31 },
    "confirm_consistency": { text: "Confirm website, address, and phone consistency across the web.", order: 40 },
    "prepare_strong_rebuttal": { text: "Review previously submitted evidence for flaws, fix them, and prepare a well-organized secondary appeal if appropriate.", order: 50 },
    "use_appeal_path": { text: "Use the correct Google appeal or verification path once evidence is ready.", order: 60 }
  },

  WARNINGS: {
    "do_not_appeal_without_signage": { text: "Do not submit repeated appeals without uploading clear proof of permanent signage." },
    "do_not_use_virtual_office": { text: "Do not use a virtual office, PO Box, or unstaffed coworking space as if it were a staffed storefront." },
    "do_not_keep_editing": { text: "Do not keep editing key business details while suspended; it may cause delays or further profile issues." },
    "do_not_resubmit_blindly": { text: "Do not resubmit the exact same documents blindly after an appeal denial." }
  },

  OFFICIAL_LINKS: {
    "SUSPENSION_HELP": { label: "Fix suspended Business Profiles (Google Support)", url: "https://support.google.com/business/answer/4569145" },
    "APPEALS_TOOL": { label: "Google Business Profile Appeals Tool", url: "https://support.google.com/business/workflow/13569690" },
    "VERIFICATION_HELP": { label: "Verify your business on Google", url: "https://support.google.com/business/answer/7107242" },
    "GUIDELINES": { label: "Guidelines for representing your business on Google", url: "https://support.google.com/business/answer/3038177" }
  },

  RULES: [
    {
      id: "rule_storefront_unstaffed",
      when: {
        status: ["Suspended", "Verification failed", "Appeal denied"],
        businessType: ["Storefront", "Hybrid"],
        staffedHours: ["No"]
      },
      adds_issue_buckets: ["address_eligibility_risk"],
      adds_evidence_items: ["business_registration", "utility_bill"],
      adds_actions: ["stop_edits", "check_eligibility"],
      adds_warnings: ["do_not_use_virtual_office"],
      adds_links: ["SUSPENSION_HELP", "GUIDELINES"],
      priority: 10,
      notes: "Unstaffed storefront implies eligibility risk."
    },
    {
      id: "rule_no_signage",
      when: {
        status: ["Suspended", "Verification failed", "Appeal denied"],
        businessType: ["Storefront", "Hybrid"],
        signage: ["No", "Not sure"]
      },
      adds_issue_buckets: ["signage_risk"],
      adds_evidence_items: ["storefront_photos_exterior", "storefront_photos_signage", "storefront_photos_interior"],
      adds_actions: ["stop_edits", "gather_storefront", "use_appeal_path"],
      adds_warnings: ["do_not_appeal_without_signage"],
      adds_links: ["APPEALS_TOOL", "VERIFICATION_HELP"],
      priority: 9,
      notes: "Applies when a storefront user has no signs."
    },
    {
      id: "rule_ineligible_address",
      when: {
        status: ["Suspended", "Verification failed", "Appeal denied", "Disabled"],
        addressType: ["Shared office", "Coworking space", "Virtual office", "Mailbox / PO box / mail service"]
      },
      adds_issue_buckets: ["address_eligibility_risk"],
      adds_evidence_items: ["business_registration", "utility_bill"],
      adds_actions: ["stop_edits", "check_eligibility"],
      adds_warnings: ["do_not_use_virtual_office"],
      adds_links: ["GUIDELINES"],
      priority: 10,
      notes: "Ineligible address types."
    },
    {
      id: "rule_sab",
      when: {
        businessType: ["Service-area business"]
      },
      adds_issue_buckets: ["service_area_representation_risk"],
      adds_evidence_items: ["sab_vehicle_branding", "sab_tools_of_trade", "business_registration", "utility_bill"],
      adds_actions: ["gather_sab", "confirm_consistency"],
      adds_warnings: [],
      adds_links: ["VERIFICATION_HELP"],
      priority: 5,
      notes: "SAB base requirements."
    },
    {
      id: "rule_recent_edits",
      when: {
        majorEdits: ["Yes"]
      },
      adds_issue_buckets: ["recent_edit_risk"],
      adds_evidence_items: ["business_registration"],
      adds_actions: ["stop_edits"],
      adds_warnings: ["do_not_keep_editing"],
      adds_links: ["SUSPENSION_HELP"],
      priority: 6,
      notes: "Triggered by recent changes."
    },
    {
      id: "rule_verification_failed_before",
      when: {
        status: ["Suspended", "Verification failed", "Appeal denied"],
        failedVerificationBefore: ["Yes"]
      },
      adds_issue_buckets: ["verification_mismatch_risk"],
      adds_evidence_items: ["business_registration", "utility_bill", "website_consistency"],
      adds_actions: ["confirm_consistency"],
      adds_warnings: [],
      adds_links: ["VERIFICATION_HELP"],
      priority: 7,
      notes: "History of verification issues."
    },
    {
      id: "rule_no_evidence",
      when: {
        evidenceReady: ["none yet"]
      },
      adds_issue_buckets: ["evidence_gap"],
      adds_evidence_items: [],
      adds_actions: ["check_eligibility"],
      adds_warnings: [],
      adds_links: ["GUIDELINES"],
      priority: 8,
      notes: "No evidence checked. Catch-all for fully empty set."
    },
    {
      id: "rule_weak_storefront_evidence",
      when: {
        businessType: ["Storefront", "Hybrid"],
        hasStorefrontProof: [false]
      },
      adds_issue_buckets: ["evidence_gap"],
      adds_evidence_items: ["storefront_photos_exterior", "storefront_photos_signage"],
      adds_actions: ["gather_storefront"],
      adds_warnings: [],
      adds_links: ["GUIDELINES"],
      priority: 8,
      notes: "Storefronts missing photos/signage."
    },
    {
      id: "rule_weak_sab_evidence_vehicle",
      when: {
        businessType: ["Service-area business"],
        hasServiceAreaProof: [false]
      },
      adds_issue_buckets: ["evidence_gap"],
      adds_evidence_items: ["sab_vehicle_branding"],
      adds_actions: ["gather_sab"],
      adds_warnings: [],
      adds_links: ["GUIDELINES"],
      priority: 8,
      notes: "SAB missing vehicle proof."
    },
    {
      id: "rule_weak_sab_evidence_relationship",
      when: {
        businessType: ["Service-area business"],
        hasRelationshipProof: [false]
      },
      adds_issue_buckets: ["evidence_gap"],
      adds_evidence_items: [],
      adds_actions: ["check_eligibility"],
      adds_warnings: [],
      adds_links: ["GUIDELINES"],
      priority: 8,
      notes: "SAB missing relationship/location proof."
    },
    {
      id: "rule_high_risk_missing_core",
      when: {
        status: ["Appeal denied", "Verification failed"],
        hasCoreBusinessProof: [false]
      },
      adds_issue_buckets: ["evidence_gap"],
      adds_evidence_items: ["business_registration", "utility_bill"],
      adds_actions: ["check_eligibility"],
      adds_warnings: ["do_not_resubmit_blindly"],
      adds_links: ["GUIDELINES"],
      priority: 9,
      notes: "High risk statuses require core documentation."
    },
    {
      id: "rule_appeal_denied",
      when: {
        status: ["Appeal denied"]
      },
      adds_issue_buckets: ["appeal_denied_risk"],
      adds_evidence_items: ["business_registration", "utility_bill", "website_consistency"],
      adds_actions: ["prepare_strong_rebuttal"],
      adds_warnings: ["do_not_resubmit_blindly"],
      adds_links: ["APPEALS_TOOL", "SUSPENSION_HELP"],
      priority: 11,
      notes: "Appeal denied is the highest severity and requires unique action."
    },
    {
      id: "rule_disabled",
      when: {
        status: ["Disabled"]
      },
      adds_issue_buckets: [],
      adds_evidence_items: ["business_registration"],
      adds_actions: ["check_eligibility", "stop_edits"],
      adds_warnings: [],
      adds_links: ["SUSPENSION_HELP", "GUIDELINES"],
      priority: 1,
      notes: "Disabled profiles generally mean policy violations, not just verification errors."
    }
  ]
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = GBP_DATA;
} else if (typeof window !== 'undefined') {
  window.GBP_DATA = GBP_DATA;
}
