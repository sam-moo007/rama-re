# RAMA 2.0

## Nordic Product Architecture, Design System and User-Flow Transformation Plan

---

## Executive Assessment

The current RAMA concept contains strong strategic ideas:

- Evidence-backed property information
- Transparent transaction costs
- Commute and lifestyle analysis
- Property comparison
- Structured advisor handoff
- Operational evidence verification

However, these ideas have been assembled as separate visible product features
rather than integrated into one calm decision-making experience.

The result is a platform that feels:

- Operational rather than consumer-oriented
- Data-heavy rather than decision-oriented
- Highly technical rather than reassuring
- Visually coded rather than clearly explained
- Architecturally complete but cognitively difficult
- Designed around RAMA’s internal system instead of the buyer’s mental model

The redesign must reduce the entire platform to three buyer questions:

1. **Can I trust this property information?**
2. **Can I afford the complete cost?**
3. **Does this home fit my life?**

Every page, component, route and interaction should help answer one of these
questions.

---

# 1. Why the Current Platform Scores 1/10

## 1.1 Trust has become visual noise

The current system uses:

- Evidence Coverage Scores
- Freshness states
- Multiple badge colours
- Trust passports
- Verification bands
- Missing-data indicators
- Risk indicators
- Review indicators
- Unknown indicators
- Numerical animations
- Marquees
- Evidence filters

Individually, these elements appear useful. Collectively, they create a
dashboard-like experience that requires users to learn RAMA’s internal
verification language before they can evaluate a home.

A buyer should not need to understand a complex evidence ontology to know
whether a claim is reliable.

### Current experience

> Evidence Coverage Score: 78%\
> State: Review\
> Source freshness: Partial\
> Evidence type: Modelled\
> Accessibility claim: Unknown

### Improved experience

> **Most important details verified**\
> 18 of 22 key property facts have supporting documents.\
> Three details still need confirmation.

The detailed evidence can remain available through progressive disclosure.

---

## 1.2 The design system begins with components rather than principles

The existing design system is based on:

- Token values
- Component heights
- Badge scales
- Motion libraries
- Card surfaces
- Semantic colours

This defines how the interface is constructed, but not how it should feel or
behave.

A Nordic design system must begin with behavioural principles:

- Calm before decoration
- Clarity before density
- Function before novelty
- Explanation before scoring
- Progressive disclosure before information dumping
- Human language before system language
- Restraint before animation

Components should be derived from these principles.

---

## 1.3 The colour system is overloaded

Copper, sage, ochre, risk red and unknown grey compete for attention.

When every evidence state receives a different colour, the interface resembles
an operations dashboard. Buyers must repeatedly decode the colour system while
scanning listings.

Colour should reinforce meaning, not carry meaning alone.

### Recommended rule

Use colour for only three purposes:

1. Brand emphasis
2. Confirmed positive state
3. Material warning or risk

Unknown information should normally remain neutral rather than becoming another
prominent status colour.

---

## 1.4 Typography and controls are too compact

The proposed scale includes 11px and 13px text, 32px controls and 38px form
fields. These dimensions may support dense operational interfaces but are
unsuitable as the default for a premium consumer property platform.

Property decisions involve long reading sessions, financial information, legal
details and comparisons. The interface must feel spacious and readable.

Recommended minimums:

- Body text: 16–17px
- Supporting text: 14px
- Primary controls: 48px
- Compact controls: 44px
- Touch targets: minimum 44px
- Reading line length: approximately 60–75 characters

---

## 1.5 Motion undermines credibility

The proposed use of:

- Number tickers
- Blur fades
- Continuous marquees
- Verification bands
- Spring animations

creates a marketing-led interface.

A trust platform should feel stable. Numbers associated with costs, evidence and
property details should not animate theatrically.

Motion should communicate:

- State changes
- Navigation relationships
- Loading
- Expansion and collapse
- Successful completion

It should not be used to make factual information appear impressive.

---

## 1.6 Authentication appears too early

The current primary journey requires users to:

1. Visit the landing page
2. Sign in
3. Complete a household brief
4. Enter discovery
5. Open a property

This creates friction before the user has experienced enough value.

Users should be able to:

