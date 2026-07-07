import {
  createValidationContext,
  type ValidationContext,
  type ValidationContextOptions,
} from "@/lib/builder/validationEngine/ValidationContext";
import type { DecisionReport } from "@/lib/builder/validationEngine/DecisionReport";
import {
  createInMemoryRuleRegistry,
  type InMemoryRuleRegistry,
} from "@/lib/builder/validationEngine/RuleRegistry";
import {
  RuleExecutor,
  type RuleExecutorOptions,
} from "@/lib/builder/validationEngine/RuleExecutor";
import type { ValidationRule } from "@/lib/builder/validationEngine/ValidationRule";

export interface ValidationEngine {
  registerRule<TInput = unknown>(rule: ValidationRule<TInput>): void;
  unregisterRule(ruleId: string): boolean;
  enableRule(ruleId: string): boolean;
  disableRule(ruleId: string): boolean;
  validate<TInput = unknown>(
    contextOptions: ValidationContextOptions<TInput>,
    options?: RuleExecutorOptions,
  ): Promise<DecisionReport<TInput>>;
  validateWithContext<TInput = unknown>(
    context: ValidationContext<TInput>,
    options?: RuleExecutorOptions,
  ): Promise<DecisionReport<TInput>>;
  getRegistry(): InMemoryRuleRegistry;
}

export class DefaultValidationEngine implements ValidationEngine {
  private readonly executor: RuleExecutor;

  constructor(private readonly registry: InMemoryRuleRegistry = createInMemoryRuleRegistry()) {
    this.executor = new RuleExecutor(this.registry);
  }

  registerRule<TInput = unknown>(rule: ValidationRule<TInput>): void {
    this.registry.register(rule);
  }

  unregisterRule(ruleId: string): boolean {
    return this.registry.unregister(ruleId);
  }

  enableRule(ruleId: string): boolean {
    return this.registry.enable(ruleId);
  }

  disableRule(ruleId: string): boolean {
    return this.registry.disable(ruleId);
  }

  async validate<TInput = unknown>(
    contextOptions: ValidationContextOptions<TInput>,
    options: RuleExecutorOptions = {},
  ): Promise<DecisionReport<TInput>> {
    const context = createValidationContext(contextOptions);
    return this.executor.execute(context, options);
  }

  async validateWithContext<TInput = unknown>(
    context: ValidationContext<TInput>,
    options: RuleExecutorOptions = {},
  ): Promise<DecisionReport<TInput>> {
    return this.executor.execute(context, options);
  }

  getRegistry(): InMemoryRuleRegistry {
    return this.registry;
  }
}

export const createValidationEngine = (): DefaultValidationEngine =>
  new DefaultValidationEngine();
