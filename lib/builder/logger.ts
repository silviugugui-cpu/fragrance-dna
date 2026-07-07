import type { ArtifactType, StageName } from "@/lib/builder/contracts";

export type StageLogStatus = "running" | "success" | "failed";

export interface StageExecutionLog {
  stage: StageName;
  startTime: string;
  finishTime: string | null;
  durationMs: number | null;
  status: StageLogStatus;
  errors: string[];
  warnings: string[];
  artifactProduced: string | null;
  artifactType: ArtifactType | null;
  artifactVersion: string | null;
}

export class BuilderPipelineLogger {
  private readonly logs: StageExecutionLog[] = [];

  startStage(stage: StageName): void {
    this.logs.push({
      stage,
      startTime: new Date().toISOString(),
      finishTime: null,
      durationMs: null,
      status: "running",
      errors: [],
      warnings: [],
      artifactProduced: null,
      artifactType: null,
      artifactVersion: null,
    });
  }

  warnStage(stage: StageName, warning: string): void {
    const entry = this.findOpenOrLatest(stage);
    if (!entry) {
      return;
    }

    entry.warnings.push(warning);
  }

  failStage(stage: StageName, error: string): void {
    const entry = this.findOpenOrLatest(stage);
    if (!entry) {
      return;
    }

    entry.errors.push(error);
    entry.status = "failed";
    this.complete(entry);
  }

  completeStage(input: {
    stage: StageName;
    status: Exclude<StageLogStatus, "running">;
    artifactProduced: string;
    artifactType: ArtifactType;
    artifactVersion: string;
  }): void {
    const entry = this.findOpenOrLatest(input.stage);
    if (!entry) {
      return;
    }

    entry.status = input.status;
    entry.artifactProduced = input.artifactProduced;
    entry.artifactType = input.artifactType;
    entry.artifactVersion = input.artifactVersion;
    this.complete(entry);
  }

  getLogs(): StageExecutionLog[] {
    return [...this.logs];
  }

  private complete(entry: StageExecutionLog): void {
    entry.finishTime = new Date().toISOString();
    const start = new Date(entry.startTime).getTime();
    const finish = new Date(entry.finishTime).getTime();
    entry.durationMs = finish - start;
  }

  private findOpenOrLatest(stage: StageName): StageExecutionLog | null {
    for (let index = this.logs.length - 1; index >= 0; index -= 1) {
      if (this.logs[index].stage === stage) {
        return this.logs[index];
      }
    }

    return null;
  }
}
