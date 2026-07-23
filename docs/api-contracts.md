# Backend API Contracts: Nordic Pivot

As part of the Nordic Companion Pivot, we are shifting the data model from an evidence ontology (gamified, technical) to a verified facts model (plain language, countable). This document outlines the required changes for the backend team (Track A).

## 1. Property Verification Data Model

**Endpoints Affected**: 
- `GET /api/v1/properties/:slug` 
- `GET /api/v1/properties/search`
- `POST /api/v1/properties/compare`

### Deprecated Fields
- `evidence_coverage_score`
- `evidence_ontology_keys`
- `trust_passport_status`

### New Contract
The API must return a `verification` object on the property payload.

```typescript
interface PropertyVerification {
  // The number of key facts that have been verified (e.g., 18)
  verifiedCount: number;
  
  // The total number of key facts for this property type (e.g., 22)
  totalCount: number;
  
  // ISO Date string for when the verification was last refreshed
  lastVerifiedAt: string;
  
  // Human-readable plain text items that are still pending or not confirmed
  // E.g., ["Service charge documents", "RERA title deed"]
  pendingItems: string[];
}
```

## 2. Cost Assumptions Data Model

**Endpoints Affected**: 
- TBD (Either a global endpoint `/api/v1/costs/assumptions` or injected directly into the property response).

### New Contract
To support the new Cost Calculator transparency layer (Phase 5).

```typescript
interface CostAssumption {
  id: string;
  
  // Maps to the line item in the frontend calculator
  lineItemKey: 'dld_fee' | 'service_charge' | 'agency_fee' | 'trustee_fee' | 'noc_fee';
  
  // Short description for inline UI (e.g., "4% of property value")
  shortText: string;
  
  // Full rationale for tooltips (e.g., "Dubai Land Department standard transfer fee as of 2026")
  fullText: string;
  
  // The authoritative source (e.g., "DLD Fee Schedule")
  source: string;
  
  // Optional link to the source document
  sourceUrl?: string;
  
  // Determines the UI treatment (fixed = no warning, estimated = warning icon)
  confidence: 'fixed' | 'estimated' | 'variable';
  
  // ISO Date string
  lastVerified: string;
}
```
