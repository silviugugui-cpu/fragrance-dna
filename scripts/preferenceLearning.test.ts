import assert from "node:assert/strict";
import { test } from "node:test";
import { createFragranceIntelligenceService } from "../lib/intelligence/fragranceIntelligence";
import type { FragranceIntelligenceService } from "../lib/intelligence/fragranceIntelligence/types";
import { draftForCandidate, selectAdaptiveCandidate, submitEvaluation, projectPreferences, preferenceCompatibility,
  questionPriority, validateEvaluation, EMPTY_GROUNDING, NEUTRAL_VECTOR, type EvaluationDraft, type GroundingPrior } from "../lib/test/preferenceLearning";
import { migrateEvaluationSession, parseEvaluationDraft, parseEvaluationRecords, readGroundingPrior } from "../lib/test/evaluationSession";
import { buildVectorFromAnswers, calculateConfidenceScore } from "../lib/dnaSession";
import { buildCanonicalBehaviorEventInputs } from "../lib/intelligence/evaluation";
import { buildBehaviorProjectionFromAnswers } from "../lib/intelligence/learning/adaptiveSelector";
import { evaluationAttributeLabel, evaluationAttributeQuestions, getEvaluationCopy } from "../lib/i18n/evaluationCopy";
import { getCanonicalAttributeRegistry } from "../lib/intelligence/attributes";
import { LOCALES } from "../lib/i18n/config";
import { readMasterUserDnaProfiles } from "../lib/database/masterFragranceDatabase";

const prior: GroundingPrior = { love: ["Fresh & Citrusy"], neutral: ["Woody & Dry"], redFlag: ["Dark & Smoky"] };
function draft(overrides: Partial<EvaluationDraft> = {}): EvaluationDraft {
  return { schemaVersion: 2, id: "evaluation-a", fragranceId: "a", canonicalFragranceId: "house::a", displayName: "A",
    attributeIds: ["citrus", "oud"], questions: [{ attributeId: "citrus", perception: 3, preference: -1 }],
    overall: -1, unable: false, reason: "confirm", reasonAttributeId: "citrus", startedAt: 1, ...overrides };
}
const record = (value: Partial<EvaluationDraft> = {}, time = 2) => submitEvaluation(draft(value), time);

test("strong perception plus explicit dislike means noticed but disliked; direct evidence corrects Grounding", () => {
  const projection = projectPreferences([record()], prior);
  assert.equal(projection.perception.citrus.mean, 3);
  assert.equal(projection.attributes.citrus.affinity, -.5);
  assert.equal(projection.attributes.citrus.explicitCount, 1);
  assert.equal(projection.attributes.citrus.groundingConflictResolved, true);
  assert.ok(projection.vector.freshness < .5);
});

test("not noticed never updates affinity or preference confidence, with or without a prior", () => {
  const value = record({ questions: [{ attributeId: "citrus", perception: 0, preference: null }] });
  const empty = projectPreferences([value], EMPTY_GROUNDING);
  assert.equal(empty.attributes.citrus, undefined);
  assert.equal(empty.confidence, 0);
  assert.equal(empty.perception.citrus.noticed, 0);
  const before = projectPreferences([], prior);
  const after = projectPreferences([value], prior);
  assert.deepEqual(after.attributes, before.attributes);
  assert.deepEqual(after.vector, before.vector);
});

test("overall dislike affects composition/similarity, never distributes dislike to its attributes", () => {
  const value = record({ questions: [], overall: -2 });
  const projection = projectPreferences([value], EMPTY_GROUNDING);
  assert.deepEqual(projection.attributes, {});
  assert.deepEqual(projection.vector, NEUTRAL_VECTOR);
  assert.equal(projection.confidence, 0);
  assert.ok(preferenceCompatibility(["citrus", "oud"], "house::similar", projection) < .5);
  assert.equal(preferenceCompatibility(["floral"], "house::other", projection), .5);
});

test("preference confidence is independent of intensity; explicit Neutral is not missing evidence", () => {
  const mild = projectPreferences([record({ questions: [{ attributeId: "citrus", perception: 1, preference: 0 }] })], prior);
  const strong = projectPreferences([record({ questions: [{ attributeId: "citrus", perception: 3, preference: 0 }] })], prior);
  assert.deepEqual(mild.attributes, strong.attributes);
  assert.equal(mild.confidence, strong.confidence);
  assert.equal(strong.attributes.citrus.affinity, 0);
  assert.equal(strong.attributes.citrus.explicitCount, 1);
});

