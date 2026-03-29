# Test Cases for GBP Triage Tool

This file contains manual scenario test definitions. Every case provides a complete input mapping for all form fields so QA is deterministic. Fields not relevant to the scenario are set to neutral fillers (`Yes`, `No`, or `None of these`).

**Form fields required:**
- `status` — Suspended / Disabled / Verification failed / Appeal denied
- `businessType` — Storefront / Service-area business / Hybrid
- `staffedHours` — Yes / No / Not sure
- `signage` — Yes / No / Not sure
- `addressType` — Shared office / Coworking space / Virtual office / Mailbox / PO box / None of these / Not sure
- `majorEdits` — Yes / No / Not sure
- `failedVerificationBefore` — Yes / No / Not sure
- `evidenceReady` — one or more checkboxes, or "None yet"

---

## Case 1: Suspended + Storefront + not staffed
- **Inputs:** Status = Suspended, BusinessType = Storefront, StaffedHours = No, Signage = Yes, AddressType = None of these, MajorEdits = No, FailedVerificationBefore = No, EvidenceReady = [none yet]
- **Expected Issue Buckets:** Address Eligibility Risk, Evidence Gap Before Appeal
- **Expected Evidence:** Business registration / license, Utility bill
- **Expected Actions:** Stop making further profile edits, Check whether the location/business type setup is eligible
- **Expected Warnings:** Do not use a virtual office

---

## Case 2: Suspended + Storefront + no signage
- **Inputs:** Status = Suspended, BusinessType = Storefront, StaffedHours = Yes, Signage = No, AddressType = None of these, MajorEdits = No, FailedVerificationBefore = No, EvidenceReady = [storefront photos]
- **Expected Issue Buckets:** Signage / Storefront Evidence Risk
- **Expected Evidence:** Wide-angle storefront photos, Close-up permanent signage, Interior photos
- **Expected Actions:** Stop making further profile edits, Gather matching storefront photos, Use the correct Google appeal path
- **Expected Warnings:** Do not submit repeated appeals without uploading clear proof of permanent signage

---

## Case 3: Suspended + virtual office address
- **Inputs:** Status = Suspended, BusinessType = Storefront, StaffedHours = Yes, Signage = Yes, AddressType = Virtual office, MajorEdits = No, FailedVerificationBefore = No, EvidenceReady = [business registration / license]
- **Expected Issue Buckets:** Address Eligibility Risk
- **Expected Evidence:** Business registration, Utility bill
- **Expected Actions:** Stop making further profile edits, Check eligibility
- **Expected Warnings:** Do not use a virtual office

---

## Case 4: Verification failed + service-area business
- **Inputs:** Status = Verification failed, BusinessType = Service-area business, StaffedHours = Yes, Signage = Yes, AddressType = None of these, MajorEdits = No, FailedVerificationBefore = No, EvidenceReady = [none yet]
- **Expected Issue Buckets:** Service-Area Representation Risk, Evidence Gap Before Appeal
- **Expected Evidence:** Branded vehicle photos, Tools of trade, Business registration, Utility bill
- **Expected Actions:** Gather vehicle branding and official registration, Confirm website/address consistency, Check eligibility
- **Expected Warnings:** None

---

## Case 5: Appeal denied + no evidence ready
- **Inputs:** Status = Appeal denied, BusinessType = Storefront, StaffedHours = Yes, Signage = Yes, AddressType = None of these, MajorEdits = No, FailedVerificationBefore = No, EvidenceReady = [none yet]
- **Expected Issue Buckets:** High Standard / Appeal Denied Status, Evidence Gap Before Appeal
- **Expected Evidence:** Business registration, Utility bill, Website consistency
- **Expected Actions:** Prepare a well-organized secondary appeal, Check eligibility
- **Expected Warnings:** Do not resubmit the exact same documents blindly

---

