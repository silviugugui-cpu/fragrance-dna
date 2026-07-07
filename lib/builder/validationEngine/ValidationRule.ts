import type { RulePriority } from "@/lib/builder/validationEngine/RulePriority";
import type { RuleVersion } from "@/lib/builder/validationEngine/RuleVersion";
import type { ValidationContext } from "@/lib/builder/validationEngine/ValidationContext";
import type {
  FinalDecision,
  ValidationResult,
} from "@/lib/builder/validationEngine/ValidationResult";

export type RuleExecutionMode = "continue" | "early-exit";

export interface ValidationRule<TInput = unknown> {
  version: RuleVersion;
  priority: RulePriority;
  enabled: boolean;
  group: string;
  executionMode: RuleExecutionMode;
  earlyExitDecisions: FinalDecision[];
  shouldRun(context: ValidationContext<TInput>): boolean;
  execute(context: ValidationContext<TInput>): Promise<ValidationResult> | ValidationResult;
}

export const createBaseValidationRule = <TInput = unknown>(
  input: {
    version: RuleVersion;
    priority: RulePriority;
    enabled?: boolean;
    group?: string;
    executionMode?: RuleExecutionMode;
    earlyExitDecisions?: FinalDecision[];
    shouldRun?: (context: ValidationContext<TInput>) => boolean;
    execute: (context: ValidationContext<TInput>) => Promise<ValidationResult> | ValidationResult;
  },
): ValidationRule<TInput> => ({
  version: input.version,
  priority: input.priority,
  enabled: input.enabled ?? true,
  group: input.group ?? "default",
  executionMode: input.executionMode ?? "continue",
  earlyExitDecisions: input.earlyExitDecisions ?? ["CONFLICT", "AUTO_REJECTED"],
  shouldRun: input.shouldRun ?? (() => true),
  execute: input.execute,
});
