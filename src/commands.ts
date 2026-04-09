import type { ExtensionCommandContext } from "@mariozechner/pi-coding-agent";
import type { TDDPhase } from "./types.js";
import type { PhaseStateMachine } from "./phase.js";

const VALID_PHASES: TDDPhase[] = ["PLAN", "RED", "GREEN", "REFACTOR"];

type Publish = (message: string) => void;

export async function handleTddCommand(
  rawArgs: string,
  machine: PhaseStateMachine,
  ctx: ExtensionCommandContext,
  publish: Publish
): Promise<void> {
  const args = splitCommandArgs(rawArgs);
  const sub = (args[0] ?? "status").toLowerCase();

  switch (sub) {
    case "status":
      publish(formatStatus(machine));
      return;

    case "plan":
    case "red":
    case "green":
    case "refactor": {
      const target = sub.toUpperCase() as TDDPhase;
      if (!VALID_PHASES.includes(target)) {
        publish(`Unknown phase: ${sub}. Valid phases: ${VALID_PHASES.join(", ")}.`);
        return;
      }

      if (machine.phase === "REFACTOR" && target === "RED" && machine.plan.length > 0) {
        machine.completePlanItem();
      }

      const ok = machine.transitionTo(target, "User forced via /tdd command", true);
      if (ok) {
        ctx.ui.setStatus("tdd-gate", machine.statusText());
        ctx.ui.notify(`TDD phase -> ${target}`, "info");
        publish(`Phase set to ${target}.`);
      } else {
        publish(`Already in ${target} phase.`);
      }
      return;
    }

    case "plan-set": {
      const items = args.slice(1).filter(Boolean);
      if (items.length === 0) {
        publish('Usage: /tdd plan-set "Test case 1" "Test case 2" ...');
        return;
      }

      machine.setPlan(items);
      ctx.ui.notify(`Test plan set with ${items.length} item(s)`, "info");
      publish(formatPlan(machine));
      return;
    }

    case "plan-show":
      publish(formatPlan(machine));
      return;

    case "plan-done": {
      machine.completePlanItem();
      const next = machine.currentPlanItem();
      publish(
        next
          ? `Plan item completed. Next: ${next} (${machine.planCompleted}/${machine.plan.length})`
          : `All ${machine.plan.length} plan items completed.`
      );
      return;
    }

    case "off":
      machine.enabled = false;
      ctx.ui.setStatus("tdd-gate", machine.statusText());
      ctx.ui.notify("TDD enforcement disabled", "warning");
      publish("TDD enforcement disabled for this session.");
      return;

    case "on":
      machine.enabled = true;
      ctx.ui.setStatus("tdd-gate", machine.statusText());
      ctx.ui.notify("TDD enforcement enabled", "info");
      publish(`TDD enforcement enabled. Phase: ${machine.phase}.`);
      return;

    case "history":
      publish(formatHistory(machine));
      return;

    default:
      publish(HELP_TEXT);
  }
}

function formatStatus(machine: PhaseStateMachine): string {
  const snap = machine.getSnapshot();
  const lines = [
    machine.statusText(),
    "",
    `Phase:      ${snap.phase}`,
    `Enabled:    ${snap.enabled}`,
    `Cycle:      ${snap.cycleCount}`,
    `Test state: ${snap.lastTestFailed === null ? "unknown" : snap.lastTestFailed ? "failing" : "passing"}`,
    `Diffs:      ${snap.diffs.length} accumulated`,
  ];

  if (snap.plan.length > 0) {
    lines.push(`Plan:       ${snap.planCompleted}/${snap.plan.length} completed`);
  }

  return lines.join("\n");
}

function formatPlan(machine: PhaseStateMachine): string {
  const snap = machine.getSnapshot();
  if (snap.plan.length === 0) {
    return 'No test plan set. Use /tdd plan-set "Test 1" "Test 2" ... to create one.';
  }

  const lines = [`Test plan (${snap.planCompleted}/${snap.plan.length} completed):`, ""];
  for (let i = 0; i < snap.plan.length; i++) {
    const marker = i < snap.planCompleted ? "[x]" : i === snap.planCompleted ? "[>]" : "[ ]";
    lines.push(`${marker} ${i + 1}. ${snap.plan[i]}`);
  }
  return lines.join("\n");
}

function formatHistory(machine: PhaseStateMachine): string {
  const history = machine.getHistory();
  if (history.length === 0) {
    return "No phase transitions recorded yet.";
  }

  const lines = ["Phase transition history:", ""];
  for (const entry of history) {
    const ts = new Date(entry.timestamp).toLocaleTimeString();
    const override = entry.override ? " [OVERRIDE]" : "";
    lines.push(`${ts} ${entry.from} -> ${entry.to}${override}: ${entry.reason}`);
  }
  return lines.join("\n");
}

function splitCommandArgs(raw: string): string[] {
  const args: string[] = [];
  let current = "";
  let quote: '"' | "'" | null = null;
  let escape = false;

  for (const ch of raw.trim()) {
    if (escape) {
      current += ch;
      escape = false;
      continue;
    }

    if (ch === "\\") {
      escape = true;
      continue;
    }

    if (quote) {
      if (ch === quote) {
        quote = null;
      } else {
        current += ch;
      }
      continue;
    }

    if (ch === '"' || ch === "'") {
      quote = ch;
      continue;
    }

    if (/\s/.test(ch)) {
      if (current.length > 0) {
        args.push(current);
        current = "";
      }
      continue;
    }

    current += ch;
  }

  if (current.length > 0) {
    args.push(current);
  }

  return args;
}

const HELP_TEXT = `Usage: /tdd [subcommand]

/tdd status
/tdd plan
/tdd red
/tdd green
/tdd refactor
/tdd plan-set "Test 1" "Test 2"
/tdd plan-show
/tdd plan-done
/tdd off
/tdd on
/tdd history`;
