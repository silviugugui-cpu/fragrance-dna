import assert from "node:assert/strict";
import test from "node:test";
import { MASTER_BRAND_NAME_GROUPS, normalizeMasterBrandName } from "./brandNames";

test("normalizes each exact brand spelling to its dictionary display name", () => {
  for (const [canonical, ...aliases] of MASTER_BRAND_NAME_GROUPS) {
    assert.equal(normalizeMasterBrandName(canonical), canonical);
    for (const alias of aliases) assert.equal(normalizeMasterBrandName(alias), canonical);
  }
});

test("does not collapse unrelated brands or alter unknown names", () => {
  assert.equal(normalizeMasterBrandName("Bugatti"), "Bugatti");
  assert.equal(normalizeMasterBrandName("bugatti"), "bugatti");
  assert.equal(normalizeMasterBrandName("Dolce Gabbana Beauty"), "Dolce Gabbana Beauty");
});