test("unable status carries no signals, no complete evaluation, and no preference update", () => {
  const value = record({ unable: true, overall: null, questions: [{ attributeId: "citrus", perception: null, preference: null }] });
  assert.equal(value.status, "unable");
  assert.deepEqual(projectPreferences([value], prior), projectPreferences([], prior));
  assert.throws(() => record({ unable: true }));
  const session = migrateEvaluationSession({ answers: {}, answeredOrder: [], currentIndex: 0, currentVector: NEUTRAL_VECTOR,
    snapshots: [], lastUpdatedAt: 1, evaluationState: { schemaVersion: 2, records: [value], draft: null, legacyPerception: { answers: {}, answeredOrder: [], source: "legacy-intensity" } } }, prior);
  assert.equal(session.summary?.answeredCount, 0);
  assert.deepEqual(session.answeredOrder, []);
});

test("every displayed pair and overall answer must be explicit, with at most two canonical questions", () => {
  assert.throws(() => validateEvaluation(draft({ overall: null })));
  assert.throws(() => validateEvaluation(draft({ questions: [{ attributeId: "citrus", perception: null, preference: null }] })));
  assert.throws(() => validateEvaluation(draft({ questions: [{ attributeId: "citrus", perception: 0, preference: -2 }] })));
  assert.throws(() => validateEvaluation(draft({ questions: [{ attributeId: "citrus", perception: 3, preference: null }] })));
  assert.throws(() => validateEvaluation(draft({ questions: ["citrus", "oud", "woody"].map((attributeId) => ({ attributeId, perception: 0, preference: null })) })));
  assert.throws(() => validateEvaluation(draft({ questions: [{ attributeId: "invented", perception: 0, preference: null }] })));
});

test("Grounding uses explicit Love/Avoid priors, explicit Neutral zero and unrated absence", () => {
  const legacy = readGroundingPrior({ love: ["Fresh & Citrusy"], neutral: ["Woody & Dry"], red_flag: [] });
  assert.deepEqual(legacy.neutral, []);
  const v2 = readGroundingPrior({ schemaVersion: 2, love: ["Fresh & Citrusy"], neutral: ["Woody & Dry"], red_flag: ["Dark & Smoky"] });
  const projection = projectPreferences([], v2);
  assert.ok(projection.attributes.citrus.affinity > 0);
  assert.equal(projection.attributes.woody.affinity, 0);
  assert.equal(projection.attributes.rose, undefined);
});

const service: FragranceIntelligenceService = {
  listEvaluationFragrances: () => [
    { fragranceId: "a", canonicalFragranceId: "house::a", displayName: "A", brand: "House" },
    { fragranceId: "a-duplicate", canonicalFragranceId: "house::a", displayName: "A duplicate", brand: "House" },
    { fragranceId: "b", canonicalFragranceId: "house::b", displayName: "B", brand: "Other" },
    { fragranceId: "c", canonicalFragranceId: "house::c", displayName: "C", brand: "Other" },
  ],
  listSessionFragrances: () => [],
  getCanonicalFragrance: (fragranceId) => ({ fragranceId, displayName: fragranceId, supportingAttributes: [],
    coreAttributes: (fragranceId.startsWith("a") ? ["citrus", "oud"] : fragranceId === "b" ? ["woody", "rose"] : ["citrus", "floral"])
      .map((canonicalAttributeId) => ({ canonicalAttributeId, displayName: canonicalAttributeId, source: "core" })) }),
};

test("first selection confirms Love plus an unknown; the next choice reacts to the just-submitted explicit preference", () => {
  const first = selectAdaptiveCandidate(service, [], prior)!;
  assert.ok(first.attributeIds.includes("citrus"));
  assert.equal(first.questionIds.length, 2);
  assert.ok(first.questionIds.some((id) => !projectPreferences([], prior).attributes[id]));
  const negative = record({ fragranceId: first.fragranceId, canonicalFragranceId: first.canonicalFragranceId!, overall: 0,
    attributeIds: first.attributeIds, questions: [{ attributeId: "citrus", perception: 3, preference: -2 }] });
  const positive = { ...negative, questions: [{ attributeId: "citrus", perception: 3 as const, preference: 2 as const }] };
  const disliked = selectAdaptiveCandidate(service, [negative], prior)!;
  const liked = selectAdaptiveCandidate(service, [positive], prior)!;
  assert.notEqual(disliked.fragranceId, liked.fragranceId);
  assert.notEqual(disliked.canonicalFragranceId, first.canonicalFragranceId);
  assert.ok(!disliked.fragranceId.startsWith("a"));
  assert.ok(["confirm", "clarify", "explore", "fallback"].includes(disliked.reason));
});