- Browse homes
- Open property pages
- Review cost summaries
- Inspect verification information
- Use basic filters

without creating an account.

Authentication should be introduced when the user attempts a value-preserving
action:

- Save a property
- Create a comparison
- Save their requirements
- Export a cost summary
- Request an advisor
- Receive property updates

---

## 1.7 The household brief is positioned as a gate

A mandatory brief before discovery makes RAMA feel like an intake form.

The brief should function as an optional personalisation layer.

A first-time visitor may not yet know:

- Their preferred neighbourhood
- Whether commute or school proximity matters more
- Their final mortgage range
- Their acceptable handover date
- Their complete family requirements

The platform should help users discover these preferences rather than requiring
them immediately.

---

## 1.8 Route names expose internal product language

Names such as:

- `/discover`
- `/brief`
- `/readiness`
- `/advisor`
- `/operations`
- `/partner/ingestion`

reflect the system architecture more than the user’s mental model.

Users think in terms of:

- Homes
- Saved properties
- Compare
- Costs
- My requirements
- Appointments
- Account

User-facing routes and labels should use those terms.

---

## 1.9 The property page contains too many competing products

The current “Property Decision Room” contains:

- Trust passport
- 360-degree tour
- DLD comparable sales
- Cost waterfall
- Evidence states
- Commute estimates
- Property details
- Advisor actions

This risks becoming several applications inside one page.

The property page should tell one structured story:

1. What is this home?
2. Why might it fit me?
3. What has been verified?
4. What will it really cost?
5. What is the location experience?
6. What still needs confirmation?
7. What can I do next?

---

## 1.10 Consumer, owner, partner and staff experiences are mixed

The current route inventory places buyers, owners, partners and staff within the
same application structure.

These groups have different:

- Security requirements
- Information density
- Navigation needs
- Language
- Workflows
- Design expectations

They should share infrastructure and design foundations, but not the same
product shell.

---

# 2. RAMA’s New Product Philosophy

## 2.1 Nordic design is not beige minimalism

The redesign should not interpret Nordic design as merely:

- White backgrounds
- Muted colours
- Large headings
- Simple icons

Nordic product design should be applied as an operating philosophy.

### RAMA Nordic principles

#### 1. Quiet confidence

The interface should not repeatedly announce that RAMA is trustworthy. Trust
should emerge from clear sources, honest limitations and consistent behaviour.

#### 2. Useful simplicity

Remove every element that does not improve comprehension, confidence or action.

#### 3. Honest incompleteness

When information is unavailable, state that it is unavailable without turning it
into an alarming visual event.

#### 4. Democratic clarity

Financial, legal and property information should be understandable without
specialist real-estate knowledge.

#### 5. Progressive disclosure

Present conclusions first, explanations second and underlying documents third.

#### 6. Human pacing

Allow users to examine properties without repeated pop-ups, forced registration
or urgent sales messages.

#### 7. Functional beauty

Aesthetic quality should come from typography, proportion, imagery, alignment
and spacing—not decorative effects.

#### 8. Respectful personalisation

Personalisation should improve relevance without making users feel profiled or
pressured.

---

# 3. New Product Positioning

## Current positioning

> Evidence-first, trust-anchored real-estate decision platform.

This is strategically accurate but system-oriented.

## Recommended user-facing positioning

> **Find a Dubai home with clearer facts, complete costs and fewer surprises.**

Supporting statement:

> RAMA brings verified property information, realistic ownership costs and
> personal fit into one calm decision experience.

---

# 4. Simplified Product Model

RAMA should be structured around three intelligence layers.

## Layer 1: Trust

Answers:

- Where did this information come from?
- When was it last checked?
- Which details are confirmed?
- Which details need confirmation?
- Has anything changed?

## Layer 2: Cost

Answers:

- What do I pay initially?
- What are the government and transaction fees?
- What are the recurring ownership costs?
- What may change before handover?
- What could resale or exit involve?

## Layer 3: Fit

Answers:

- Is the location practical for my household?
- Does the property satisfy my space requirements?
- Is the payment schedule suitable?
- Is the handover timeline acceptable?
- How well does it match my priorities?

