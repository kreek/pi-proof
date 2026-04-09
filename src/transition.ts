import { isBashToolResult, type ExtensionContext, type ToolResultEvent } from "@mariozechner/pi-coding-agent";
import type { TDDConfig, TestSignal } from "./types.js";
import type { PhaseStateMachine } from "./phase.js";
import { judgeTransition } from "./judge.js";

const TEST_COMMAND_PATTERNS = [
  /\bpytest\b/,
  /\bcargo\s+test\b/,
  /\bnpm\s+test\b/,
  /\byarn\s+test\b/,
  /\bpnpm\s+test\b/,
  /\bgo\s+test\b/,
  /\bvitest\b/,
  /\brspec\b/,
  /\bdeno\s+test\b/,
  /\bmake\s+test\b/,
  /\bzig\s+test\b/,
  /\bjest\b/,
  /\bmocha\b/,
  /\bnpx\s+jest\b/,
  /\bnpx\s+vitest\b/,
  /\bblc\s+check\b/,
  /\bblc\s+test\b/,
  /\bscripts\/test\b/,
];

export function isTestCommand(command: string): boolean {
  return TEST_COMMAND_PATTERNS.some((pattern) => pattern.test(command));
}

export function extractTestSignal(event: ToolResultEvent): TestSignal | null {
  if (!isBashToolResult(event)) {
    return null;
  }

  const command = typeof event.input.command === "string" ? event.input.command : "";
  if (!isTestCommand(command)) {
    return null;
  }

  const output = event.content
    .filter((content): content is { type: "text"; text: string } => content.type === "text")
    .map((content) => content.text)
    .join("\n");

  return {
    command,
    output,
    failed: event.isError,
  };
}

export async function evaluateTransition(
  signals: TestSignal[],
  machine: PhaseStateMachine,
  config: TDDConfig,
  ctx: ExtensionContext
): Promise<void> {
  if (!machine.enabled || !config.autoTransition) {
    return;
  }

  for (const signal of signals) {
    machine.recordTestResult(signal.output, signal.failed);
  }

  if (machine.phase === "PLAN") {
    return;
  }

  const expectedNextPhase = machine.nextPhase();
  if (machine.phase === "REFACTOR" && config.refactorTransition === "user") {
    return;
  }

  if (machine.phase === "RED" && !signals.some((signal) => signal.failed)) {
    return;
  }
  if (machine.phase === "GREEN" && !signals.some((signal) => !signal.failed)) {
    return;
  }

  let verdict;
  try {
    verdict = await judgeTransition(ctx, machine.getSnapshot(), config, expectedNextPhase);
  } catch {
    verdict = fallbackTransition(machine, signals, expectedNextPhase);
  }

  if (verdict.transition !== expectedNextPhase) {
    return;
  }

  const transitioned = machine.transitionTo(verdict.transition, verdict.reason);
  if (!transitioned) {
    return;
  }

  if (ctx.hasUI) {
    ctx.ui.notify(`TDD phase -> ${verdict.transition} (${verdict.reason})`, "info");
  }
  ctx.ui.setStatus("tdd-gate", machine.statusText());
}

function fallbackTransition(
  machine: PhaseStateMachine,
  signals: TestSignal[],
  expectedNextPhase: ReturnType<PhaseStateMachine["nextPhase"]>
): { transition: typeof expectedNextPhase | null; reason: string } {
  if (machine.phase === "RED" && signals.some((signal) => signal.failed)) {
    return {
      transition: expectedNextPhase,
      reason: "Observed a failing test run in RED.",
    };
  }

  if (machine.phase === "GREEN" && signals.some((signal) => !signal.failed)) {
    return {
      transition: expectedNextPhase,
      reason: "Observed a passing test run in GREEN.",
    };
  }

  return {
    transition: null,
    reason: "No deterministic transition signal was found.",
  };
}
