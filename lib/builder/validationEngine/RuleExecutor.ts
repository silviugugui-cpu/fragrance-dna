import type { ValidationContext } from "@/lib/builder/validationEngine/ValidationContext";
import type {
  DecisionHistoryEntry,
  RuleDecisionExplanation,
} from "@/lib/builder/validationEngine/DecisionExplanation";
import type { DecisionReport } from "@/lib/builder/validationEngine/DecisionReport";
import {
  calculateRate,
  createDecisionCountStatistics,
  incrementDecisionCount,
} from "@/lib/builder/validationEngine/DecisionStatistics";
import type { RuleRegistry } from "@/lib/builder/validationEngine/RuleRegistry";
import {
  createSkippedValidationResult,
  type FinalDecision,
  type ValidationResult,
} from "@/lib/builder/validationEngine/ValidationResult";

export interface RuleExecutorOptions {
  group?: string;
  globalEarlyExitDecisions?: FinalDecision[];
}

const DECISION_SCORE: Record<FinalDecision, number> = {
  CONFLICT: 6,
  REQUIRES_REVIEW: 5,
  AUTO_REJECTED: 4,
  AUTO_APPROVED: 3,
  UNKNOWN: 2,
  SKIPPED: 1,
};

const shouldReplaceDecision = (
  currentDecision: FinalDecision,
  nextDecision: FinalDecision,
): boolean => DECISION_SCORE[nextDecision] >= DECISION_SCORE[currentDecision];

const buildDecisionSummary = (decision: FinalDecision): string => {
  if (decision === "AUTO_APPROVED") {
    return "Final decision is AUTO_APPROVED because no higher-severity decision overrode approval.";
  }

  if (decision === "AUTO_REJECTED") {
    return "Final decision is AUTO_REJECTED due to deterministic rejection output from at least one executed rule.";
  }

  if (decision === "REQUIRES_REVIEW") {
    return "Final decision is REQUIRES_REVIEW because at least one rule escalated to manual review.";
  }

  if (decision === "CONFLICT") {
    return "Final decision is CONFLICT because conflicting outcomes were produced by the deterministic rule pipeline.";
  }

  if (decision === "SKIPPED") {
    return "Final decision is SKIPPED because all relevant rules were skipped.";
  }

  return "Final decision remains UNKNOWN due to insufficient deterministic rule output.";
};

export class RuleExecutor {
  constructor(private readonly registry: RuleRegistry) {}

  async execute<TInput = unknown>(
    context: ValidationContext<TInput>,
    options: RuleExecutorOptions = {},
  ): Promise<DecisionReport<TInput>> {
    const started = Date.now();
    const rules = this.registry.getExecutionOrder(options.group);
    const globalEarlyExit = options.globalEarlyExitDecisions ?? ["CONFLICT"];

    const executedRules: ValidationResult[] = [];
    const executionOrder: string[] = [];
    const decisionHistory: DecisionHistoryEntry[] = [];
    const explainSteps: RuleDecisionExplanation[] = [];

    let finalDecision: FinalDecision = "UNKNOWN";

    for (const rule of rules) {
      executionOrder.push(rule.version.ruleId);

      if (!rule.enabled) {
        const skipped = createSkippedValidationResult({
          ruleId: rule.version.ruleId,
          ruleName: rule.version.ruleName,
          ruleVersion: rule.version.version,
          priority: rule.priority,
          explanation: "Rule skipped because it is disabled in registry.",
          metadata: {
            group: rule.group,
            skipReason: "disabled",
          },
        });
        executedRules.push(skipped);
        explainSteps.push({
          ruleId: skipped.ruleId,
          ruleName: skipped.ruleName,
          status: skipped.status,
          decision: skipped.decision,
          whyExecuted: "Rule appeared in deterministic execution order.",
          whyResult: skipped.explanation,
          whySkipped: "Rule is disabled.",
        });
        continue;
      }

      if (!rule.shouldRun(context)) {
        const skipped = createSkippedValidationResult({
          ruleId: rule.version.ruleId,
          ruleName: rule.version.ruleName,
          ruleVersion: rule.version.version,
          priority: rule.priority,
          explanation: "Rule skipped because shouldRun returned false.",
          metadata: {
            group: rule.group,
            skipReason: "shouldRun=false",
          },
        });
        executedRules.push(skipped);
        explainSteps.push({
          ruleId: skipped.ruleId,
          ruleName: skipped.ruleName,
          status: skipped.status,
          decision: skipped.decision,
          whyExecuted: "Rule appeared in deterministic execution order.",
          whyResult: skipped.explanation,
          whySkipped: "Rule precondition was not satisfied.",
        });
        continue;
      }

      const ruleStart = Date.now();
      const result = await rule.execute(context);
      const elapsed = Date.now() - ruleStart;
      result.executionTimeMs = elapsed;
      executedRules.push(result);

      const previousDecision = finalDecision;
      if (shouldReplaceDecision(finalDecision, result.decision)) {
        finalDecision = result.decision;
      }

      decisionHistory.push({
        index: decisionHistory.length + 1,
        ruleId: result.ruleId,
        previousDecision,
        nextDecision: finalDecision,
        reason: `Rule ${result.ruleId} produced ${result.decision}.`,
      });

      explainSteps.push({
        ruleId: result.ruleId,
        ruleName: result.ruleName,
        status: result.status,
        decision: result.decision,
        whyExecuted: "Rule was enabled and passed execution preconditions.",
        whyResult: result.explanation,
      });

      const shouldExitByRule =
        rule.executionMode === "early-exit" &&
        rule.earlyExitDecisions.includes(result.decision);
      const shouldExitByGlobal = globalEarlyExit.includes(result.decision);

      if (shouldExitByRule || shouldExitByGlobal) {
        break;
      }
    }

    const decisionCounts = createDecisionCountStatistics();
    let rulesExecuted = 0;
    let rulesSkipped = 0;

    for (const result of executedRules) {
      incrementDecisionCount(decisionCounts, result.decision);
      if (result.status === "SKIPPED") {
        rulesSkipped += 1;
      } else {
        rulesExecuted += 1;
      }
    }

    const executionTimeMs = Date.now() - started;
    const totalDecisions = executedRules.length;

    return {
      runId: context.runId,
      startedAt: context.startedAt,
      finishedAt: new Date().toISOString(),
      inputEntity: context.inputEntity,
      executedRules,
      executionOrder,
      decisionHistory,
      finalDecision,
      decisionExplanation: {
        summary: buildDecisionSummary(finalDecision),
        whyFinalDecisionReached: buildDecisionSummary(finalDecision),
        steps: explainSteps,
        decisionHistory,
      },
      statistics: {
        rulesExecuted,
        rulesSkipped,
        executionTimeMs,
        decisionCounts,
        approvalRate: calculateRate(decisionCounts.AUTO_APPROVED, totalDecisions),
        reviewRate: calculateRate(decisionCounts.REQUIRES_REVIEW, totalDecisions),
        conflictRate: calculateRate(decisionCounts.CONFLICT, totalDecisions),
      },
    };
  }
}
