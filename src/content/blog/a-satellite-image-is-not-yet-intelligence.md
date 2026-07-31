---
title: "A satellite image is not yet intelligence"
description: "An examination of the technical and analytical controls required to produce reliable intelligence from remote-sensing imagery."
summary: "Satellite imagery becomes operationally useful when sensor limits, temporal context, automated analysis, analyst review, and provenance are handled as one system."
status: "published"
category: "Analysis"
tags:
  - "imagery intelligence"
  - "remote sensing"
  - "evidence"
keywords:
  - "satellite imagery intelligence"
  - "defence remote sensing"
  - "military change detection"
  - "imagery analyst review"
author:
  name: "ReachDefence"
  organization: "ReachDefence"
publishedAt: 2026-07-31
updatedAt: 2026-07-31
readingMinutes: 7
featured: true
noindex: false
heroImage: "/social/a-satellite-image-is-not-yet-intelligence.png"
heroImageAlt: "MIAR editorial graphic for A satellite image is not yet intelligence"
heroImageWidth: 1200
heroImageHeight: 630
socialImage: "/social/a-satellite-image-is-not-yet-intelligence.png"
socialImageAlt: "MIAR editorial card reading A satellite image is not yet intelligence"
socialImageWidth: 1200
socialImageHeight: 630
socialTitle: "A satellite image is not yet intelligence"
socialDescription: "The technical and analytical controls required to produce reliable intelligence from remote-sensing imagery."
related: []
gallery:
  - src: "/imagery/bholari-2025.png"
    alt: "Bholari airbase reference satellite imagery from 2025"
    caption: "Reference scene / 2025"
    width: 1564
    height: 1136
  - src: "/imagery/bholari-2026.png"
    alt: "Bholari airbase follow-on satellite imagery from 2026"
    caption: "Follow-on scene / 2026"
    width: 1546
    height: 1090
---

Satellite imagery records the condition of a location at a specific time and under specific collection conditions. Intelligence production begins when that observation is assessed against a defined requirement, placed in context, and supported by evidence that can be reviewed.

This distinction is important in the evaluation of imagery-intelligence systems. Image quality and model performance are visible and easy to demonstrate. Operational reliability depends on less visible controls: whether the source is suitable for the question, whether observations can be compared, whether automated results remain within the limits of the imagery, and whether an analyst can verify the resulting assessment.

## The collection determines what can be assessed

Ground sample distance is only one measure of image utility. Viewing angle, atmospheric conditions, cloud, shadow, compression, scene coverage, and acquisition geometry all affect interpretation. Temporal, spectral, and radiometric resolution can be as consequential as spatial resolution, depending on the requirement.

Sensor type also determines the character of the evidence. Electro-optical imagery supports direct visual interpretation in suitable daylight and weather. Synthetic aperture radar can provide day-and-night, all-weather coverage, but introduces different geometry and signal characteristics. Infrared imagery can indicate thermal activity where the sensor, resolution, and collection conditions permit it.

An assessment should therefore state what the available imagery supports. It should not infer a level of identification solely from a nominal resolution figure.

## Temporal context establishes significance

A single scene can establish that an object or condition was visible at the time of collection. It cannot establish whether the observation is routine, exceptional, or part of a developing pattern.

That judgement requires an appropriate baseline. Depending on the mission, the relevant comparison may be the previous collection, the same period in an earlier year, a known low-activity state, or a series of observations describing normal activity. Baseline selection is an analytical decision and should be retained with the result.

The Bholari scenes shown above demonstrate the value of this context. Each scene can be reviewed independently. When registered as observations of the same location, they also support comparison of visible aircraft, position, and use of the site. The archive is part of the analytical record, not simply a repository for older images.

## Automated analysis must match the available evidence

Detection, classification, and interpretation are separate analytical steps. A model may detect an object without having sufficient evidence to identify its exact type. The imagery may support a broad class, such as aircraft or transport aircraft, while remaining insufficient for a subtype assessment.

An operational system should preserve these distinctions. Class labels and confidence should reflect the quality of the source and the level of identification that can be defended. When conditions are poor, reducing specificity is preferable to presenting an unsupported classification.

Interpretation requires additional context. A change in count, location, or disposition may be relevant, but it does not explain its own significance. Scene coverage, collection conditions, routine site activity, and other available sources remain part of the analyst's judgement.

## Change analysis requires controlled comparison

Two images of the same location will often differ even when the site has not materially changed. Viewing geometry, illumination, season, cloud, shadow, sensor mode, and registration can all produce apparent differences. Radar imagery adds effects associated with speckle and acquisition geometry.

Reliable change analysis therefore depends on preprocessing, quality assessment, image registration, and a documented baseline. The result should identify the observations compared, the area in which change was measured, the confidence assigned to the result, and any limitations affecting interpretation.

A change alert without this supporting record is difficult to evaluate. Analysts need direct access to the source scenes and the comparison that produced the alert.

## Machine findings and analyst assessments are separate records

Automated analysis can reduce the volume of imagery requiring manual inspection. It can identify candidate objects, produce counts, compare observations, and prioritise changes for review. These outputs remain machine findings until they have passed the review required by the organisation using them.

The system should maintain separate states for model inference, analyst review, and any finding approved for downstream use. Corrections and rejections should remain part of the record. This preserves accountability and provides useful evidence for subsequent model evaluation.

## Provenance supports operational trust

Every material finding should be traceable to the observation and analytical process that produced it. The record should retain, at minimum:

- Source scene and acquisition time
- Sensor and image metadata relevant to interpretation
- Area of interest and usable scene coverage
- Model version, proposed class, and confidence
- Baseline lineage for comparison results
- Analyst decision, annotation, and review state

This information allows another authorised user to inspect, challenge, reproduce, or revise an assessment. It also prevents counts and classifications from becoming detached from the imagery on which they were based.

## Building the complete capability

An imagery-intelligence capability is a coordinated system of collection access, sensor understanding, preprocessing, temporal analysis, automated exploitation, analyst review, and evidence management. Model accuracy is one measure of that system, but it is not a substitute for the rest.

MIAR is being developed to support this complete workflow across imagery from multiple providers. It maintains source observations, comparison history, machine findings, and analyst decisions as distinct but connected records. The objective is to give defence and intelligence teams a reviewable account of what was observed, what changed, and how each conclusion was reached.

The standard for imagery intelligence should be clear: an assessment must be supported by suitable collection, bounded by the available evidence, and traceable to its source.