These layers should be integrated into the property experience rather than
presented as separate feature systems.

---

# 5. Information Architecture Redesign

## 5.1 Consumer application

Recommended primary navigation:

- Homes
- Compare
- Costs
- Saved
- Account

“Saved” and “Account” appear after authentication.

Secondary navigation:

- How RAMA verifies information
- Buying guides
- About RAMA
- Speak to an advisor

## 5.2 Recommended consumer routes

| Recommended route | User-facing label      | Purpose                                  |
| ----------------- | ---------------------- | ---------------------------------------- |
| `/`               | Home                   | Product introduction and property search |
| `/homes`          | Homes                  | Property browsing and filtering          |
| `/homes/[slug]`   | Property name          | Complete property details                |
| `/compare`        | Compare                | Compare up to three homes                |
| `/costs`          | Cost calculator        | Calculate complete buying costs          |
| `/plan`           | My requirements        | Save household and financial priorities  |
| `/saved`          | Saved homes            | Shortlisted homes and collections        |
| `/appointments`   | Appointments           | Advisor calls and property visits        |
| `/updates`        | Updates                | Changes to saved properties              |
| `/account`        | Account                | Profile, preferences and privacy         |
| `/trust`          | How verification works | Explain RAMA’s verification process      |
| `/guides`         | Buying guides          | Educational content                      |

Localisation may still be implemented technically, but users should not need to
understand `[locale]` as part of the product structure.

---

## 5.3 Replace internal terminology

| Current terminology     | Recommended user-facing terminology |
| ----------------------- | ----------------------------------- |
| Discovery Hub           | Homes                               |
| Property Decision Room  | Property details                    |
| Trust Passport          | Verification                        |
| Household Brief         | My requirements                     |
| Cost Engine             | Cost calculator                     |
| Readiness               | Buying readiness                    |
| Advisor Handoff         | Speak to an advisor                 |
| Evidence Coverage Score | Verification summary                |
| Unknown state           | Not yet confirmed                   |
| Stale evidence          | Needs rechecking                    |
| Modelled claim          | Estimated                           |
| Committed state         | Developer-stated                    |
| Present state           | Confirmed on record                 |

Internal terminology may remain in technical documentation, but it should not
dominate the customer interface.

---

# 6. Redesigned Buyer Journey

## Stage 1: Explore without commitment

### User actions

- Lands on RAMA
- Searches by community, building or project
- Opens the Homes page
- Applies simple filters
- Opens property details

### RAMA behaviour

- Does not require authentication
- Does not open a household wizard
- Does not show an advisor pop-up
- Explains verification only where relevant
- Remembers temporary browsing preferences locally

---

## Stage 2: Understand the property

The property page immediately answers:

- Price
- Location
- Property type
- Bedrooms
- Completion or handover status
- Verification summary
- Estimated complete acquisition cost

The user can then explore deeper sections.

---

## Stage 3: Express intent

Authentication is requested only when the user:

- Saves a home
- Adds a second property to compare
- Creates alerts
- Saves cost calculations
- Requests an advisor
- Saves personal requirements

The registration message should explain the benefit:

> Create an account to keep this property, compare it later and receive
> verification updates.

---

## Stage 4: Personalise

After saving or comparing properties, RAMA may ask:

> Would you like results tailored to your budget, commute and household needs?

The user can:

- Start personalisation
- Skip
- Return later

---

## Stage 5: Decide

RAMA helps the user:

- Compare a maximum of three homes
- Review unresolved questions
- Understand complete costs
- Review commute information
- Export a summary
- Request an advisor or viewing

---

## Stage 6: Advisor support

The advisor request should be one calm screen containing:

- Selected property
- Preferred contact method
- Preferred time
- Questions the user wants answered
- Information that will be shared

Before submission:

> RAMA will share this property, your saved requirements and the questions
> listed below. Financial details will only be included with your permission.

---

# 7. Property Page Redesign

## 7.1 Page objective

Help the user understand one home without making them process an operational
dashboard.

## 7.2 Recommended page structure

### Section 1: Property introduction

Include:

- Property name
- Community
- Price
- Bedrooms and area
- Handover status
- Primary image gallery
- Save and compare actions

