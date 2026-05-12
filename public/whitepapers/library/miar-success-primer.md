# MIAR Success Primer

## Aircraft Taxonomy, Imagery Constraints, Evidence Standards, and SHIELD Alignment

Date: 2026-05-12

## Purpose

This primer is meant to answer the strategic domain questions that will make or break
MIAR early:

- what aircraft taxonomy should matter first
- what imagery quality customers will realistically have
- what the first customer is actually likely to value
- what edge hardware profile to target
- what evidence standard will be needed for acceptance
- how MIAR should plug into `project-shield` without confusing model output for
  canonical intelligence truth

This is not a generic computer vision note. It is a product, data, and operational
primer intended to help shape MIAR as a credible defense intelligence capability.

It is grounded in:

- the MIAR PRD in this repository
- SHIELD's ORBAT ingest and provenance model
- SHIELD's geospatial evidence architecture
- SHIELD's RDDF platform schema approach

## Executive View

If MIAR is to succeed, it should not start by trying to identify every aircraft in the
world at arbitrary fidelity. That framing is too broad, too expensive, and too hard to
defend operationally.

The right opening move is narrower:

1. Build a layered aircraft ontology, not a flat label list.
2. Optimize first for mixed-resolution overhead imagery, not only ideal 30 cm scenes.
3. Assume the first serious customer will care most about sovereign deployment and
   defensible change detection, with fine-grained subtype identification being valuable
   but selective.
4. Treat evidence quality and provenance as product features, not as afterthoughts.
5. Integrate MIAR into SHIELD as an evidence-and-claims producer first, and only
   promote outputs into ORBAT truth through governed ingest and analyst review.

In practical terms, MIAR v1 should aim to answer:

- is there aircraft activity here
- how many aircraft are likely present
- what broad role or family do they belong to
- what changed between scenes
- how confident is the model, and why
- what exact imagery and model version support the claim

That is a far better first capability than promising universal subtype recognition
without regard to GSD, look angle, cloud, shadow, or analyst trust.

## 1. The Real Problem MIAR Is Solving

MIAR is not just a detector. It is an imagery-driven assessment system for military
aviation posture.

The problem is not "can a model draw boxes around aircraft." The problem is closer to:

- can we monitor relevant installations repeatedly
- can we tell whether aircraft are present, absent, dispersed, or newly arrived
- can we classify them to the right level given the actual imagery quality
- can we compare scenes over time
- can we produce evidence that an analyst, operator, or procurement reviewer can trust

That means MIAR lives at the intersection of five disciplines:

- remote sensing
- military aviation domain knowledge
- ontology and data modeling
- evidence management and provenance
- operational deployment engineering

If any one of those is weak, the product becomes brittle.

## 2. Aircraft Taxonomy: What Should Matter First

### 2.1 Why this question is more important than it looks

An aircraft taxonomy is not just a label list for model training. It determines:

- what classes you annotate
- what confusions are acceptable
- what outputs the UI should expose
- what performance you can realistically promise at each resolution
- how results map into SHIELD's platform and ORBAT structures

Most early failures in defense object recognition happen because the team chooses one of
two bad extremes:

- the taxonomy is too broad, so the outputs are operationally vague
- the taxonomy is too fine, so the outputs become statistically weak and hard to trust

The correct answer is a layered taxonomy.

### 2.2 Recommended taxonomy model

MIAR should use at least four recognition layers:

#### Layer 0: Presence

Question:

- is there an aircraft-like object here at all

Output style:

- aircraft present
- aircraft absent
- possible aircraft

This layer exists because every downstream task depends on basic detection quality.

#### Layer 1: Broad role class

Question:

- what broad military aviation role does this object likely belong to

Recommended broad classes:

- fighter / interceptor
- strike / multirole
- bomber
- transport
- tanker
- AEW&C
- ISR / MPA / SIGINT
- trainer
- rotary-wing
- UAV / UCAV
- civil or non-relevant aircraft

This is the first layer that tends to remain useful across degraded resolution.

#### Layer 2: Family

Question:

- what recognizable airframe family is this

Examples:

- Flanker family
- Fulcrum family
- F-16 family
- JF-17 family
- J-10 family
- Mirage III/V family
- C-130 family
- Y-20 family
- KJ-500 family

Family classification is often the highest-value stable output when imagery is good but
not perfect.

#### Layer 3: Variant / subtype

Question:

- which specific variant is most likely

Examples:

