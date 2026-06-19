# FragranceDNA_CompatibilityEngine_v1_Canonical

## Status

CANONICAL

---

# Core Principle

Attribute Profile = Source of Truth.

DNA Profile is a derived layer.

Perfumes are diagnostic tools used to learn about user preferences.

---

# Evaluation Model

## Evaluations 1-6

Attribute Evaluations

User evaluates the attribute itself, not the perfume.

Attribute Isolation Principle:

- Do not evaluate the perfume.
- Do not evaluate performance.
- Do not evaluate the blend.
- Evaluate the attribute itself.
- Question: "How much do I like this attribute wherever it appears?"

## Evaluation 7

Overall Fragrance Evaluation

User evaluates the perfume as a whole.

Question:

"How much do I like this fragrance overall?"

Scale:

-100 to +100

---

# Compatibility Engine Flow

Slider
→ Direct Impact
→ Relationship Propagation
→ Attribute Profile Update
→ DNA Recalculation
→ Prediction Update
→ Composition Delta Storage

---

# Direct Impact Formula

DirectImpact

= SliderValue × BenchmarkAttributeStrength

Examples:

+100 × 1.00 = +100

+100 × 0.80 = +80

-66 × 0.50 = -33

---

# Relationship Propagation

RelationshipImpact

= DirectImpact × RelationshipStrength × 0.50

PropagationFactor = 0.50

Principle:

Direct evidence must always be stronger than inferred evidence.

---

# Single-Hop Rule

Relationship propagation executes exactly one hop.

No recursive propagation is allowed.

This prevents feedback loops and profile inflation.

---

# Direct vs Indirect Signals

Direct signals and indirect signals are stored separately.

Example:

Vanilla:
- DirectScore
- IndirectScore

They may later be combined for reporting and recommendation purposes.

---

# Attribute Score Update

Attribute Score uses Running Mean.

Formula:

NewScore

= ((OldScore × OldConfidence) + NewImpact)
  / (OldConfidence + 1)

NewConfidence

= OldConfidence + 1

---

# DNA Recalculation

After every Attribute Profile update:

Attribute Profile
→ DNA Recalculation
→ DNA Profile Update

DNA Profile is always derived from the current Attribute Profile.

---

# Prediction Engine

Predicted Enjoyment

= Weighted Attribute Average

For every benchmark:

AttributeScore × BenchmarkAttributeStrength

Normalized by total benchmark weight.

---

# Prediction Confidence

PredictionConfidence

= Average Attribute Confidence
used by the benchmark

Additional Rule:

Prediction Confidence ≤ Coverage

This prevents early overconfidence.

---

# Coverage

Coverage is calculated from explored attribute space.

Coverage is NOT based on number of evaluations.

Goal:

Measure breadth of profile knowledge.

---

# Information Gain

InformationGap

= 100 − AttributeConfidence

InformationGain

= Sum of InformationGaps
for benchmark attributes

Purpose:

Select benchmarks that teach the system the most.

---

# Coverage Gain

CoverageGain

= How much unexplored territory
the benchmark helps cover.

Purpose:

Avoid over-testing the same regions of the profile.

---

# Exploration Bonus

10–20% of benchmark recommendations

= Controlled Exploration

Purpose:

Avoid recommendation echo chambers.

---

# Next Benchmark Score

NextBenchmarkScore

= 0.40 InformationGain
+ 0.30 ExpectedEnjoyment
+ 0.20 CoverageGain
+ 0.10 ExplorationBonus

---

# Composition Intelligence Layer

## Overall Fragrance Evaluation

Stored separately from Attribute Profile.

Does NOT directly modify:

- Attribute Profile
- DNA Profile

---

## Composition Delta

CompositionDelta

= ActualEnjoyment − PredictedEnjoyment

Examples:

Predicted 85
Actual 40

Delta = -45

Predicted 70
Actual 95

Delta = +25

Purpose:

Learn about composition preferences and synergy effects.

---

# Profile Maturity

ProfileMaturity

= 0.40 Coverage
+ 0.30 Consistency
+ 0.30 DataVolume

Components:

Coverage:
How much of the attribute space has been explored.

Consistency:
How stable user responses are.

DataVolume:
How much evidence exists.

---

# Recommendation Engine

## Discovery Mode

Optimize:

- Information Gain
- Coverage Gain

Goal:

Learn about the user.

---

## Enjoyment Mode

Optimize:

- Predicted Enjoyment
- Prediction Confidence

Goal:

Maximize user satisfaction.

---

## Balanced Mode

Optimize:

NextBenchmarkScore

Goal:

Learn efficiently while maintaining high probability of enjoyment.

---

# Architectural Principles

1. Attribute Profile is the source of truth.
2. DNA Profile is derived.
3. Direct evidence is stronger than inferred evidence.
4. Composition signals are stored separately.
5. Discovery and enjoyment are distinct objectives.
6. Recommendations must balance learning and satisfaction.
7. Perfumes are instruments for profiling, not the target of profiling.

---

# Canonical Status

This document defines CompatibilityEngine_v1 and serves as the canonical reference for future implementation and evolution of the FragranceDNA profiling engine.