Only one primary action should be visually dominant.

Recommended primary action:

> Check availability

Secondary actions:

- Save
- Compare
- Share

---

### Section 2: At-a-glance summary

Four concise blocks:

- Property
- Cost
- Verification
- Location

Example:

**Verification**\
18 of 22 important facts confirmed\
Three details need confirmation

**Estimated purchase cost**\
AED 2.18M including estimated transaction fees

**Commute**\
Approximately 24–35 minutes to DIFC during typical weekday periods

**Handover**\
Developer-stated: Q4 2027

Each block opens its relevant detailed section.

---

### Section 3: Why this home may fit

Only show this section when the user has saved requirements.

Example:

> **Strong match for your space and payment preferences**

Supporting details:

- Within your AED 2.2M limit
- Three bedrooms requested; three provided
- Payment plan fits your preferred initial deposit
- Commute is longer than your preferred range

Avoid a universal “property score.” Fit is personal and should remain
explainable.

---

### Section 4: Verification

The default state should be a simple summary.

Example:

> **Most key details are supported by current documents.**\
> Three items still need confirmation: service charges, final accessibility
> details and exact handover penalties.

Actions:

- View verified details
- View items needing confirmation
- View source documents

The full evidence matrix should remain collapsed by default.

---

### Section 5: Complete costs

Replace a visually complex waterfall with a readable staged breakdown.

#### At reservation

- Reservation amount
- Initial deposit
- Administration fees

#### At transfer

- DLD fees
- Trustee fees
- Mortgage-related fees
- Agency fees where applicable

#### During ownership

- Estimated service charges
- Maintenance allowance
- Insurance
- Finance costs

#### Possible future costs

- Resale fees
- Early settlement fees
- Exit or assignment charges

Show assumptions directly beside the amount.

---

### Section 6: Location and daily life

Include:

- Map
- Key destinations
- Commute ranges
- Schools
- Healthcare
- Groceries
- Public transport
- Walkability or accessibility information

Do not display every map layer simultaneously.

Use tabs or segmented controls:

- Daily needs
- Commute
- Schools
- Transport

---

### Section 7: Property experience

Include:

- Photography
- Floor plan
- 360-degree tour
- Video
- Building amenities

The immersive tour should support understanding rather than appearing as a
promotional hero animation.

---

### Section 8: Documents and history

Include:

- Brochure
- Floor plan
- Payment schedule
- Verification documents
- Property update history

Documents should use plain-language labels and dates.

---

### Section 9: Next action

A restrained closing panel:

> Need clarification before deciding?

Actions:

- Ask RAMA an evidence question
- Arrange a viewing
- Speak to an advisor

---

# 8. Homes Discovery Redesign

## 8.1 Search-first, not filter-first

The top of the page should contain:

- Search field
- Buy or rent selection, where relevant
- Price
- Bedrooms
- More filters

Do not expose evidence, commute, payment, developer and accessibility filters
simultaneously.

## 8.2 Filter hierarchy

### Primary filters

- Location
- Price
- Bedrooms
- Property type

### Secondary filters

- Completion status
- Payment plan
- Property size
- Developer
- Amenities

### Advanced filters

- Verification level
- Commute preference
- Accessibility
- Service-charge range
- Handover period

Advanced filters should open in a drawer or dedicated panel.

---

## 8.3 Property card redesign

Each property card should show only:

- Image
- Property name and community
- Price
- Bedrooms and area
- Completion status
- One verification sentence
- Save action

Example:

> 17 of 20 key details verified

Do not place multiple trust badges, commute badges, cost badges and freshness
labels on every card.

---

## 8.4 Map behaviour

Desktop:

- Users may switch between list and split map view
- The map should not automatically occupy half the screen
- Selecting a map marker highlights one property card

Mobile:

- Separate list and map modes
- Do not compress both into the same viewport
- Preserve filters when switching modes

---

# 9. Comparison Redesign

## Principles

- Compare a maximum of three properties
- Show differences by default
- Keep identical rows collapsed
- Organise information into meaningful groups
- Highlight trade-offs, not winners

## Comparison groups