- JF-17 Block I vs Block II vs Block III
- F-16A MLU vs F-16C Block 52+
- J-10A vs J-10C
- Mirage 5PA vs Mirage III trainer variants

This layer is valuable, but only where the imagery and training data support it.

#### Layer 4: Operator-specific interpretation

Question:

- what does this detection imply in the context of this base, operator, and watchlist

Examples:

- J-10C at Minhas has different significance than J-10C in a generic catalog
- tanker presence at a strike base may matter more than the precise tanker variant
- AEW&C appearance may matter more than fighter subtype count in an operational watchbox

This layer is not pure computer vision. It is context-aware intelligence interpretation.

### 2.3 What exact taxonomy matters first

The answer is not "global all aircraft" first.

That approach creates three problems:

- too many rare classes
- too much label ambiguity
- too little alignment with the first buyer's actual mission

The recommended order is:

1. broad global aircraft ontology
2. Indo-Pacific operational subset
3. adversary- and operator-specific watchlists
4. only then broadening toward a wider global catalog

In other words, the global ontology should exist as a backbone, but the production
recognition target for v1 should be a prioritized regional and operator-specific subset.

### 2.4 Recommended v1 ontology structure

Use a backbone ontology that separates:

- platform domain: `air`
- platform shape family: `fixed-wing`, `rotary-wing`, `uav`
- role
- family
- variant
- operator context

This aligns naturally with SHIELD's RDDF convention:

- `rddf://air/fixed-wing/<slug>`
- `rddf://air/rotary-wing/<slug>`
- `rddf://air/uav/<slug>`

That means MIAR should not emit only display strings. It should ultimately emit:

- a human-readable hypothesis
- a role label
- a family label
- an optional subtype label
- an optional `platform_rddf_id` when the confidence is high enough

### 2.5 Indo-Pacific priority list

For an Indo-Pacific-first defense product, the first priority list should be built around
mission relevance, not aircraft fandom.

Recommended priority bands:

#### Band A: Core operationally decisive aircraft

- PLA / PLANAF fighters: J-20, J-16, J-11 family, J-10C
- PLA support aircraft: KJ-500, Y-20, Y-9 special mission variants, H-6 family
- PAF fighters: F-16 variants, JF-17 variants, J-10CE, Mirage III/V family, F-7 family
- PAF support aircraft: Saab 2000 AEW&C, ZDK-03, IL-78, C-130, CN-235
- IAF / IN / Indian support fleet: Su-30MKI, Rafale, Mirage 2000, MiG-29, Tejas,
  Jaguar, C-17, C-130J, IL-76, P-8I, Netra, Phalcon

Why these first:

- they appear at the most watched installations
- they matter for force readiness and deployment posture
- they create immediate buyer value in South Asia and broader Indo-Pacific monitoring

#### Band B: Rotary and UAV classes with high operational relevance

- Z-20 and other PLA rotary assets where visible at key installations
- PAF and PLA UAV / UCAV families such as Wing Loong and Shahpar
- TB2 / Akinci where export-user monitoring matters

These are important, but they often require separate handling because UAV and rotary
recognition behave differently from fixed-wing classification.

#### Band C: Broader theater reference fleets

- Japan, Taiwan, South Korea, Australia, and U.S. Indo-Pacific reference fleets
- commercial and civilian confusers commonly seen near military infrastructure

These matter for reducing false alarms and for future theater-wide support, but they do
not need to dominate v1 if the first customer problem is South Asia or adversary watch.

### 2.6 Adversary/operator-specific watchlists

A watchlist is different from a taxonomy.

Taxonomy answers:

- what is this object

Watchlist answers:

- which objects should the analyst care about first

A good watchlist should be operator-scoped and base-scoped. For example:

- high-priority tanker watchlist
- AEW&C watchlist
- strike-fighter modernization watchlist
- nuclear-delivery relevant watchlist
- trainer-only background watchlist

This matters because the product should prioritize:

- alerting thresholds
- UI emphasis
- review queues
- procurement and operational narratives

In practice, MIAR should support:

- a global ontology backbone
- a regional training subset
- customer-configurable watchlists on top

### 2.7 The most important taxonomy principle

Do not force fine-grained labels where the evidence supports only a broader family.

That means outputs should allow statements like:

- `fighter family likely`
- `Flanker family, subtype unresolved`
- `transport aircraft, C-130 class likely`

This is not a weakness. It is disciplined model behavior.

## 3. Imagery Resolution: What Customers Will Actually Have

