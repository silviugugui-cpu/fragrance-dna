export type RulePriority = number;

export const RULE_PRIORITY = {
  CRITICAL: 1000,
  HIGH: 750,
  NORMAL: 500,
  LOW: 250,
  FALLBACK: 100,
} as const;

export const compareRulePriority = (
  left: RulePriority,
  right: RulePriority,
): number => right - left;
