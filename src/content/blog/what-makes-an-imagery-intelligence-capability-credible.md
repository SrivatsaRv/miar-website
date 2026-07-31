---
title: "Six tests for an imagery-intelligence system"
description: "Six practical checks for evaluating the scope, evidence, review boundaries, and deployment claims of an imagery-intelligence system."
summary: "A practical way to assess scope, labels, resolution limits, evidence, analyst review, and deployment before trusting a model demo."
status: "draft"
category: "Analysis"
tags:
  - "imagery intelligence"
  - "GEOINT"
  - "analyst review"
keywords:
  - "imagery intelligence system"
  - "satellite object detection"
  - "GEOINT evaluation"
  - "analyst review workflow"
author:
  name: "ReachDefence"
  organization: "ReachDefence"
publishedAt: 2026-07-09
updatedAt: 2026-07-30
readingMinutes: 7
featured: true
noindex: false
heroImage: "/imagery/annotated-airfield-scene.png"
heroImageAlt: "Annotated monitored-airfield scene showing aircraft detections and an intelligence summary"
heroImageWidth: 1752
heroImageHeight: 898
socialImage: "/imagery/annotated-airfield-scene.png"
socialImageAlt: "Annotated monitored-airfield scene showing aircraft detections and an intelligence summary"
socialTitle: "Six tests for an imagery-intelligence system"
socialDescription: "A practical checklist for evaluating imagery AI beyond a model demonstration."
related:
  - "why-miar-starts-with-cadence"
gallery:
  - src: "/imagery/monitored-site-reference-2025.png"
    alt: "Reference satellite imagery of a monitored airbase from 2025"
    caption: "Reference scene / 2025"
    width: 1564
    height: 1136
  - src: "/imagery/monitored-site-follow-on-2026.png"
    alt: "Follow-on satellite imagery of the same monitored airbase from 2026"
    caption: "Follow-on scene / 2026"
    width: 1546
    height: 1090
---

Detection sits inside a longer chain. The image has to be suitable for the question. The label has to match what the pixels support. The finding needs a source, a confidence state, and a review history. If those parts are missing, a good model result can still produce a weak intelligence product.

## 1. Start with a narrow target set

“Detect every military object” is not a useful starting requirement. A credible system defines the sites, object families, image conditions, and questions it is designed to handle.

Airfields are a practical example. Aprons, shelters, support areas, and known aircraft roles give the analyst a bounded problem: what is present, how many are visible, where they are positioned, and what changed since the selected baseline.

## 2. Use labels the image can support

Classification should become less specific as image quality falls. A scene may support “aircraft present,” “transport aircraft,” or a family-level assessment without supporting an exact subtype.

That is not a model failure. It is an evidence limit. The system should expose that limit in the label and confidence rather than force a precise answer.

> A broader label that can be defended is better than a precise label that cannot.

## 3. Treat resolution as a limit, not a footnote

Ground sample distance, viewing angle, shadow, cloud, compression, and sensor type all affect what can be seen. Evaluation should therefore use imagery that resembles the expected operating conditions, not only clean examples selected for a demo.

Lower-resolution imagery may still support presence, count, density, or trend analysis even when subtype recognition is unreliable. The product should change its claim before the evidence runs out.

## 4. Keep the source with the finding

An analyst should be able to open the scene behind a count or change result. At minimum, the record should retain the source scene, acquisition time, relevant sensor metadata, model version, confidence, and review state.

- Source scene and acquisition time
- Sensor and image metadata relevant to interpretation
- Model version, class, and confidence
- Analyst decision and annotation
- Baseline lineage for comparison results

## 5. Show machine and analyst states separately

A model output is a candidate finding. It should not silently become accepted intelligence. Interfaces and APIs need a clear distinction between machine suggestion, analyst-reviewed output, and any downstream accepted record.

This boundary also makes disagreement useful. A rejected label or adjusted count becomes review evidence and, where appropriate, input for later model improvement.

## 6. Test deployment constraints early

Buyers working with sensitive imagery will ask where processing occurs, which services receive the data, what is retained, and how reviewed outputs reach their systems. Those questions should be answered before a model evaluation becomes a deployment plan.

A system can perform well and still be unsuitable for a controlled environment. Model quality, evidence handling, access control, and delivery architecture have to be assessed together.

## A short evaluation checklist

- **Scope:** Which sites, classes, and image conditions were tested?
- **Evidence:** Can every result be traced to its source scene?
- **Review:** Is machine output distinct from analyst-approved output?
- **Deployment:** Can the data path fit the intended environment?

These checks do not replace accuracy testing. They determine whether the accuracy result belongs to a usable system or only to a model experiment.