## Case 6: Disabled + storefront + full evidence
- **Inputs:** Status = Disabled, BusinessType = Storefront, StaffedHours = Yes, Signage = Yes, AddressType = None of these, MajorEdits = No, FailedVerificationBefore = No, EvidenceReady = [business registration / license, utility bill / lease, storefront photos, signage photos, website with matching business details]
- **Expected Issue Buckets:** None (disabled-status rule adds no bucket)
- **Expected Evidence:** Business registration
- **Expected Actions:** Check eligibility, Stop making further profile edits
- **Expected Warnings:** None

---

## Case 7: Suspended + service-area business + no signage, not staffed
- **Inputs:** Status = Suspended, BusinessType = Service-area business, StaffedHours = No, Signage = No, AddressType = None of these, MajorEdits = No, FailedVerificationBefore = No, EvidenceReady = [branded vehicle photos]
- **Expected Issue Buckets:** Service-Area Representation Risk
- **Note:** `rule_storefront_unstaffed` and `rule_no_signage` do NOT fire because businessType is Service-area business — those rules require Storefront or Hybrid.
- **Expected Evidence:** Branded vehicle photos, Tools of trade, Business registration, Utility bill
- **Expected Actions:** Gather vehicle branding and official registration, Confirm website consistency
- **Expected Warnings:** None

---

## Case 8: Suspended + Hybrid + recent major edits
- **Inputs:** Status = Suspended, BusinessType = Hybrid, StaffedHours = Yes, Signage = Yes, AddressType = None of these, MajorEdits = Yes, FailedVerificationBefore = No, EvidenceReady = [business registration / license]
- **Expected Issue Buckets:** Recent-Edit / Profile-Change Risk
- **Expected Evidence:** Business registration
- **Expected Actions:** Stop making further profile edits
- **Expected Warnings:** Do not keep editing key business details while suspended

---

## Case 9: Verification failed + failed verification before
- **Inputs:** Status = Verification failed, BusinessType = Storefront, StaffedHours = Yes, Signage = Yes, AddressType = None of these, MajorEdits = No, FailedVerificationBefore = Yes, EvidenceReady = [business registration / license, utility bill / lease]
- **Expected Issue Buckets:** Verification Mismatch Risk
- **Expected Evidence:** Business registration, Utility bill, Website consistency
- **Expected Actions:** Confirm website, address, and phone consistency across the web
- **Expected Warnings:** None

---

## Case 11: Partial Storefront Evidence (Weak Proof)
- **Inputs:** Status = Suspended, BusinessType = Storefront, StaffedHours = Yes, Signage = Yes, AddressType = None of these, MajorEdits = No, FailedVerificationBefore = No, EvidenceReady = [business registration / license]
- **Expected Issue Buckets:** Evidence Gap Before Appeal
- **Note:** Even though core proof is present, storefront photos/signage proof is missing, triggering the gap.
- **Expected Actions:** Gather matching storefront photos

---

## Case 12: Partial SAB Evidence (Weak Proof)
- **Inputs:** Status = Suspended, BusinessType = Service-area business, StaffedHours = Yes, Signage = Yes, AddressType = None of these, MajorEdits = No, FailedVerificationBefore = No, EvidenceReady = [utility bill / lease]
- **Expected Issue Buckets:** Service-Area Representation Risk, Evidence Gap Before Appeal
- **Note:** Missing vehicle branding and relationship/location proof triggers the gap.
- **Expected Actions:** Gather vehicle branding and official registration

---

## Case 13: Appeal Denied + missing core proof
- **Inputs:** Status = Appeal denied, BusinessType = Storefront, StaffedHours = Yes, Signage = Yes, AddressType = None of these, MajorEdits = No, FailedVerificationBefore = No, EvidenceReady = [storefront photos]
- **Expected Issue Buckets:** High Standard / Appeal Denied Status, Evidence Gap Before Appeal
- **Note:** Even though storefront photos are present, core registration/utility proof is missing, triggering the gap for high-risk status.
- **Expected Actions:** Prepare a well-organized secondary appeal, Check whether the location/business type setup is eligible
