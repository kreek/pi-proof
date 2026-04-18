import type { ProjectConfig } from "../../types.js";

const config: ProjectConfig = {
  name: "kanban-board",
  description: "Fullstack kanban board with ordered columns and cards",
  prdFile: "PRD.md",
  taskCount: 4,
  plugin: "pi-proof",
  features: ["monorepo-detection", "subdirectory-exec", "test-command-detect", "phase-gating", "red-green-refactor"],
  variants: {
    "python-pytest-react": {
      stacks: [
        {
          language: "Python",
          testFramework: "pytest",
          scope: "backend API",
          setup: "Use Flask. Create a pyproject.toml.",
        },
        {
          language: "TypeScript",
          testFramework: "Vitest",
          scope: "frontend",
          setup: "Use React with Vite.",
        },
      ],
    },
    "typescript-vitest-svelte": {
      stacks: [
        {
          language: "TypeScript",
          testFramework: "Vitest",
          scope: "backend API",
          setup: "Use Express.",
        },
        {
          language: "TypeScript",
          testFramework: "Vitest",
          scope: "frontend",
          setup: "Use Svelte with Vite.",
        },
      ],
    },
    "go-gotest-vue": {
      stacks: [
        {
          language: "Go",
          testFramework: "go test",
          scope: "backend API",
          setup: "Use net/http. Create a go.mod.",
        },
        {
          language: "TypeScript",
          testFramework: "Vitest",
          scope: "frontend",
          setup: "Use Vue with Vite.",
        },
      ],
    },
  },
};

export default config;
