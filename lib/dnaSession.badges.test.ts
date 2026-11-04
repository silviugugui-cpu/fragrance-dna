import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { DNA_CONFIDENCE_BADGES, getDnaConfidenceBadge } from './dnaSession';

test('all six confidence tiers use the new square transparent PNG assets', () => {
  assert.equal(DNA_CONFIDENCE_BADGES.length, 6);
  for (const [index, badge] of DNA_CONFIDENCE_BADGES.entries()) {
    assert.equal(badge.imageSrc, `/Badges/OlfactiveDNA-Badges/0${index + 1}-${badge.id}.png`);
    const png = readFileSync(path.join(process.cwd(), 'public', badge.imageSrc.slice(1)));
    assert.equal(png.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
    assert.equal(png.readUInt32BE(16), 1024);
    assert.equal(png.readUInt32BE(20), 1024);
    assert.equal(png[25], 6);
  }
});

test('badge replacement preserves every confidence threshold', () => {
  const tiers = [
    ['hobby', 0, 34],
    ['explorer', 35, 49],
    ['enthusiast', 50, 64],
    ['connoisseur', 65, 79],
    ['expert', 80, 89],
    ['olfactory-master', 90, 100],
  ] as const;
  for (const [id, minimum, maximum] of tiers) {
    assert.equal(getDnaConfidenceBadge(minimum).id, id);
    assert.equal(getDnaConfidenceBadge(maximum).id, id);
  }
});
