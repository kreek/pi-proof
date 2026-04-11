import type { ExtensionContext } from "@mariozechner/pi-coding-agent";
import type { PhaseStateMachine } from "./phase.js";
import { hasRunnableTestHarness } from "./test-harness.js";

export interface SpecSessionOutcome {
  started: boolean;
  waitingForHarness: boolean;
}

export function maybeStartSpecSession(
  machine: PhaseStateMachine,
  ctx: Pick<ExtensionContext, "cwd">
): SpecSessionOutcome {
  if (machine.enabled) {
    return { started: false, waitingForHarness: false };
  }

  if (!hasRunnableTestHarness(ctx.cwd)) {
    return { started: false, waitingForHarness: true };
  }

  machine.enabled = true;
  machine.transitionTo("SPEC", "Entered SPEC via TDD spec work");
  return { started: true, waitingForHarness: false };
}
