import type {
  TranslationCompatibilityResult,
  TranslationRuleDuplicateIssue,
  TranslationRuleModel,
} from "@/lib/builder/translation/types";

export class TranslationRuleRegistry {
  private readonly byId = new Map<string, TranslationRuleModel>();

  register(rule: TranslationRuleModel): void {
    this.byId.set(this.normalizeRuleId(rule.ruleId), rule);
  }

  update(rule: TranslationRuleModel): void {
    this.register(rule);
  }

  remove(ruleId: string): boolean {
    return this.byId.delete(this.normalizeRuleId(ruleId));
  }

  lookup(ruleId: string): TranslationRuleModel | null {
    return this.byId.get(this.normalizeRuleId(ruleId)) ?? null;
  }

  listRules(): TranslationRuleModel[] {
    return [...this.byId.values()];
  }

  listByType(ruleType: TranslationRuleModel["ruleType"]): TranslationRuleModel[] {
    return this.listRules().filter((rule) => rule.ruleType === ruleType);
  }

  detectDuplicates(rules: TranslationRuleModel[]): TranslationRuleDuplicateIssue[] {
    const issues: TranslationRuleDuplicateIssue[] = [];
    const seen = new Set<string>();

    for (const rule of rules) {
      const normalized = this.normalizeRuleId(rule.ruleId);
      if (seen.has(normalized)) {
        issues.push({
          type: "duplicate-rule-id",
          ruleId: rule.ruleId,
        });
      }
      seen.add(normalized);
    }

    return issues;
  }

  getPriorityOrderedRules(
    ruleType?: TranslationRuleModel["ruleType"],
  ): TranslationRuleModel[] {
    const source = ruleType ? this.listByType(ruleType) : this.listRules();
    return source
      .slice()
      .sort((left, right) => {
        if (left.priority !== right.priority) {
          return right.priority - left.priority;
        }

        return left.ruleId.localeCompare(right.ruleId);
      });
  }

  isVersionCompatible(
    ruleId: string,
    supportedSchemaVersions: number[],
  ): TranslationCompatibilityResult {
    const rule = this.lookup(ruleId);
    if (!rule) {
      return {
        compatible: false,
        errors: ["Rule not found for compatibility check"],
        warnings: [],
      };
    }

    const compatible = supportedSchemaVersions.includes(rule.schemaVersion);
    return {
      compatible,
      errors: compatible ? [] : ["Rule schema version is not compatible"],
      warnings: compatible ? [] : ["Compatibility is placeholder-level in this milestone"],
    };
  }

  setEnabled(ruleId: string, enabled: boolean): TranslationRuleModel | null {
    const current = this.lookup(ruleId);
    if (!current) {
      return null;
    }

    const updated: TranslationRuleModel = {
      ...current,
      enabled,
      updatedAt: new Date().toISOString(),
    };

    this.update(updated);
    return updated;
  }

  count(): number {
    return this.byId.size;
  }

  private normalizeRuleId(ruleId: string): string {
    return ruleId.trim().toLowerCase();
  }
}
