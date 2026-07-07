import { getCanonicalAttributeById } from "@/lib/intelligence/attributes";
import type {
  AttributeBehaviorSignalPayload,
  PreferenceStrengthChangedPayload,
} from "@/lib/intelligence/events";
import type {
  CanonicalFragranceAttribute,
  CanonicalFragranceModel,
} from "@/lib/intelligence/fragranceIntelligence";
import type { QuestionDefinition } from "@/lib/intelligence/questions";
import type { AnswerRecord } from "@/lib/types";

const LEGACY_STATIC_ATTRIBUTE_IDS = [
  "elegant",
  "charismatic",
  "mysterious",
  "citrus",
  "honeyed",
  "woody",
] as const;

export type CanonicalEvaluationSource = "test" | "collection";

export type CanonicalBehaviorEventType =
  | "attribute_liked"
  | "attribute_disliked"
  | "attribute_ignored"
  | "attribute_uncertain"
  | "preference_strength_changed";

export function getCanonicalEvaluationQuestionsForFragrance(
  fragrance: CanonicalFragranceModel,
  options?: {
    adaptiveEnabled?: boolean;
    allowLegacyFallback?: boolean;
  }
): QuestionDefinition[] {
  if (!options?.adaptiveEnabled) {
    return buildLegacyFallbackQuestions(fragrance.displayName);
  }

  if (!fragrance.coreAttributes.length) {
    return options.allowLegacyFallback ? buildLegacyFallbackQuestions(fragrance.displayName) : [];
  }

  const questions = fragrance.coreAttributes.map((attribute) =>
    mapCanonicalAttributeToQuestion(attribute, fragrance.displayName)
  );

  if (questions.length === 0) {
    return options.allowLegacyFallback ? buildLegacyFallbackQuestions(fragrance.displayName) : [];
  }

  return questions.slice(0, 10);
}

export function buildCanonicalDefaultAnswers(questions: QuestionDefinition[]): AnswerRecord {
  const defaults: AnswerRecord = {};

  for (const question of questions) {
    defaults[question.canonicalAttributeId] = 50;
  }

  return defaults;
}

export function buildCanonicalBehaviorEventInputs(input: {
  fragranceId: string;
  answerDimensions: Record<string, number>;
  source: CanonicalEvaluationSource;
}): Array<{
  eventType: CanonicalBehaviorEventType;
  payload: AttributeBehaviorSignalPayload | PreferenceStrengthChangedPayload;
}> {
  const items: Array<{
    eventType: CanonicalBehaviorEventType;
    payload: AttributeBehaviorSignalPayload | PreferenceStrengthChangedPayload;
  }> = [];

  for (const [canonicalAttributeId, value] of Object.entries(input.answerDimensions)) {
    const sentimentType = classifyBehaviorSignal(value);
    const currentStrength = clampSigned((value - 50) / 50);

    items.push({
      eventType: sentimentType,
      payload: {
        fragranceId: input.fragranceId,
        canonicalAttributeId,
        value,
        source: input.source,
      },
    });

    items.push({
      eventType: "preference_strength_changed",
      payload: {
        fragranceId: input.fragranceId,
        canonicalAttributeId,
        previousStrength: 0,
        currentStrength,
        delta: currentStrength,
        confidence: Math.abs(currentStrength),
        source: input.source,
      },
    });
  }

  return items;
}

function mapCanonicalAttributeToQuestion(
  attribute: CanonicalFragranceAttribute,
  fragranceName: string
): QuestionDefinition {
  const definition = getCanonicalAttributeById(attribute.canonicalAttributeId);
  const questionDefaults = definition?.questionDefaults;

  const description = questionDefaults
    ? questionDefaults.promptTemplate
        .replace("{attribute}", attribute.displayName.toLowerCase())
        .replace("{fragrance}", fragranceName)
    : `Evaluate how present ${attribute.displayName.toLowerCase()} feels in ${fragranceName}.`;

  return {
    canonicalAttributeId: attribute.canonicalAttributeId,
    displayName: attribute.displayName,
    importance: attribute.importance ?? definition?.defaultImportance ?? 0.7,
    questionType: "intensity-scale",
    scale: questionDefaults?.scale ?? {
      min: 0,
      max: 100,
      step: 1,
      minLabel: "Not Present",
      maxLabel: "Very Present",
    },
    metadata: {
      description,
      fragranceDisplayName: fragranceName,
      localizationKey:
        attribute.metadata?.localizationKey ?? definition?.localization.translationKey ?? "",
      source: attribute.source,
    },
    confidence: attribute.confidence,
  };
}

function buildLegacyFallbackQuestions(fragranceName: string): QuestionDefinition[] {
  return LEGACY_STATIC_ATTRIBUTE_IDS.flatMap((attributeId) => {
    const definition = getCanonicalAttributeById(attributeId);
    if (!definition) {
      return [];
    }

    const description = definition.questionDefaults.promptTemplate
      .replace("{attribute}", definition.displayName.toLowerCase())
      .replace("{fragrance}", fragranceName);

    return [
      {
        canonicalAttributeId: definition.canonicalAttributeId,
        displayName: definition.displayName,
        importance: definition.defaultImportance,
        questionType: definition.questionDefaults.questionType,
        scale: definition.questionDefaults.scale,
        metadata: {
          description,
          fragranceDisplayName: fragranceName,
          localizationKey: definition.localization.translationKey,
          source: "core" as const,
        },
      },
    ];
  });
}

function classifyBehaviorSignal(value: number):
  | "attribute_liked"
  | "attribute_disliked"
  | "attribute_ignored"
  | "attribute_uncertain" {
  if (value >= 70) {
    return "attribute_liked";
  }

  if (value <= 30) {
    return "attribute_disliked";
  }

  if (value >= 45 && value <= 55) {
    return "attribute_ignored";
  }

  return "attribute_uncertain";
}

function clampSigned(value: number): number {
  return Math.max(-1, Math.min(1, value));
}