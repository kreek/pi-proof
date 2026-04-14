import type { ProjectConfig } from "../../types.js";

const config: ProjectConfig = {
  name: "booking-api",
  description: "Room booking API with conflict detection and rescheduling",
  prdFile: "PRD.md",
  taskCount: 4,
  plugin: "pi-tdd",
  features: ["test-command-detect", "phase-gating", "red-green-refactor"],
  variants: {
    "python-pytest": {
      stacks: { language: "Python", testFramework: "pytest", setup: "Use Flask. Create a pyproject.toml." },
    },
    "typescript-vitest": {
      stacks: { language: "TypeScript", testFramework: "Vitest", setup: "Use Express." },
    },
    "go-gotest": {
      stacks: { language: "Go", testFramework: "go test", setup: "Use net/http. Create a go.mod." },
    },
  },
};

export default config;
