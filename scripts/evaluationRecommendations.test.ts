import assert from "node:assert/strict";
import { test } from "node:test";
import { POST } from "../app/api/recommendations/route";
import { NEUTRAL_VECTOR, submitEvaluation } from "../lib/test/preferenceLearning";

const evaluation = submitEvaluation({
  schemaVersion: 2, id: "fixture", fragranceId: "test", canonicalFragranceId: "house::fixture", displayName: "Fixture",
  attributeIds: ["citrus", "oud"], questions: [{ attributeId: "citrus", perception: 3, preference: -1 }],
  overall: -1, unable: false, reason: "confirm", reasonAttributeId: "citrus", startedAt: 1,
}, 2);
const request = (overrides: Record<string, unknown> = {}) => new Request("http://localhost:3000/api/recommendations", {
  method: "POST", headers: { "content-type": "application/json" },
  body: JSON.stringify({ userVector: NEUTRAL_VECTOR, groundingProfile: { love: ["Fresh & Citrusy"], neutral: [], redFlag: [] },
    evaluations: [evaluation], limit: 5, locale: "en", ...overrides }),
});

test("recommendation ranking ignores legacy vector and perception intensity, retaining explicit liking and catalog guards", async () => {
  const first = await POST(request());
  assert.equal(first.status, 200);
  const initial = await first.json() as { recommendations: Array<{ fragranceId: string; score: number }>; totalEligible: number };
  assert.equal(initial.recommendations.length, 5);
  const changedVector = await (await POST(request({ userVector: { freshness: 1, warmth: 0, sweetness: 1, darkness: 0, cleanliness: 1, elegance: 0 } }))).json();
  assert.deepEqual(changedVector, initial);
  const changedPerception = await (await POST(request({ evaluations: [{ ...evaluation, questions: [{ attributeId: "citrus", perception: 1, preference: -1 }] }] }))).json();
  assert.deepEqual(changedPerception, initial);
  const owned = initial.recommendations[0].fragranceId;
  const excluded = await (await POST(request({ ownedFragranceIds: [owned] }))).json() as typeof initial;
  assert.ok(excluded.recommendations.every((item) => item.fragranceId !== owned));
  assert.equal(excluded.totalEligible, initial.totalEligible - 1);
  for (const result of initial.recommendations) {
    assert.ok(result.score >= 0 && result.score <= 1);
    for (const privateField of ["rating", "votes", "fragrantiq_rating_100", "sources"]) assert.equal(privateField in result, false);
  }
});

test("recommendation API rejects invalid preference contracts instead of reinterpreting perception", async () => {
  assert.equal((await POST(request({ evaluations: [{ ...evaluation, schemaVersion: 1 }] }))).status, 400);
  assert.equal((await POST(request({ evaluations: [{ ...evaluation, questions: [{ attributeId: "citrus", perception: 0, preference: -2 }] }] }))).status, 400);
  assert.equal((await POST(request({ evaluations: [evaluation, evaluation] }))).status, 400);
});
