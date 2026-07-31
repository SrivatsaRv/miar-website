---
title: "A satellite image is not yet intelligence"
description: "Why reading change from satellite imagery takes more than a clear picture, and how MIAR keeps context, automation, and analyst judgement together."
summary: "A clear satellite image can show what is there. The harder question is what changed, whether it matters, and how confidently an analyst can act on it."
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
readingMinutes: 6
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
socialDescription: "Why a clear image is only the beginning of an imagery-intelligence assessment."
related: []
gallery:
  - src: "/imagery/monitored-site-reference-2025.webp"
    alt: "Reference satellite imagery of a monitored airbase from 2025"
    caption: "Reference scene / 2025"
    width: 1564
    height: 1136
  - src: "/imagery/monitored-site-follow-on-2026.webp"
    alt: "Follow-on satellite imagery of the same monitored airbase from 2026"
    caption: "Follow-on scene / 2026"
    width: 1546
    height: 1090
---

When we started working on MIAR, the first question sounded straightforward: given two satellite images of the same military site, can we tell an analyst what changed?

It is easy to underestimate that question. Put two clear images next to each other and the differences appear obvious. Count the aircraft, note where they are parked, and report the result. That works until the images come from different dates, angles, weather conditions, resolutions, or providers. Then the comparison stops being a simple visual exercise.

The two airbase images above are a useful example. Both show the same broad area. Both contain visible aircraft. But an analyst needs more than two pictures and two counts to decide whether the activity is significant.

## A clear image answers only the first question

An image can show what was visible when the satellite passed overhead. It may reveal aircraft on an apron, vehicles near a facility, vessels at a berth, or construction at a known site.

What it cannot show on its own is whether that activity is normal.

Five aircraft might represent a buildup, a routine operating day, or a reduction from the previous week. Their position may matter as much as their number. One part of the site may be outside the frame or hidden by cloud. An object may be clear enough to call an aircraft, but not clear enough to name the exact type.

This is where imagery becomes an analytical problem rather than an image-viewing problem. The useful questions are no longer limited to “What can I see?” They become:

- What was here before?
- Is the apparent change real, or caused by the image itself?
- How specific can we be about the objects in view?
- What evidence supports the assessment?
- Does an analyst agree with the automated result?

## The earlier image is not always the right baseline

Change depends on what we choose to compare.

The previous satellite pass may be the right reference for a fast-moving situation. For a site with seasonal activity, the better comparison may be the same month last year. In other cases, analysts may want to compare against a known quiet period or against several images that describe normal operations.

That choice changes the conclusion. A site can look busy compared with yesterday and completely routine compared with its normal weekly pattern.

For MIAR, this means the baseline cannot be an image selected silently by the software. The analyst needs to know which image was used, why it was relevant, and what other observations are available. Historical imagery is not background material; it is part of the assessment.

## AI helps with the volume, not the final judgement

Automated detection is valuable because analysts cannot inspect every object in every new image by hand. A model can locate likely aircraft, vehicles, vessels, or structures. It can produce an initial count and draw attention to objects that appeared, disappeared, or moved.

But the model should be allowed to say only what the image supports.

If an aircraft is visible but the image is not detailed enough to identify its subtype, the result should remain broad. If cloud or shadow affects part of the site, the count should carry that limitation. A confident-looking label does not improve weak evidence.

We treat automated results as findings for review, not finished intelligence. The analyst can accept a result, correct it, or reject it. That decision remains separate from the model output so another reviewer can see what the machine proposed and what the analyst concluded.

## Comparison is harder than placing images side by side

Satellite images of the same location rarely line up perfectly. They may have been collected from different angles or at different times of day. Shadows move. Seasons change. One image may be sharper than the other. Even when nothing important happened on the ground, the pixels can still look different.

Before calling something a change, the images have to be aligned and checked for these differences. The system also has to keep the original scenes close to the result. An alert that says “three new aircraft detected” is not enough if the analyst cannot open the relevant images and inspect those aircraft directly.

The practical output is therefore not just a red box or a changed count. It is a finding with its comparison attached: the current image, the baseline, the objects detected in each, the confidence of the model, and the analyst's review.

## What we are building into MIAR

MIAR is designed around the recurring work of monitoring the same sites over time. It brings imagery from different providers into one record, compares new observations with relevant history, and uses models to surface objects and changes for analyst review.

For each finding, we want the important questions to remain answerable:

- Which image did this come from?
- When was it collected?
- What was it compared against?
- What did the model report?
- What did the analyst accept?

This may sound less dramatic than a model that claims to recognise everything in a scene. It is also much closer to what an analyst needs when a finding has to be checked, shared, or revisited later.

The image is the starting point. Intelligence comes from understanding what changed, how certain that conclusion is, and whether the evidence holds up when someone else reviews it.