test("clear attributes stop being asked; contradictory explicit evidence reopens the question", () => {
  const records = [0, 1, 2].map((i) => record({ id: `e-${i}`, fragranceId: `f-${i}`, canonicalFragranceId: `c-${i}`,
    questions: [{ attributeId: "citrus", perception: 2, preference: 2 }] }, i + 2));
  const clear = projectPreferences(records, prior);
  assert.equal(questionPriority("citrus", clear), 0);
  const changed = projectPreferences([...records, record({ id: "e-new", questions: [{ attributeId: "citrus", perception: 2, preference: -2 }] }, 10)], prior);
  assert.equal(changed.attributes.citrus.contradictory, true);
  assert.ok(questionPriority("citrus", changed) > 0);
});

test("unable and legacy-completed candidates are excluded canonically; exhaustion never recycles evaluated perfumes", () => {
  const skipped = record({ unable: true, overall: null, questions: [] });
  const next = selectAdaptiveCandidate(service, [skipped], prior, ["b"]);
  assert.equal(next?.fragranceId, "c");
  assert.equal(selectAdaptiveCandidate(service, [skipped], prior, ["b", "c"]), null);
});

test("legacy migration preserves raw answers and projections, removes intensity-derived preference and round-trips drafts", () => {
  const old = { answers: { a: { citrus: 100, oud: 0 } }, answeredOrder: ["a"], currentIndex: 1,
    currentVector: { ...NEUTRAL_VECTOR, freshness: 1 }, snapshots: [], lastUpdatedAt: 123 };
  const migrated = migrateEvaluationSession(old, EMPTY_GROUNDING, { unsent: { woody: 75 } });
  assert.deepEqual(migrated.answers, old.answers);
  assert.deepEqual(migrated.evaluationState?.legacyPerception.answers, { unsent: { woody: 75 }, ...old.answers });
  assert.deepEqual(migrated.evaluationState?.legacyPerception.answeredOrder, ["a"]);
  assert.deepEqual(migrated.evaluationState?.legacyProjection?.currentVector, old.currentVector);
  assert.deepEqual(migrated.currentVector, NEUTRAL_VECTOR);
  assert.equal(migrated.summary?.confidenceScore, 0);
  assert.equal(migrated.summary?.answeredCount, 0);
  assert.deepEqual(buildVectorFromAnswers(old.answers), NEUTRAL_VECTOR);
  assert.equal(calculateConfidenceScore(old.answers), 0);
  assert.deepEqual(buildCanonicalBehaviorEventInputs({ fragranceId: "a", answerDimensions: old.answers.a, source: "test" }), []);
  const oldBehavior = buildBehaviorProjectionFromAnswers(old.answers, service);
  assert.deepEqual(oldBehavior.attributes, {});
  const current = draftForCandidate(selectAdaptiveCandidate(service, [], prior)!, "draft");
  current.overall = 2;
  current.questions[0].perception = 2;
  current.questions[0].preference = -1;
  migrated.evaluationState!.draft = current;
  const restored = migrateEvaluationSession(JSON.parse(JSON.stringify(migrated)), EMPTY_GROUNDING);
  assert.deepEqual(restored.evaluationState?.draft, current);
  assert.deepEqual(restored.evaluationState?.legacyPerception, migrated.evaluationState?.legacyPerception);
});

test("invalid saved data is rejected without defaults; submitted records are immutable copies", () => {
  const source = draft();
  const saved = submitEvaluation(source);
  source.questions[0].preference = 2;
  assert.equal(saved.questions[0].preference, -1);
  assert.throws(() => parseEvaluationRecords([saved, saved]));
  assert.throws(() => parseEvaluationRecords([{ ...saved, status: "invented" }]));
  assert.throws(() => parseEvaluationDraft({ ...draft(), schemaVersion: 1 }));
});

