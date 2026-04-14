import type { ProjectConfig } from "../../types.js";

const config: ProjectConfig = {
  name: "link-shortener",
  description: "Fullstack link shortener with a separate backend API and SPA frontend",
  prdFile: "PRD.md",
  taskCount: 4,
  plugin: "pi-tdd",
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
    "python-pytest-svelte": {
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
          setup: "Use Svelte with Vite.",
        },
      ],
    },
    "python-pytest-vue": {
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
          setup: "Use Vue with Vite.",
        },
      ],
    },
    "typescript-vitest-react": {
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
    "typescript-vitest-vue": {
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
          setup: "Use Vue with Vite.",
        },
      ],
    },
    "go-gotest-react": {
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
          setup: "Use React with Vite.",
        },
      ],
    },
    "go-gotest-svelte": {
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
