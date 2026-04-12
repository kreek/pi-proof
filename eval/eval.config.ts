import type { EvalConfig } from "./types.js";

const config: EvalConfig = {
  worker: {
    // Omit to use Pi's default settings from ~/.pi/agent/settings.json
  },
  judge: {
    provider: "openai-codex",
    model: "gpt-5.4",
  },
  timeouts: {
    workerMs: 15 * 60 * 1000,
    inactivityMs: 2 * 60 * 1000,
    judgeMs: 2 * 60 * 1000,
  },
  runSets: {
    quick: [
      { project: "stack-calc", variant: "typescript-vitest" },
      { project: "todo-cli", variant: "typescript-vitest" },
    ],
    rust: [{ project: "todo-cli", variant: "rust-cargo" }],
    full: [
      { project: "stack-calc", variant: "typescript-vitest" },
      { project: "stack-calc", variant: "typescript-jest" },
      { project: "stack-calc", variant: "python-pytest" },
      { project: "stack-calc", variant: "python-unittest" },
      { project: "stack-calc", variant: "go-gotest" },
      { project: "word-freq", variant: "go-gotest" },
      { project: "word-freq", variant: "python-pytest" },
      { project: "word-freq", variant: "typescript-vitest" },
      { project: "todo-cli", variant: "rust-cargo" },
      { project: "todo-cli", variant: "go-gotest" },
      { project: "todo-cli", variant: "typescript-vitest" },
      { project: "temp-api", variant: "python-pytest" },
      { project: "temp-api", variant: "typescript-vitest" },
      { project: "temp-api", variant: "go-gotest" },
      { project: "fizzbuzz-polyglot", variant: "c-tap" },
      { project: "fizzbuzz-polyglot", variant: "typescript-vitest" },
      { project: "fizzbuzz-polyglot", variant: "ruby-rspec" },
      { project: "fullstack-notes", variant: "typescript-vitest" },
      { project: "fullstack-notes", variant: "typescript-jest" },
    ],
  },
};

export default config;
