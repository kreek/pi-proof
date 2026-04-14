import type { ProjectConfig } from "../../types.js";

const config: ProjectConfig = {
  name: "shopping-cart",
  description: "Shopping cart pricing engine with discounts and tax calculation",
  prdFile: "PRD.md",
  taskCount: 4,
  plugin: "pi-tdd",
  features: ["test-command-detect", "phase-gating", "red-green-refactor"],
  variants: {
    "rust-cargo": {
      stacks: { language: "Rust", testFramework: "cargo test" },
    },
    "python-pytest": {
      stacks: { language: "Python", testFramework: "pytest", setup: "Create a pyproject.toml." },
    },
    "typescript-vitest": {
      stacks: { language: "TypeScript", testFramework: "Vitest" },
    },
  },
};

export default config;
