export type QuestionDefinition = {
  canonicalAttributeId: string;
  displayName: string;
  importance: number;
  questionType: "intensity-scale";
  scale: {
    min: number;
    max: number;
    step: number;
    minLabel: string;
    maxLabel: string;
  };
  metadata: {
    description: string;
    fragranceDisplayName: string;
    localizationKey: string;
    source: "core" | "supporting" | "derived";
  };
  confidence?: number;
};
