import { compareRulePriority } from "@/lib/builder/validationEngine/RulePriority";
import type { RuleVersion } from "@/lib/builder/validationEngine/RuleVersion";
import type { ValidationRule } from "@/lib/builder/validationEngine/ValidationRule";

export interface RuleRegistry {
  register<TInput = unknown>(rule: ValidationRule<TInput>): void;
  unregister(ruleId: string): boolean;
  enable(ruleId: string): boolean;
  disable(ruleId: string): boolean;
  changePriority(ruleId: string, priority: number): boolean;
  lookupVersion(ruleId: string): RuleVersion | null;
  getExecutionOrder(group?: string): ValidationRule[];
  listRules(): ValidationRule[];
}

export class InMemoryRuleRegistry implements RuleRegistry {
  private readonly rulesById = new Map<string, ValidationRule>();

  register<TInput = unknown>(rule: ValidationRule<TInput>): void {
    const existing = this.rulesById.get(rule.version.ruleId);
    if (existing) {
      throw new Error(`Rule with id ${rule.version.ruleId} is already registered`);
    }

    this.rulesById.set(rule.version.ruleId, rule as ValidationRule);
  }

  unregister(ruleId: string): boolean {
    return this.rulesById.delete(ruleId);
  }

  enable(ruleId: string): boolean {
    const rule = this.rulesById.get(ruleId);
    if (!rule) {
      return false;
    }

    rule.enabled = true;
    return true;
  }

  disable(ruleId: string): boolean {
    const rule = this.rulesById.get(ruleId);
    if (!rule) {
      return false;
    }

    rule.enabled = false;
    return true;
  }

  changePriority(ruleId: string, priority: number): boolean {
    const rule = this.rulesById.get(ruleId);
    if (!rule) {
      return false;
    }

    rule.priority = priority;
    return true;
  }

  lookupVersion(ruleId: string): RuleVersion | null {
    const rule = this.rulesById.get(ruleId);
    return rule ? rule.version : null;
  }

  getExecutionOrder(group?: string): ValidationRule[] {
    const values = Array.from(this.rulesById.values()).filter((rule) => {
      if (group === undefined) {
        return true;
      }

      return rule.group === group;
    });

    return values.sort((left, right) => {
      const byPriority = compareRulePriority(left.priority, right.priority);
      if (byPriority !== 0) {
        return byPriority;
      }

      return left.version.ruleId.localeCompare(right.version.ruleId);
    });
  }

  listRules(): ValidationRule[] {
    return this.getExecutionOrder();
  }
}

export const createInMemoryRuleRegistry = (): InMemoryRuleRegistry =>
  new InMemoryRuleRegistry();