### 3.1 The important framing

The question is not "can the model work at 30 cm." The question is:

- what imagery quality mix will real customers possess, license, or collect
- what claims can MIAR defend at each quality band

The honest answer is that most customers will have mixed catalogs:

- some premium 30 cm or similar commercial imagery
- some 50 cm imagery
- some 1 m imagery
- some lower-quality archive, oblique, compressed, or cloudy material
- occasionally their own airborne or sovereign imagery with its own sensor behavior

So MIAR should be designed for mixed-quality operating reality, not benchmark ideality.

### 3.2 Why GSD is only part of the story

Ground sample distance matters, but it is not enough by itself.

Actual recognition quality depends on:

- GSD
- look angle / off-nadir distortion
- modulation transfer function and sensor sharpness
- compression artifacts
- sun angle and shadows
- cloud and haze
- runway clutter and occlusion
- aircraft orientation
- whether the aircraft is parked open, sheltered, netted, or partially obscured

Two scenes with the same nominal GSD can produce very different recognition outcomes.

### 3.3 What 30 cm usually enables

At 30 cm GSD, a 15 m fighter is roughly represented by around 50 pixels in length.
That is enough for:

- reliable aircraft presence detection in many open-apron cases
- broad role classification
- family-level classification for many distinctive airframes
- some subtype discrimination where shape cues are strong and acquisition quality is good
- counting and compare workflows at useful fidelity

30 cm is the best place to pursue fine-grained overhead aircraft classification early.

But even here, subtype claims should remain conditional when:

- the scene is off-nadir
- the aircraft is camouflaged or shadowed
- family members are morphologically close
- support equipment or shelters obscure key geometry

### 3.4 What 50 cm usually enables

At 50 cm GSD, the same fighter may be around 30 pixels long. This is still workable for
many tasks, but the ceiling drops:

- presence detection remains useful
- broad class and many family calls remain viable
- subtype separation becomes much less reliable except for very distinctive aircraft
- count change and posture change remain valuable

This resolution often becomes the real commercial workhorse because it is more common and
more affordable than premium 30 cm tasking.

If MIAR cannot operate credibly at 50 cm, it will likely disappoint real customers.

### 3.5 What 1 m usually enables

At 1 m GSD, many fighters are near the edge of meaningful fine-grained recognition.

What still works:

- broad aircraft presence in open areas
- large aircraft detection
- broad count changes
- base activity heuristics
- runway and apron occupancy shifts

What becomes weak:

- fine subtype identification for tactical aircraft
- reliable separation of visually similar fighter families
- robust confidence in small UAV or helicopter classes unless they are unusually exposed

This means 1 m imagery is often more useful for change detection and situational trend
monitoring than for precise aircraft taxonomy.

### 3.6 The real customer answer

The most realistic assumption is:

- customers will have mixed catalogs
- they will want one system to work across them
- they will accept different output confidence and class depth by imagery band

Therefore MIAR should expose performance and output rules per imagery bucket:

- `high-res premium`: richer class depth allowed
- `mid-res commercial`: family-first classification
- `low-res archive`: presence and change-oriented outputs

The UI and API should make these limits visible.

### 3.7 Recommended product principle

MIAR should be resolution-aware, not resolution-agnostic.

That means:

- per-scene quality assessment
- per-result confidence calibration
- ontology depth conditioned on scene quality
- evaluation reported separately by GSD band

This is one of the most important credibility moves the product can make.

## 4. What the First Customer Will Care About Most

### 4.1 The four candidate priorities

Your question identifies four possible top-level buyer priorities:

- broad aircraft presence
- fine-grained subtype identification
- change detection over time
- sovereign deployment

All four matter. The issue is which one drives the purchase decision first.

### 4.2 Broad aircraft presence

This matters when the customer wants:

- wide coverage
- lower compute cost
- faster deployment
- baseline watchbox monitoring

Presence detection is useful, but by itself it is usually not enough to create durable
procurement differentiation unless it ties directly to change and evidence.

### 4.3 Fine-grained subtype identification

This is the most seductive capability and the easiest one to oversell.

It matters when the customer wants:

- modernization tracking
- squadron composition insight
- adversary equipment discrimination
- higher-order planning cues

It is valuable, but only for a selected watchlist and only at suitable imagery quality.
If this becomes the whole product promise, MIAR risks becoming fragile.

### 4.4 Change detection over time

This is often the most repeatably valuable operational workflow.

Why:

