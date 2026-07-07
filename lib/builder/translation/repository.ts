import { TranslationRuleRegistry } from "@/lib/builder/translation/registry";
import type { TranslationRuleModel } from "@/lib/builder/translation/types";
import { validateRule } from "@/lib/builder/translation/validator";

export interface TranslationRuleRepository {
  getRule(ruleId: string): TranslationRuleModel | null;
  getAllRules(): TranslationRuleModel[];
  registerRule(rule: TranslationRuleModel): TranslationRuleModel;
  updateRule(ruleId: string, updates: Partial<TranslationRuleModel>): TranslationRuleModel | null;
  removeRule(ruleId: string): boolean;
}

export class InMemoryTranslationRuleRepository
  implements TranslationRuleRepository
{
  private readonly registry: TranslationRuleRegistry;

  constructor(registry: TranslationRuleRegistry = new TranslationRuleRegistry()) {
    this.registry = registry;
  }

  getRule(ruleId: string): TranslationRuleModel | null {
    const item = this.registry.lookup(ruleId);
    return item ? deepClone(item) : null;
  }

  getAllRules(): TranslationRuleModel[] {
    return this.registry.listRules().map((rule) => deepClone(rule));
  }

  registerRule(rule: TranslationRuleModel): TranslationRuleModel {
    const validation = validateRule(rule);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    if (this.registry.lookup(rule.ruleId)) {
      throw new Error(`Duplicate ruleId: ${rule.ruleId}`);
    }

    this.registry.register(deepClone(rule));
    return deepClone(rule);
  }

  updateRule(
    ruleId: string,
    updates: Partial<TranslationRuleModel>,
  ): TranslationRuleModel | null {
    const existing = this.registry.lookup(ruleId);
    if (!existing) {
      return null;
    }

    const next: TranslationRuleModel = {
      ...existing,
      ...updates,
      ruleId: existing.ruleId,
      updatedAt: updates.updatedAt ?? new Date().toISOString(),
    };

    const validation = validateRule(next);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    this.registry.update(deepClone(next));
    return deepClone(next);
  }

  removeRule(ruleId: string): boolean {
    return this.registry.remove(ruleId);
  }

  getRegistry(): TranslationRuleRegistry {
    return this.registry;
  }
}

export const createInMemoryTranslationRuleRepository = (): InMemoryTranslationRuleRepository =>
  new InMemoryTranslationRuleRepository();

const deepClone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;
