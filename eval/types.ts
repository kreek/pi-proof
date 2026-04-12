// Project/variant config is owned by the eval consumer, not the framework

export interface TestStack {
  language: string;
  testFramework: string;
  /** Which part of the project this stack applies to, e.g. "backend", "frontend" */
  scope?: string;
  /** Extra instructions for the agent, e.g. "Create a pyproject.toml." */
  setup?: string;
}

export interface VariantConfig {
  /** Single-package projects: one stack. Monorepos: one stack per package. */
  stacks: TestStack[] | TestStack;
}

export interface ProjectConfig {
  name: string;
  description: string;
  prdFile: string;
  taskCount: number;
  scaffoldDir?: string;
  plugin: string;
  features: string[];
  variants: Record<string, VariantConfig>;
}

/** Flatten stacks to an array regardless of single vs multi */
export function getStacks(variant: VariantConfig): TestStack[] {
  return Array.isArray(variant.stacks) ? variant.stacks : [variant.stacks];
}

// -- Eval configuration -------------------------------------------------------

export interface ModelConfig {
  provider?: string;
  model?: string;
  thinking?: string;
}

export interface EvalConfig {
  worker?: ModelConfig;
  judge?: ModelConfig;
  timeouts?: {
    workerMs?: number;
    inactivityMs?: number;
    judgeMs?: number;
  };
  runSets?: Record<string, Array<{ project: string; variant: string }>>;
}