- it fits recurrent monitoring
- it works even when subtype certainty is limited
- it gives analysts a reason to return to the system
- it ties directly to alerting and watchbox value

Change detection can answer:

- new arrivals
- departures
- surge patterns
- apron saturation
- shelter occupancy shifts
- staging before exercises or conflict events

This is often where the product becomes habit-forming.

### 4.5 Sovereign deployment

For serious defense and national-security buyers, sovereign deployment is often not an
optional feature. It is part of the qualification threshold.

It signals:

- the customer can run on their infrastructure
- their imagery does not need to leave controlled environments
- their audit and security posture can be maintained
- they are not locked into a black-box foreign API

For many customers, sovereign deployment may matter more than an extra few points of raw
classification accuracy.

### 4.6 Likely first-customer pattern

The most likely serious buyer priority stack is:

1. sovereign deployment
2. change detection over time
3. broad aircraft presence and counting
4. fine-grained subtype identification for selected high-value watchlist classes

This does not mean subtype classification is unimportant. It means subtype should be
packaged as a selective premium layer on top of a broader monitoring and evidence system.

### 4.7 Recommended v1 value proposition

The strongest early value proposition is:

"MIAR gives you sovereign, evidence-linked monitoring of military aviation activity over
key installations, with aircraft detection, family-aware classification where imagery
permits, and defensible scene-to-scene change analysis."

That is a much stronger and more survivable claim than:

"MIAR identifies every aircraft subtype from satellite imagery."

## 5. Target Edge Hardware Profile

### 5.1 Why hardware choice is really a product choice

Edge hardware determines:

- latency expectations
- power and thermal budget
- model size
- quantization strategy
- whether the product is autonomous, connected, or hybrid

You should not ask this as a pure engineering afterthought. It changes the product shape.

### 5.2 Phone

Strengths:

- ubiquitous
- highly portable
- low training cost for users

Weaknesses:

- limited sustained inference capacity
- constrained memory and thermal budget
- difficult secure deployment story for serious defense contexts
- poor fit for large-scene overhead analysis unless used as a thin review client

Best use:

- viewer
- alert receiver
- lightweight field confirmation surface

Not recommended as the primary MIAR inference target.

### 5.3 Rugged Android

Strengths:

- field-usable form factor
- better defense procurement fit than consumer phones
- useful for disconnected review or light inference

Weaknesses:

- still constrained compared with laptops and embedded GPU devices
- fragmented device management
- on-device heavy vision models remain challenging

Best use:

- tactical viewer
- lightweight detection client
- metadata capture and synchronization endpoint

Useful, but still probably not the first primary inference target unless the mission is
explicitly handset-first.

### 5.4 Jetson

Strengths:

- real edge-AI identity
- strong fit for embedded, vehicle, or fixed tactical node deployments
- good for compact detection pipelines

Weaknesses:

- constrained compared with workstation GPUs
- engineering time needed for optimized runtimes
- may push you toward smaller models earlier

Best use:

- compact edge detector
- forward-deployed inference node
- autonomous or semi-connected tactical processing

Jetson is a good target if MIAR wants a true edge deployment story early.

### 5.5 x86 laptop

Strengths:

- easiest operational starting point
- good analyst workstation fit
- broad compatibility
- easiest for on-prem sovereign deployments and demonstrations
- easier debugging, packaging, and offline batch workflows

Weaknesses:

- less "tactical" marketing aura than embedded edge devices
- may not suit ultra-constrained field use

Best use:

- analyst-side local inference
- forward-deployed portable workstation
- first sovereign pilot packaging

This is the most pragmatic first hardware target for serious customer pilots.

### 5.6 Recommended hardware strategy

Use a two-track approach:

#### Track A: x86 laptop or workstation as the first serious deployment target

Why:

- fastest path to stable sovereign pilots
- easiest path to on-prem demo and evaluation
- best support for batch compare and analyst workflows

#### Track B: Jetson as the first constrained edge target

Why:

- gives a credible tactical edge story
- forces discipline in model compression and runtime design
- still realistic for defense experimentation

Recommended non-goal for v1:

- do not make phone the primary edge target

Phone and rugged Android can be added as review and alert surfaces after the inference and
evidence stack is stable.

## 6. Evidence Standard and Acceptance

### 6.1 Why this matters

A defense AI product is not accepted merely because the model is accurate on a test set.

Acceptance depends on:

- what the output is used for
- how much traceability is required
- whether a human is expected to review it
- whether it affects planning, procurement, or legal posture

