# Data Entitlement & API Usage Agreement
**Between:** RAMA Real-Estate L.L.C. ("RAMA")  
**And:** Dubai Land Department (DLD)  

## 1. Purpose of Agreement
This agreement outlines the terms, scopes, and technical constraints under which RAMA is entitled to ingest, process, and display verified real estate data feeds from the Dubai Land Department via the DLD REST API.

## 2. Authorized Data Scopes
RAMA is granted a `READ-ONLY` token with the following Entitlement Classes:
- `registry_regulator`: Official ownership history, transfer values, and ejari registration metadata.
- `cost_index`: DLD Service Charge Index (SCI) limits per sqft for registered buildings.
- `dispute_public`: Summary metadata of resolved Rental Dispute Center (RDC) cases for specific building IDs.

## 3. SLA & Technical Rate Limits
1. RAMA shall not exceed **500 requests per minute (RPM)** against the primary REST endpoint.
2. RAMA must cache historical transaction data (older than 30 days) in a local persistent store to reduce load on the DLD API.
3. Live "Decision Room" fetching for active properties may bypass the cache but is subject to a hard 50 RPM limit per IP.

## 4. Privacy & Compliance
- Personally Identifiable Information (PII) of property owners, tenants, or brokers shall not be exposed in plaintext on the public RAMA platform.
- RAMA will implement cryptographic hashing for ID references to map internal records without exposing DLD national ID sequences.

## 5. Signatures
___________________________
**Authorized Signatory (RAMA)**
Date:

___________________________
**Authorized Signatory (DLD)**
Date:
