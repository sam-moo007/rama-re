# Physical Tour Capture: Standard Operating Procedure (SOP)
**Scope:** Phase 0 Pilot (10 Select Units in Downtown & Marina)
**Objective:** Standardize the capture of high-fidelity spatial data for RAMA's Tier 1 Interactive Tours.

## 1. Equipment Checklist
- Matterport Pro3 3D Camera or Insta360 Pro 2.
- Heavy-duty tripod with spirit level.
- iPad Pro (M4) with RAMA internal capture app installed.
- High-lumen portable continuous lighting (minimum 2 softboxes) for unlit off-plan properties.

## 2. On-Site Prep
1. **Clearance:** Ensure all proprietary building materials, broker signage, and personal items are removed from the shot.
2. **Lighting:** Open all curtains and blinds. For evening or off-plan captures, deploy the portable softboxes to ensure a minimum exposure of 400 lux evenly distributed across the main living area.
3. **Doors:** Prop open all interior doors at a 45-degree angle to allow seamless spatial meshing between rooms.

## 3. Capture Sequence
1. Start exactly at the front threshold (Door open).
2. Scan in a clockwise pattern.
3. Maximum distance between scan points: 1.5 meters.
4. Capture a "Hero Point" in the absolute center of the Living Room, Kitchen, and Master Bedroom. (A Hero Point requires a manual 4K HDR bracketed exposure capture via the iPad app).

## 4. Post-Processing & Ingestion
1. Upload the raw spatial mesh via the RAMA Partner Portal `/operations/ingestion` endpoint using the `adapterKind: "partner_file"`.
2. Ensure the `batchIdempotencyKey` corresponds to the Ejari unit number.
3. The automated processing pipeline will align the 4K HDR brackets over the spatial mesh and project them to the `property_decision_room_projection` table.

**Safety Note:** Hard hats and high-vis vests are mandatory for all captures in off-plan (under construction) zones.