1. Price and complete cost
2. Space and layout
3. Handover and payment
4. Verification
5. Location and commute
6. Household fit

## Trade-off summary

RAMA may generate a neutral summary:

> Property A has the lowest initial cash requirement.\
> Property B provides the shortest commute.\
> Property C has the highest level of verified information.

RAMA should not declare a universal winner.

---

# 10. Personal Requirements Redesign

The current household brief should become a flexible profile called **My
requirements**.

## Structure

### Home

- Property type
- Bedrooms
- Minimum size
- Preferred communities

### Budget

- Maximum property price
- Available initial amount
- Monthly comfort range
- Cash or finance preference

### Daily life

- Work location
- Commute preference
- School requirements
- Mobility and accessibility needs

### Timing

- Ready property or off-plan
- Preferred handover period
- Purchase timeframe

Users should be able to:

- Skip any question
- Mark information as undecided
- Save partial progress
- Understand why each question is requested
- Modify answers from search results

Avoid a long step-by-step wizard unless a user explicitly chooses guided mode.

---

# 11. Nordic Visual Design System

## 11.1 Visual direction

RAMA should retain warmth associated with Dubai architecture while reducing
decorative luxury cues.

The new visual language should feel:

- Warm
- Architectural
- Precise
- Calm
- Editorial
- Contemporary
- Human

Avoid:

- Gold gradients
- Dark luxury themes
- Excessive glass effects
- Continuous marquees
- Large animated statistics
- Multiple badge colours
- Heavy card shadows
- Decorative map animations
- Excessive rounded containers

---

## 11.2 Core colour system

### Foundation

```css
--color-canvas: #f6f5f1;
--color-surface: #ffffff;
--color-surface-subtle: #efeee9;
--color-ink: #1e211f;
--color-text: #343936;
--color-muted: #6b726d;
--color-border: #d9ddd8;
```

### Brand

```css
--color-brand: #896548;
--color-brand-hover: #73533a;
--color-brand-soft: #eee5dc;
```

### Semantic

```css
--color-positive: #4f6b5c;
--color-positive-soft: #e7ede9;

--color-caution: #866c38;
--color-caution-soft: #f2eddf;

--color-critical: #984d44;
--color-critical-soft: #f5e7e5;
```

Unknown and unavailable states should normally use neutral colours:

```css
--color-unknown: #6b726d;
--color-unknown-soft: #eef0ee;
```

### Colour rule

No screen should contain more than:

- One dominant brand colour
- One positive semantic colour
- One warning or critical colour when required

---

## 11.3 Typography

Use one primary sans-serif family with strong multilingual support.

Recommended hierarchy:

```css
--font-size-caption: 0.75rem; /* 12px */
--font-size-small: 0.875rem; /* 14px */
--font-size-body: 1rem; /* 16px */
--font-size-body-lg: 1.125rem; /* 18px */
--font-size-h4: 1.25rem; /* 20px */
--font-size-h3: 1.5rem; /* 24px */
--font-size-h2: 2rem; /* 32px */
--font-size-h1: 2.5rem; /* 40px */
--font-size-display: clamp(2.75rem, 5vw, 4.5rem);
```

Guidelines:

- Body line height: 1.5–1.65
- Heading line height: 1.05–1.2
- Avoid all-uppercase labels
- Use sentence case
- Avoid font weights above 700
- Limit paragraphs to comfortable reading widths

---

## 11.4 Spacing system

Use an eight-point foundation with limited intermediate values:

```css
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-6: 24px;
--space-8: 32px;
--space-12: 48px;
--space-16: 64px;
--space-24: 96px;
--space-32: 128px;
```

Page-section spacing:

- Mobile: 64px
- Tablet: 80px
- Desktop: 96–128px

---

## 11.5 Layout

### Containers

- Wide application container: 1280px
- Standard page container: 1120px
- Reading container: 680–720px
- Form container: 560–640px

### Grid

- Desktop: 12 columns
- Tablet: 6 columns
- Mobile: 4 columns

Use visible alignment across sections. Avoid independent card grids with
inconsistent widths.

---

## 11.6 Control sizes

```css
--control-sm: 44px;
--control-md: 48px;
--control-lg: 56px;
```

