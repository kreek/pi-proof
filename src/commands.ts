import type { ExtensionCommandContext } from "@mariozechner/pi-coding-agent";
import type { TDDConfig, TDDPhase } from "./types.js";
import type { PhaseStateMachine } from "./phase.js";

const VALID_PHASES: TDDPhase[] = ["SPEC", "RED", "GREEN", "REFACTOR"];

type Publish = (message: string) => void;

export async function handleTddCommand(
  rawArgs: string,
  machine: PhaseStateMachine,
  ctx: ExtensionCommandContext,
  publish: Publish,
  config?: Pick<TDDConfig, "enabled">
): Promise<void> {
  const args = splitCommandArgs(rawArgs);
  const sub = (args[0] ?? "status").toLowerCase();
  const configDisabled = config?.enabled === false;

  switch (sub) {
    case "status":
      publish(formatStatus(machine, configDisabled));
      return;

    case "spec":
    case "plan":
    case "red":
    case "green":
    case "refactor": {
      if (configDisabled) {
        publishDisabled(machine, ctx, publish);
        return;
      }

      const normalized = sub === "plan" ? "SPEC" : sub.toUpperCase();
      const target = normalized as TDDPhase;
      if (!VALID_PHASES.includes(target)) {
        publish(`Unknown phase: ${sub}. Valid phases: ${VALID_PHASES.join(", ")}.`);
        return;
      }

      if (machine.phase === "REFACTOR" && target === "RED" && machine.plan.length > 0) {
        machine.completePlanItem();
      }

      const wasDormant = !machine.enabled;
      machine.enabled = true;

      const ok = machine.transitionTo(target, "User forced via /tdd command", target !== machine.nextPhase());
      ctx.ui.setStatus("tdd-gate", machine.bottomBarText());
      if (ok) {
        ctx.ui.notify(
          wasDormant ? `TDD engaged in ${target}` : `TDD phase -> ${target}`,
          "info"
        );
        publish(wasDormant ? `TDD engaged. Phase set to ${target}.` : `Phase set to ${target}.`);
      } else if (wasDormant) {
        ctx.ui.notify(`TDD engaged in ${target}`, "info");
        publish(`TDD engaged. Already in ${target} phase.`);
      } else {
        publish(`Already in ${target} phase.`);
      }
      return;
    }

    case "spec-set":
    case "plan-set": {
      const items = args.slice(1).filter(Boolean);
      if (items.length === 0) {
        publish('Usage: /tdd spec-set "Criterion 1" "Criterion 2" ...');
        return;
      }

      machine.setPlan(items);
      ctx.ui.notify(`Feature spec set with ${items.length} item(s)`, "info");
      publish(formatSpec(machine));
      return;
    }

    case "spec-show":
    case "plan-show":
      publish(formatSpec(machine));
      return;

    case "spec-done":
    case "plan-done": {
      machine.completePlanItem();
      const next = machine.currentPlanItem();
      publish(
        next
          ? `Spec item completed. Next: ${next} (${machine.planCompleted}/${machine.plan.length})`
          : `All ${machine.plan.length} spec items completed.`
      );
      return;
    }

    case "off":
    case "disengage":
      machine.enabled = false;
      ctx.ui.setStatus("tdd-gate", machine.bottomBarText());
      ctx.ui.notify("TDD disengaged", "info");
      publish("TDD disengaged. Investigation and navigation are unconstrained.");
      return;

    case "on":
    case "engage":
      if (configDisabled) {
        publishDisabled(machine, ctx, publish);
        return;
      }
      machine.enabled = true;
      ctx.ui.setStatus("tdd-gate", machine.bottomBarText());
      ctx.ui.notify("TDD engaged", "info");
      publish(`TDD engaged. Phase: ${machine.phase}.`);
      return;

    case "history":
      publish(formatHistory(machine));
      return;

    default:
      publish(HELP_TEXT);
  }
}

function formatStatus(machine: PhaseStateMachine, configDisabled = false): string {
  const snap = machine.getSnapshot();
  const lines = [
    configDisabled ? "[TDD: disabled]" : machine.statusText(),
    "",
    `Phase:      ${snap.phase}`,
    `Enabled:    ${configDisabled ? false : snap.enabled}`,
    `Cycle:      ${snap.cycleCount}`,
    `Test state: ${snap.lastTestFailed === null ? "unknown" : snap.lastTestFailed ? "failing" : "passing"}`,
    `Diffs:      ${snap.diffs.length} accumulated`,
  ];

  if (configDisabled) {
    lines.push("Mode:       disabled by configuration");
  }

  if (snap.plan.length > 0) {
    lines.push(`Spec:       ${snap.planCompleted}/${snap.plan.length} completed`);
  }

  return lines.join("\n");
}

function publishDisabled(
  machine: PhaseStateMachine,
  ctx: ExtensionCommandContext,
  publish: Publish
): void {
  machine.enabled = false;
  ctx.ui.setStatus("tdd-gate", machine.bottomBarText());
  ctx.ui.notify("TDD is disabled by configuration", "warning");
  publish("TDD is disabled by configuration.");
}

function formatSpec(machine: PhaseStateMachine): string {
  const snap = machine.getSnapshot();
  if (snap.plan.length === 0) {
    return 'No feature spec set. Use /tdd spec-set "Criterion 1" "Criterion 2" ... to create one.';
  }

  const lines = [`Feature spec (${snap.planCompleted}/${snap.plan.length} completed):`, ""];
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

export function splitCommandArgs(raw: string): string[] {
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
/tdd spec       (engages and switches to SPEC)
/tdd red        (engages and switches to RED)
/tdd green      (engages and switches to GREEN)
/tdd refactor   (engages and switches to REFACTOR)
/tdd spec-set "Criterion 1" "Criterion 2"
/tdd spec-show
/tdd spec-done
/tdd engage     (alias /tdd on)
/tdd disengage  (alias /tdd off)
/tdd history`;
