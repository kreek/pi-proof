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
      { trial: "stack-calc", variant: "typescript-vitest" },
      { trial: "todo-cli", variant: "typescript-vitest" },
    ],
    rust: [{ trial: "todo-cli", variant: "rust-cargo" }],
    full: [
      { trial: "stack-calc", variant: "typescript-vitest" },
      { trial: "stack-calc", variant: "typescript-jest" },
      { trial: "stack-calc", variant: "python-pytest" },
      { trial: "stack-calc", variant: "python-unittest" },
      { trial: "stack-calc", variant: "go-gotest" },
      { trial: "word-freq", variant: "go-gotest" },
      { trial: "word-freq", variant: "python-pytest" },
      { trial: "word-freq", variant: "typescript-vitest" },
      { trial: "todo-cli", variant: "rust-cargo" },
      { trial: "todo-cli", variant: "go-gotest" },
      { trial: "todo-cli", variant: "typescript-vitest" },
      { trial: "temp-api", variant: "python-pytest" },
      { trial: "temp-api", variant: "typescript-vitest" },
      { trial: "temp-api", variant: "go-gotest" },
      { trial: "fizzbuzz-polyglot", variant: "c-tap" },
      { trial: "fizzbuzz-polyglot", variant: "typescript-vitest" },
      { trial: "fizzbuzz-polyglot", variant: "ruby-rspec" },
      { trial: "fullstack-notes", variant: "typescript-vitest" },
      { trial: "fullstack-notes", variant: "typescript-jest" },
    ],
  },
};

export default config;