The small size should not be used for primary mobile actions.

---

## 11.7 Radius

```css
--radius-sm: 6px;
--radius-md: 8px;
--radius-lg: 12px;
```

Avoid turning every section into a rounded card. Cards should be used when
content requires separation, not as the default page-building method.

---

## 11.8 Elevation

Use borders and spacing before shadows.

Recommended levels:

```css
--shadow-none: none;
--shadow-subtle: 0 1px 2px rgba(20, 24, 21, 0.06);
--shadow-floating: 0 8px 24px rgba(20, 24, 21, 0.10);
```

The floating shadow should be reserved for:

- Menus
- Dialogs
- Floating comparison tray
- Temporary overlays

---

## 11.9 Motion

```css
--duration-fast: 120ms;
--duration-standard: 180ms;
--duration-slow: 240ms;
--ease-standard: cubic-bezier(0.2, 0, 0, 1);
```

Permitted motion:

- Button feedback
- Drawer transitions
- Accordion expansion
- Tab transitions
- Map-marker selection
- Save confirmation
- Page-state transitions

Remove:

- Continuous marquees
- Animated evidence counters
- Repeated blur-fade entrances
- Decorative spring effects
- Automatic carousel movement

Respect reduced-motion preferences.

---

# 12. Component Architecture

## 12.1 Foundation components

Keep the primitive library small:

- Button
- Link
- Input
- Select
- Checkbox
- Radio
- Toggle
- Dialog
- Drawer
- Tooltip
- Tabs
- Accordion
- Table
- Toast

## 12.2 RAMA-specific components

- PropertyCard
- PropertySummary
- VerificationSummary
- EvidenceDetail
- CostSummary
- CostBreakdown
- CommuteSummary
- FitSummary
- ComparisonMatrix
- RequirementField
- AdvisorRequest
- DocumentList
- UpdateHistory
- EmptyState
- FilterDrawer

## 12.3 Component rule

Every component must have one clear responsibility.

For example:

`VerificationSummary` should not display:

- Full source history
- Property score
- Advisor CTA
- Cost warnings
- Developer details

It should summarise verification and open the detailed evidence view.

---

# 13. Design-System Architecture

Recommended hierarchy:

```text
packages/design-system
├── foundations
│   ├── colors.css
│   ├── typography.css
│   ├── spacing.css
│   ├── layout.css
│   ├── motion.css
│   └── elevation.css
├── primitives
│   ├── button
│   ├── input
│   ├── dialog
│   └── tabs
├── components
│   ├── property-card
│   ├── verification-summary
│   ├── cost-breakdown
│   └── comparison-matrix
├── patterns
│   ├── property-header
│   ├── search-filtering
│   ├── advisor-handoff
│   └── evidence-review
└── templates
    ├── marketing-page
    ├── search-page
    ├── property-page
    ├── account-page
    └── operations-page
```

Tokens should have three layers:

1. Primitive tokens\
   Raw values such as neutral colours and spacing units.

2. Semantic tokens\
   Roles such as text, border, surface, action and risk.

3. Component tokens\
   Local decisions such as button height or card padding.

Avoid page-specific token systems such as separate landing, discovery and
property colour definitions.

---

# 14. Application Architecture Redesign

The existing monorepo direction is technically reasonable, but the product
boundaries should be clearer.

## Recommended applications

```text
apps/
├── consumer-web
├── operations-web
├── partner-portal
├── owner-portal
└── api
```

## Shared packages

```text
packages/
├── design-system
├── contracts
├── domain
├── analytics
├── configuration
├── localisation
└── testing
```

## Consumer application

Designed for:

- Buyers
- Investors
- Renters where supported
- Advisors interacting with customers

## Operations application

Designed for:

- Evidence reviewers
- Administrators
- Quality-control staff

This interface may use higher density, tables and keyboard navigation without
imposing those patterns on buyers.

## Partner portal

Designed for:

- Developers
- Listing partners
- Data providers

Its primary tasks are:

- Upload information
- Resolve validation errors
- Track review state
- Respond to evidence requests

## Owner portal

Designed for:

- Property owners
- Listing representatives
- Asset managers

