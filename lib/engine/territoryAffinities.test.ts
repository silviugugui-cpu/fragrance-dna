import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateTerritoryAffinities } from './territoryAffinities';

const profile = {
  Freshness: 90, Warmth: 20, Complexity: 30, Comfort: 25,
  Versatility: 80, Elegance: 70, Presence: 10,
};

test('no profile produces no territory claims', () => {
  assert.deepEqual(calculateTerritoryAffinities(null), []);
});

test('all territories are ranked by explainable axis means', () => {
  const result = calculateTerritoryAffinities(profile);
  assert.equal(result.length, 10);
  assert.equal(result[0].territory.id, 'fresh-citrus');
  assert.equal(result[0].score, 85);
  for (const [index, item] of result.entries()) {
    assert.ok(item.score >= 0 && item.score <= 100);
    assert.equal(item.score, Math.round(item.contributions.reduce((sum, axis) => sum + axis.score, 0) / item.contributions.length));
    if (index > 0) assert.ok(result[index - 1].score >= item.score);
    assert.ok(item.contributions.every((axis) => String(axis.axis) !== 'Presence'));
    assert.deepEqual(item.contributions.map((axis) => axis.axis), item.territory.dnaAxes);
  }
});

test('warm preferences change rankings and confidence does not', () => {
  const original = calculateTerritoryAffinities(profile);
  const changedConfidence = { ...profile, Presence: 100 };
  assert.deepEqual(calculateTerritoryAffinities(changedConfidence), original);
  const warm = calculateTerritoryAffinities({
    Freshness: 10, Warmth: 100, Complexity: 80, Comfort: 100, Versatility: 10, Elegance: 30,
  });
  assert.equal(warm[0].territory.id, 'amber');
  assert.notEqual(warm[0].territory.id, original[0].territory.id);
});

test('territory cards and affinity contributions share canonical axes without duplicate weighting', () => {
  const gourmand = calculateTerritoryAffinities(profile).find((item) => item.territory.id === 'rich-gourmand')!;
  assert.deepEqual(gourmand.contributions.map((axis) => axis.axis), ['Warmth', 'Comfort']);
  assert.equal(gourmand.score, 23);
});

test('invalid or missing preference values fail explicitly', () => {
  for (const Freshness of [NaN, Infinity, -1, 101]) {
    assert.throws(() => calculateTerritoryAffinities({ ...profile, Freshness }), /Invalid DNA score/);
  }
  assert.throws(() => calculateTerritoryAffinities({}), /Invalid DNA score/);
});

test('ties use a deterministic name order', () => {
  const result = calculateTerritoryAffinities({
    Freshness: 50, Warmth: 50, Complexity: 50, Comfort: 50, Versatility: 50, Elegance: 50,
  });
  assert.deepEqual(result.map((item) => item.territory.name), result.map((item) => item.territory.name).sort((a, b) => a.localeCompare(b)));
});
