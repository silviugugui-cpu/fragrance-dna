/**
 * Canonical Architecture v2
 * Phase 1 - Step 3
 *
 * ADR References:
 * ADR-0002 Event Sourcing
 * ADR-0003 Persistent User DNA
 *
 * Purpose:
 * Provide shadow validation scaffolding for future legacy vs projection parity checks.
 */

export type ShadowValidationResult = {
  matches: boolean;
  differences: string[];
};

export type ShadowValidationInput = {
  legacyState: Record<string, unknown>;
  projectionState: Record<string, unknown>;
};

export function validateShadowParity(_input: ShadowValidationInput): ShadowValidationResult {
  return {
    matches: true,
    differences: [],
  };
}

export type GroundingParityLegacyState = {
  hasSubmission: boolean;
  loveTokens: string[];
  neutralTokens: string[];
  avoidTokens: string[];
  userVector: Record<string, number>;
};

export type GroundingParityProjectionState = {
  hasSubmission: boolean;
  loveTokens: string[];
  neutralTokens: string[];
  avoidTokens: string[];
  userVector: Record<string, number>;
};

export type TestParityLegacyState = {
  currentIndex: number;
  answeredCount: number;
  answeredOrder: string[];
  currentVector: Record<string, number>;
  lastFragranceId: string;
  lastAnswerDimensions: Record<string, number>;
};

export type TestParityProjectionState = {
  currentIndex: number;
  answeredCount: number;
  answeredOrder: string[];
  currentVector: Record<string, number>;
  lastFragranceId: string;
  lastAnswerDimensions: Record<string, number>;
};

export function validateGroundingParity(
  legacy: GroundingParityLegacyState,
  projection: GroundingParityProjectionState
): ShadowValidationResult {
  const differences: string[] = [];

  if (legacy.hasSubmission !== projection.hasSubmission) {
    differences.push("hasSubmission mismatch");
  }

  compareStringArrays("loveTokens", legacy.loveTokens, projection.loveTokens, differences);
  compareStringArrays("neutralTokens", legacy.neutralTokens, projection.neutralTokens, differences);
  compareStringArrays("avoidTokens", legacy.avoidTokens, projection.avoidTokens, differences);
  compareNumericRecords("userVector", legacy.userVector, projection.userVector, differences);

  return {
    matches: differences.length === 0,
    differences,
  };
}

export function validateTestParity(
  legacy: TestParityLegacyState,
  projection: TestParityProjectionState
): ShadowValidationResult {
  const differences: string[] = [];

  if (legacy.currentIndex !== projection.currentIndex) {
    differences.push("currentIndex mismatch");
  }

  if (legacy.answeredCount !== projection.answeredCount) {
    differences.push("answeredCount mismatch");
  }

  if (legacy.lastFragranceId !== projection.lastFragranceId) {
    differences.push("lastFragranceId mismatch");
  }

  compareStringArrays("answeredOrder", legacy.answeredOrder, projection.answeredOrder, differences);
  compareNumericRecords("currentVector", legacy.currentVector, projection.currentVector, differences);
  compareNumericRecords(
    "lastAnswerDimensions",
    legacy.lastAnswerDimensions,
    projection.lastAnswerDimensions,
    differences
  );

  return {
    matches: differences.length === 0,
    differences,
  };
}

function compareStringArrays(
  label: string,
  left: string[],
  right: string[],
  differences: string[]
): void {
  if (left.length !== right.length) {
    differences.push(`${label} length mismatch`);
    return;
  }

  for (let index = 0; index < left.length; index += 1) {
    if (left[index] !== right[index]) {
      differences.push(`${label}[${index}] mismatch`);
      return;
    }
  }
}

function compareNumericRecords(
  label: string,
  left: Record<string, number>,
  right: Record<string, number>,
  differences: string[]
): void {
  const leftKeys = Object.keys(left).sort();
  const rightKeys = Object.keys(right).sort();

  if (leftKeys.length !== rightKeys.length) {
    differences.push(`${label} key count mismatch`);
    return;
  }

  for (let index = 0; index < leftKeys.length; index += 1) {
    if (leftKeys[index] !== rightKeys[index]) {
      differences.push(`${label} keys mismatch`);
      return;
    }
  }

  for (const key of leftKeys) {
    const leftValue = left[key];
    const rightValue = right[key];
    if (Math.abs(leftValue - rightValue) > 1e-9) {
      differences.push(`${label}.${key} mismatch`);
      return;
    }
  }
}
