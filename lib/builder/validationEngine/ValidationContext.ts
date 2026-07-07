export interface ValidationContext<TInput = unknown> {
  runId: string;
  startedAt: string;
  engineVersion: string;
  inputEntity: TInput;
  metadata: Record<string, unknown>;
}

export interface ValidationContextOptions<TInput = unknown> {
  runId?: string;
  startedAt?: string;
  engineVersion?: string;
  inputEntity: TInput;
  metadata?: Record<string, unknown>;
}

export const createValidationContext = <TInput = unknown>(
  options: ValidationContextOptions<TInput>,
): ValidationContext<TInput> => ({
  runId: options.runId ?? `validation-run-${Date.now()}`,
  startedAt: options.startedAt ?? new Date().toISOString(),
  engineVersion: options.engineVersion ?? "1.0.0",
  inputEntity: options.inputEntity,
  metadata: options.metadata ?? {},
});
