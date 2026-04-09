# pi-tdd

`pi-tdd` is a TDD phase gate for [Pi](https://pi.dev), the terminal coding agent by Mario Zechner. It keeps an agent inside a deliberate `PLAN -> RED -> GREEN -> REFACTOR` loop instead of letting it drift straight into broad implementation.

The extension injects phase-specific instructions into the agent prompt, judges tool calls against the current phase, watches test runs, and persists TDD state across the session.

## Pi, in plain English

Pi is a terminal coding agent. You open it in a project, talk to it in natural language, and it can read files, edit code, and run shell commands on your behalf.

If you already understand tools like Codex CLI, Claude Code, or Aider, Pi sits in the same category. The difference is that Pi is intentionally small and highly extensible. This package plugs into Pi as an extension.

Official Pi quick start:

```bash
npm install -g @mariozechner/pi-coding-agent
pi
```

You can authenticate either with `/login` inside Pi or with a provider API key in your shell environment.

## TDD, in plain English

TDD means:

1. Write a test that expresses the next behavior you want.
2. Run it and confirm that it fails.
3. Write the smallest amount of code that makes that test pass.
4. Refactor without changing behavior.
5. Repeat.

The point is not ceremony. The point is to make progress measurable. Instead of saying "the code looks done," you have a failing test, then a passing test, then a cleanup step.

## Why this matters for coding agents

Coding agents are fast, but they also tend to:

- implement before specifying behavior
- change too much at once
- mix feature work with refactors
- declare success from plausibility instead of proof

Those problems are exactly what TDD is good at controlling.

`pi-tdd` makes that discipline operational for an agent:

- It tells the model which kind of work is allowed right now.
- It blocks or challenges out-of-phase tool calls.
- It treats test output as the main transition signal.
- It keeps the cycle visible to the human operator through status and commands.
- It gives you an override path when the gate is too strict, instead of silently letting the agent improvise.

For agents, that usually means less thrash, smaller diffs, better reviewability, and fewer "it seemed reasonable" changes.

## What The Extension Does

- Adds a `/tdd` command inside Pi.
- Tracks the current phase: `PLAN`, `RED`, `GREEN`, or `REFACTOR`.
- Injects phase-specific system prompt guidance on every turn.
- Uses an LLM judge to approve or block phase-sensitive tool calls.
- Detects common test commands such as `npm test`, `pnpm test`, `pytest`, `cargo test`, `go test`, `vitest`, `jest`, and `rspec`.
- Auto-advances from `RED -> GREEN` after a failing test signal and from `GREEN -> REFACTOR` after a passing test signal.
- Persists state in the Pi session so the phase survives restarts and branch navigation.

Important behavior details:

- By default, the extension starts in `RED`, not `PLAN`.
- `PLAN` does not auto-advance. You move out of it with `/tdd red`.
- In the default config, `REFACTOR -> RED` is user-controlled, so you explicitly start the next cycle.
- Read-only exploration is allowed in all phases by default.

## Quick Start

### 1. Install Pi

```bash
npm install -g @mariozechner/pi-coding-agent
```

Then authenticate:

```bash
pi
```

Inside Pi, run `/login`, or set your provider API key before launching Pi.

### 2. Install `pi-tdd` Into a Project

From the project where you want TDD gating:

```bash
pi install -l git:git@github.com:manifestdocs/pi-tdd.git
```

`-l` writes the package to the project's `.pi/settings.json`, so the whole repo can share the same setup.

If Pi is already running, execute:

```text
/reload
```

### 3. Start Using The Gate

Open Pi in your project and try:

```text
/tdd status
/tdd plan-set "adds a failing test for X" "implements minimal support for X" "cleans up duplicated logic"
/tdd red
```

Then prompt the agent normally, for example:

```text
Add a failing test for the missing validation rule. Do not implement the fix yet.
```

After the failing test is confirmed, let the agent make the minimal implementation change. Once the test passes, the extension can move the session into `REFACTOR`.

## `/tdd` Commands

- `/tdd status`: show current phase, test status, and cycle count
- `/tdd plan`: switch to `PLAN`
- `/tdd red`: switch to `RED`
- `/tdd green`: switch to `GREEN`
- `/tdd refactor`: switch to `REFACTOR`
- `/tdd plan-set "Test 1" "Test 2"`: store a test plan
- `/tdd plan-show`: show the active plan
- `/tdd plan-done`: mark the current plan item complete
- `/tdd history`: show phase transitions
- `/tdd off`: disable enforcement for the current session
- `/tdd on`: re-enable enforcement

## Recommended Workflow

For people new to both Pi and TDD, this is the simplest usable loop:

1. Start in `PLAN` if you need clarity, otherwise stay in `RED`.
2. Ask the agent to write one test for one behavior.
3. Run the test and confirm it fails.
4. Let the agent make the smallest possible code change.
5. Run the test again and confirm it passes.
6. Let the agent clean up naming, structure, or duplication in `REFACTOR`.
7. Use `/tdd red` to begin the next slice of behavior.

If the agent tries to jump ahead, the gate is there to slow it down on purpose.

## Configuration

Configure `pi-tdd` in either:

- `~/.pi/agent/settings.json` for global defaults
- `.pi/settings.json` for project-local settings

Example:

```json
{
  "tddGate": {
    "enabled": true,
    "startInPlanMode": true,
    "persistPhase": true,
    "autoTransition": true,
    "refactorTransition": "user",
    "allowReadInAllPhases": true,
    "temperature": 0,
    "maxDiffsInContext": 5
  }
}
```

Useful options:

- `startInPlanMode`: begin each session in `PLAN` instead of `RED`
- `persistPhase`: keep the phase state in the Pi session history
- `autoTransition`: allow the extension to move phases from observed test signals
- `refactorTransition`: choose how `REFACTOR -> RED` happens; default is `"user"`
- `judgeProvider` and `judgeModel`: use a specific model for the gate instead of the current active model
- `guidelines`: override the default plan, test, implementation, refactor, universal, and security guidance blocks

## Local Development

If you want to work on this extension itself:

```bash
git clone git@github.com:manifestdocs/pi-tdd.git
cd pi-tdd
npm install
npm run build
pi install -l /absolute/path/to/pi-tdd
```

Because this repository declares a Pi package manifest, Pi can load it directly from a local path or from Git.

## Limits

This package improves discipline. It does not replace judgment.

- A passing test can still be a weak test.
- An LLM judge can still make a bad call.
- Overrides are sometimes necessary.

The goal is not perfect enforcement. The goal is to make agent behavior more test-driven, more observable, and harder to let drift into unsupported code changes.