The three evidence standards you listed are the right way to think about this.

### 6.2 Tier 1: Internal analyst advisory

This is the lightest acceptance tier.

Meaning:

- the output assists analysts
- it does not directly create canonical truth without review
- it can be exploratory and triage-oriented

What is usually required:

- scene identifier and timestamp
- model version
- bounding geometry or detection region
- class hypothesis and confidence
- analyst review affordance

What is acceptable:

- family-level uncertainty
- lower confidence thresholds for triage
- rapid iteration

This is the correct first operating tier for MIAR.

### 6.3 Tier 2: Operational planning support

This is materially more demanding.

Meaning:

- outputs may influence readiness judgments, watchbox alerts, or force-posture analysis
- false positives and silent misses have larger consequences

What is required:

- reproducible scene lineage
- quality metadata
- explicit confidence policy
- compare history
- analyst confirmation or review workflow
- known limitations by imagery band

At this tier, MIAR needs calibrated behavior, not just raw model outputs.

### 6.4 Tier 3: Procurement or legal traceability

This is the strictest tier.

Meaning:

- the output may support formal reporting, dispute, procurement justification, or audit

What is required:

- immutable source references
- durable storage of original imagery references and derivative artifacts
- model version pinning
- run logs and parameter traceability
- review history
- clear separation between model hypothesis and human-adopted conclusion

At this level, a black-box detection without provenance is not enough.

### 6.5 Recommended MIAR evidence posture

MIAR should enter the market with a stated posture of:

- primary tier: internal analyst advisory
- secondary tier: operational planning support after governed review
- procurement/legal tier: only with explicit provenance and approval workflows

That keeps the product ambitious but honest.

### 6.6 What the evidence object should include

Every MIAR result should be able to point to:

- source scene id
- acquisition time
- sensor/provider metadata if available
- AOI or installation linkage
- image chip or derived crop reference
- model family and exact version
- preprocessing notes
- class hypothesis ladder
- confidence values
- comparison context if this was a change result
- analyst annotations and disposition if reviewed

This is where SHIELD becomes important.

## 7. How MIAR Should Work with SHIELD

### 7.1 The most important architectural boundary

MIAR outputs should not immediately become canonical ORBAT truth.

That would violate the design discipline already present in SHIELD:

- ORBAT truth enters through governed ingest
- RDDF links enrich platform identity
- governance fields are derived, not manually patched
- frontend conveniences are not canonical truth

So the first safe rule is:

- MIAR produces evidence, detections, candidate claims, and review objects
- analysts confirm, reject, annotate, or promote those outputs
- only then should durable force-structure implications be ingested into ORBAT or linked
  to platform truth

### 7.2 Relevant SHIELD concepts MIAR should align to

From SHIELD's current architecture, the most relevant components are:

- installation-centric geospatial analysis
- source assets and uploaded evidence
- imagery scenes and footprints
- analyst annotations
- claims and provenance
- ORBAT installations, deployments, units, and airframes
- RDDF platform identifiers

This is a strong fit.

MIAR does not need to invent a separate worldview if it aligns to these boundaries.

### 7.3 Recommended MIAR-to-SHIELD data flow

The cleanest integration model is:

1. Scene enters SHIELD as a source asset or imagery scene.
2. MIAR runs detection and classification over the scene or AOI.
3. MIAR stores derived artifacts as evidence-linked products:
   - detections
   - chips
   - confidence summaries
   - compare outputs
4. SHIELD exposes those outputs in the `Imagery` and `Evidence` surfaces for a selected
   installation.
5. Analysts annotate and decide whether the output supports a claim.
6. Only approved claims inform ORBAT refresh through the ingest boundary.

This preserves:

- provenance
- reviewability
- reversibility
- distinction between model hypothesis and accepted intelligence truth

### 7.4 How taxonomy maps into SHIELD's RDDF model

When MIAR is confident enough, it should try to emit:

- `platform_rddf_id`
- `asset_designation`
- role / family labels

When it is not confident enough, it should emit:

- broad role
- family hypothesis
- unresolved subtype state

This is aligned with SHIELD's current philosophy:

- ORBAT can hold unresolved or mixed designations
- RDDF enrichment is optional and derived when linkage is strong
- governance can reflect incompleteness explicitly

### 7.5 What should remain outside ORBAT

These should remain evidence-side first:

- raw detections
- model confidences
- speculative subtype calls
- per-scene compare deltas before review
- heuristic posture cues

