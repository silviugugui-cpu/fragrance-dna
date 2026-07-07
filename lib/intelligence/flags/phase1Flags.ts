export type Phase1FeatureFlags = {
  eventsWriteEnabled: boolean;
  eventsWriteRequired: boolean;
  projectionsReadUserDna: boolean;
  projectionsReadSession: boolean;
  dualWriteLegacyProfile: boolean;
  dualWriteLegacySession: boolean;
  phase1ShadowValidation: boolean;
  adaptiveTestQuestionsEnabled: boolean;
  adaptiveNextFragranceEnabled: boolean;
  testDualWriteEnabled: boolean;
  testShadowValidationEnabled: boolean;
};

const DEFAULT_FLAGS: Phase1FeatureFlags = {
  eventsWriteEnabled: false,
  eventsWriteRequired: false,
  projectionsReadUserDna: false,
  projectionsReadSession: false,
  dualWriteLegacyProfile: true,
  dualWriteLegacySession: true,
  phase1ShadowValidation: false,
  adaptiveTestQuestionsEnabled: true,
  adaptiveNextFragranceEnabled: true,
  testDualWriteEnabled: false,
  testShadowValidationEnabled: false,
};

export function getPhase1Flags(): Phase1FeatureFlags {
  if (typeof window === "undefined") {
    return DEFAULT_FLAGS;
  }

  return {
    eventsWriteEnabled: readBooleanFlag("ff_events_write_enabled", DEFAULT_FLAGS.eventsWriteEnabled),
    eventsWriteRequired: readBooleanFlag("ff_events_write_required", DEFAULT_FLAGS.eventsWriteRequired),
    projectionsReadUserDna: readBooleanFlag("ff_projections_read_user_dna", DEFAULT_FLAGS.projectionsReadUserDna),
    projectionsReadSession: readBooleanFlag("ff_projections_read_session", DEFAULT_FLAGS.projectionsReadSession),
    dualWriteLegacyProfile: readBooleanFlag("ff_dual_write_legacy_profile", DEFAULT_FLAGS.dualWriteLegacyProfile),
    dualWriteLegacySession: readBooleanFlag("ff_dual_write_legacy_session", DEFAULT_FLAGS.dualWriteLegacySession),
    phase1ShadowValidation: readBooleanFlag("ff_phase1_shadow_validation", DEFAULT_FLAGS.phase1ShadowValidation),
    adaptiveTestQuestionsEnabled: readBooleanFlag(
      "ff_adaptive_test_questions_enabled",
      DEFAULT_FLAGS.adaptiveTestQuestionsEnabled
    ),
    adaptiveNextFragranceEnabled: readBooleanFlag(
      "ff_adaptive_next_fragrance_enabled",
      DEFAULT_FLAGS.adaptiveNextFragranceEnabled
    ),
    testDualWriteEnabled: readBooleanFlag("ff_test_dual_write_enabled", DEFAULT_FLAGS.testDualWriteEnabled),
    testShadowValidationEnabled: readBooleanFlag(
      "ff_test_shadow_validation_enabled",
      DEFAULT_FLAGS.testShadowValidationEnabled
    ),
  };
}

function readBooleanFlag(key: string, fallback: boolean): boolean {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) {
      return fallback;
    }

    return raw === "true";
  } catch {
    return fallback;
  }
}