This should remain distinct from the partner ingestion workflow.

---

# 15. Backend Domain Structure

Use a modular domain architecture rather than organising the backend around
pages.

Recommended domains:

```text
catalog
properties
developments
locations
evidence
documents
costs
search
comparisons
requirements
advisory
appointments
notifications
identity
audit
```

Start with a modular monolith unless scale or independent deployment
requirements justify additional services.

Redis, queues and asynchronous processing should be introduced for specific
workloads such as:

- Document processing
- Evidence extraction
- Image processing
- Notification delivery
- Data synchronisation
- Long-running cost recalculations

They should not increase complexity in synchronous browsing flows.

---

# 16. Authentication and Security Experience

## Consumer authentication

Use one secure session model for consumer authentication.

Do not expose multiple role-specific token concepts through the front-end
architecture unless they are operationally necessary.

Server-side authorisation should evaluate:

- User identity
- Role
- Resource ownership
- Requested action
- Organisation context where applicable

## Route access

### Public

- Home
- Homes
- Property details
- Basic comparison
- Cost calculator
- Trust explanation
- Buying guides

### Authentication required

- Saved properties
- Saved comparisons
- Personal requirements
- Alerts
- Advisor requests
- Appointments
- Account settings

### Staff applications

- Separate application
- Separate access policy
- Stronger authentication controls
- Complete audit history
- Role-limited actions

## Advisor consent

Before advisor handoff, explicitly show:

- What information will be shared
- Who will receive it
- Why it is needed
- How the user may withdraw the request

---

# 17. Evidence Experience Redesign

## 17.1 Remove false precision

A single score such as 82% can imply more certainty than the underlying evidence
supports.

Prefer:

> 18 of 22 important property details verified

This gives users a concrete denominator.

## 17.2 Evidence hierarchy

### Level 1: Summary

> Most important details verified

### Level 2: Important exceptions

> Service charge and final accessibility details need confirmation.

### Level 3: Claim details

- Claim
- Current status
- Source
- Last checked
- Notes

### Level 4: Source document

The original evidence or authorised extract.

## 17.3 Evidence labels

Use plain language:

- Verified
- Developer-stated
- Estimated
- Needs confirmation
- Needs rechecking

Use icons and text together. Never rely on colour alone.

---

# 18. Content Design Standards

## Voice

RAMA should sound:

- Calm
- Direct
- Specific
- Neutral
- Respectful
- Non-promotional

## Avoid

- Best investment
- Guaranteed return
- Perfect home
- Unmissable opportunity
- Fully verified
- Risk-free
- Instant approval
- Luxury redefined

## Prefer

- Based on available records
- Developer-stated
- Estimated using the assumptions below
- This information has not yet been confirmed
- Last checked on…
- Ask RAMA to verify this detail
- Costs may vary depending on…

## Microcopy formula

1. State what RAMA knows
2. State what remains uncertain
3. Explain why it matters
4. Offer the next action

Example:

> The current payment schedule is supported by the developer’s published plan.
> Assignment fees after purchase have not yet been confirmed. Ask RAMA to verify
> them before reserving.

---

# 19. Landing Page Redesign

Limit the landing page to six sections.

## 1. Hero

Headline:

> Find a Dubai home with fewer surprises.

Supporting text:

> Compare verified property details, complete buying costs and everyday location
> fit in one calm experience.

Primary action:

> Explore homes

Secondary action:

> Calculate buying costs

## 2. Featured homes

Show a restrained selection of high-quality listings.

## 3. Three decision pillars

- Clearer facts
- Complete costs
- Better personal fit

## 4. How verification works

Three steps:

1. RAMA collects the available property information
2. Important claims are linked to sources
3. Missing or outdated details remain clearly identified

## 5. Cost transparency

Demonstrate the difference between advertised price and estimated acquisition
cost.

## 6. Closing action

> Start with a property, a neighbourhood or your budget.

Remove:

- Animated statistics
- Trust marquees
- Multiple testimonial carousels
- Excessive featured-property rows
- Repeating calls to create an account
- Decorative verification animations

---

# 20. Staff Evidence Workflow Redesign

The staff interface should not imitate the consumer interface.

## Recommended structure