These can later inform ORBAT or installation assessment, but they should not be confused
with canonical force-structure rows on day one.

### 7.6 Good initial SHIELD integration surfaces

The strongest early integration surfaces are:

- installation `Imagery` tab
- installation `Evidence` tab
- compare workflow around selected bases
- watchbox alerts tied to installations or AOIs

That fits SHIELD's installation-first geospatial architecture very well.

## 8. Recommended Product Decisions for MIAR v1

### 8.1 Taxonomy decision

Choose:

- global ontology backbone
- Indo-Pacific operational subset
- operator-specific watchlists

Do not choose:

- flat world-all-aircraft subtype taxonomy for v1 production scope

### 8.2 Imagery decision

Choose:

- mixed-catalog support as a core design principle
- explicit output-depth policy by GSD and scene quality

Do not choose:

- a product claim that assumes all customers have premium 30 cm imagery

### 8.3 Customer-value decision

Choose:

- sovereign deployment plus change detection as the lead wedge
- selective fine-grained classification as a high-value layer on top

Do not choose:

- subtype recognition as the only core story

### 8.4 Hardware decision

Choose:

- x86 laptop/workstation as first serious sovereign deployment target
- Jetson as first constrained edge target

Do not choose:

- phone as primary inference target

### 8.5 Evidence decision

Choose:

- analyst advisory as the initial acceptance tier
- planning-support readiness only after traceability and review flows are strong

Do not choose:

- casual untracked detections that cannot be reproduced or audited

## 9. A Concrete 90-Day Framing

If the goal is to reduce ambiguity quickly, the next 90 days should answer five practical
questions in order.

### 9.1 Build the ontology and watchlist

Deliver:

- broad aircraft role taxonomy
- Indo-Pacific v1 family list
- priority operator watchlists
- mapping rules to RDDF identifiers

Success condition:

- there is no confusion between role, family, subtype, and operator watchlist

### 9.2 Establish imagery-band expectations

Deliver:

- evaluation bins for 30 cm, 50 cm, 1 m, and mixed/other
- acceptance rules for what output depth is allowed in each bin

Success condition:

- the team stops discussing "accuracy" as one universal number

### 9.3 Define the evidence object

Deliver:

- MIAR detection and compare output schema
- lineage requirements
- review workflow fields

Success condition:

- every result can be traced back to source imagery and model version

### 9.4 Define the SHIELD integration boundary

Deliver:

- MIAR evidence into geospatial imagery/evidence surfaces
- claim-review workflow
- promotion path into ORBAT ingest only after review

Success condition:

- nobody treats model outputs as canonical ORBAT truth by default

### 9.5 Package the first deployment targets

Deliver:

- x86 sovereign pilot package
- Jetson demonstration package

Success condition:

- MIAR is deployable where the customer actually needs it, not just runnable in a lab

## 10. Final Recommendation

To make MIAR successful, think of it as a sovereign military imagery assessment program,
not just a classifier.

The winning early shape is:

- installation-centric
- aircraft-first
- change-aware
- evidence-linked
- resolution-aware
- watchlist-driven
- SHIELD-integrated

That means the first product should be able to say:

- "there are aircraft here"
- "this is likely this family or role"
- "this changed since the prior scene"
- "here is the evidence, confidence, and provenance"
- "this can run inside your environment"

That is a credible wedge.

Trying to promise universal, fine-grained, legally defensible aircraft subtype inference
across all imagery bands from day one is not.

## Appendix A: Suggested Indo-Pacific v1 Watchlist Categories

Suggested customer-facing watchlist buckets:

- modernization fighters
- long-range strike aircraft
- AEW&C
- tankers
- maritime patrol / ISR
- strategic transport
- UCAV / high-value UAV
- dispersal or surge indicators

Suggested operator scopes:

- PLA Air Force
- PLA Naval Aviation
- Pakistan Air Force
- Indian Air Force
- Indian Navy aviation
- optional allied reference fleets for theater context

## Appendix B: SHIELD Alignment Notes

MIAR should align with these existing SHIELD ideas:

- installations are the anchor investigation object
- imagery belongs in the geospatial evidence plane
- claims and annotations are first-class analyst outputs
- ORBAT truth is ingest-governed
- RDDF ids are the stable platform identity backbone
- unresolved states are acceptable and should be represented explicitly

That alignment is a strategic advantage. It means MIAR can become the imagery-recognition
engine inside a larger defensible intelligence workflow instead of becoming a detached
demo model.