test("all seven locales cover every canonical evaluation attribute and conditional prompt", () => {
  for (const locale of LOCALES) {
    const copy = getEvaluationCopy(locale);
    assert.equal(copy.overallOptions.length, 5);
    assert.equal(copy.preferenceOptions.length, 5);
    assert.equal(copy.perceptionOptions.length, 4);
    for (const id of getCanonicalAttributeRegistry().filter((item) => item.metadata.category !== "grounding").map((item) => item.canonicalAttributeId)) {
      assert.ok(evaluationAttributeLabel(id, locale));
      const questions = evaluationAttributeQuestions(id, locale);
      assert.equal(questions.perceptionOptions.length, 4);
      assert.ok(questions.perception);
      assert.ok(questions.preference);
      assert.doesNotMatch(questions.perception, /undefined|\{quality\}|\{attribute\}/);
      assert.doesNotMatch(questions.preference, /undefined|\{quality\}|\{attribute\}/);
    }
    assert.match(copy.noticed, /\{attribute\}/);
    assert.match(copy.feeling, /\{attribute\}/);
  }
});

test("qualities use natural adjective questions and degree answers; notes retain noticeability questions", () => {
  assert.deepEqual(evaluationAttributeQuestions("charismatic", "en"), {
    perception: "How charismatic did you find it?", preference: "Did you like how charismatic it was?",
    perceptionOptions: ["Not at all", "Slightly", "Moderately", "Very"],
  });
  assert.equal(evaluationAttributeQuestions("aromatic", "en").perception, "How aromatic did you find it?");
  assert.equal(evaluationAttributeQuestions("charismatic", "ro").perception, "Cât de carismatic ți s-a părut parfumul?");
  assert.equal(evaluationAttributeQuestions("aromatic", "ro").perception, "Cât de aromatic ți s-a părut parfumul?");
  assert.equal(evaluationAttributeQuestions("oud", "en").perception, "How noticeable was Oud?");
  assert.equal(evaluationAttributeQuestions("oud", "en").perceptionOptions[0], "I didn’t notice it");
  for (const attribute of getCanonicalAttributeRegistry().filter((item) => item.metadata.sourceFamily === "abstract")) {
    assert.match(evaluationAttributeQuestions(attribute.canonicalAttributeId, "en").perception, /^How .+ did you find it\?$/);
  }
});

test("production adapter only asks canonical attributes from the selected eligible profile", () => {
  const adapter = createFragranceIntelligenceService([{ name: "One", testProfileId: "one", canonicalFragranceId: "house::one",
    user_attributes_v3: { concrete: ["citrus", "oud", "woody"] } }]);
  const candidate = selectAdaptiveCandidate(adapter, [], prior)!;
  assert.ok(candidate);
  assert.ok(candidate.questionIds.every((id) => candidate.attributeIds.includes(id)));
  assert.ok(candidate.questionIds.length <= 2);
});

test("the actual SQLite pool chooses different next fragrances after opposite direct liking evidence", () => {
  const adapter = createFragranceIntelligenceService(readMasterUserDnaProfiles());
  const first = selectAdaptiveCandidate(adapter, [], prior)!;
  assert.ok(first.questionIds.includes("citrus"));
  const value = draftForCandidate(first, "sqlite-fixture", 1);
  value.overall = 0;
  value.questions = value.questions.map((question) => ({ ...question,
    perception: question.attributeId === "citrus" ? 3 : 0,
    preference: question.attributeId === "citrus" ? 2 : null,
  }));
  const liked = submitEvaluation(value, 2);
  const disliked = { ...liked, questions: liked.questions.map((question) => question.attributeId === "citrus" ? { ...question, preference: -2 as const } : question) };
  const positiveNext = selectAdaptiveCandidate(adapter, [liked], prior)!;
  const negativeNext = selectAdaptiveCandidate(adapter, [disliked], prior)!;
  assert.notEqual(positiveNext.fragranceId, negativeNext.fragranceId);
  assert.notEqual(positiveNext.canonicalFragranceId, first.canonicalFragranceId);
  assert.notEqual(negativeNext.canonicalFragranceId, first.canonicalFragranceId);
});