### Left panel

- Review queue
- Filters
- Priority
- Assignment
- Review status

### Main panel

- Claim being reviewed
- Extracted document content
- Property context
- Historical versions

### Right panel

- Decision
- Evidence classification
- Expiry or recheck date
- Internal notes
- Request clarification

## Review actions

- Confirm
- Confirm with limitation
- Mark as developer-stated
- Mark as estimated
- Request additional evidence
- Reject
- Escalate

Every action should create an audit entry.

The Evidence Coverage Summary should be recalculated automatically, but
reviewers should see exactly which claims affected the result.

---

# 21. Implementation Roadmap

## Phase 1: Product simplification

- Define the three product pillars: Trust, Cost and Fit
- Rename customer-facing features
- Remove authentication from browsing
- Separate consumer and operational applications
- Approve the new route map
- Define the evidence summary model

## Phase 2: Design foundation

- Build primitive and semantic tokens
- Establish typography, layout and spacing
- Remove unnecessary colours
- Remove promotional motion
- Define component responsibilities
- Produce accessibility states

## Phase 3: Core buyer journey

Rebuild:

1. Landing page
2. Homes search
3. Property page
4. Save flow
5. Comparison
6. Cost calculator

## Phase 4: Personalisation

- My requirements
- Household fit
- Commute preferences
- Saved searches
- Property-change alerts

## Phase 5: Advisor experience

- Context-aware advisor request
- Consent controls
- Appointment management
- Advisor preparation summary

## Phase 6: Operational products

- Evidence review application
- Partner ingestion portal
- Owner listing portal
- Audit and escalation workflows

## Phase 7: Quality and optimisation

- Usability testing
- Accessibility review
- Mobile testing
- Content review
- Performance budgets
- Analytics validation
- Security review

---

# 22. Ten-Out-of-Ten Acceptance Criteria

RAMA should not be considered complete until it satisfies the following
conditions.

## Product clarity

- A new visitor understands RAMA’s purpose within the first screen
- Trust, cost and fit are identifiable without explanation
- Internal terms do not dominate customer-facing content

## Navigation

- The primary navigation contains no more than five items
- Buyers can browse properties without authentication
- Staff and partner tools are separated from the customer application
- Route names correspond to user intentions

## Visual simplicity

- Each page has one dominant action
- Saturated semantic colours are used sparingly
- Cards are not used as default section containers
- Typography remains readable without 11px interface text
- Motion is functional rather than decorative

## Discovery

- Primary filters remain visible and simple
- Advanced filters are progressively disclosed
- Property cards contain only decision-critical information
- Map and list modes work independently on mobile

## Property comprehension

- The first viewport explains price, property, completion and verification
- Costs are summarised before detailed breakdowns
- Unknown information is clearly stated
- Source documents are available without dominating the page
- Advisor contact does not interrupt exploration

## Comparison

- No more than three properties are compared
- Differences appear first
- Trade-offs are explained neutrally
- RAMA does not declare a universal winner

## Personalisation

- The requirements profile is optional
- Users may skip uncertain questions
- Every personal question has a stated purpose
- Fit conclusions are explainable

## Trust

- Every material claim can expose its source and last review date
- Unknown is not represented as false
- Estimated and developer-stated claims are distinguishable
- Scores do not imply unsupported precision

## Accessibility

- Core actions are keyboard accessible
- Status does not depend on colour alone
- Touch targets are comfortably usable
- Reduced-motion preferences are respected
- Forms provide clear labels, instructions and errors

## Operational integrity

- Every evidence decision is auditable
- Reviewers can identify the exact claim being changed
- Partner errors are actionable
- Role-based experiences expose only necessary functions

---

# Final Direction

RAMA should stop behaving like a property intelligence control centre presented
to consumers.

It should become a calm decision companion.

The final experience should communicate:

> Here is the home.\
> Here is what is known.\
> Here is what remains uncertain.\
> Here is what it may really cost.\
> Here is how it fits your life.\
> Here is the next sensible action.

That simplicity is the foundation of a genuine Nordic product experience.

The technology should remain sophisticated underneath. The interface should not
feel sophisticated to use. It should feel obvious.
