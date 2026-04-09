import { Type } from "@mariozechner/pi-ai";
import type {
  ExtensionAPI,
  ExtensionContext,
  ToolDefinition,
} from "@mariozechner/pi-coding-agent";
import type { PhaseStateMachine } from "./phase.js";
import { persistState } from "./persistence.js";
import type { TDDConfig, TDDPhase } from "./types.js";

const STATUS_KEY = "tdd-gate";

export const ENGAGE_TOOL_NAME = "tdd_engage";
export const DISENGAGE_TOOL_NAME = "tdd_disengage";

export interface EngagementDeps {
  pi: ExtensionAPI;
  machine: PhaseStateMachine;
  getConfig: () => TDDConfig;
}

interface EngageParams {
  phase?: string;
  reason: string;
}

interface DisengageParams {
  reason: string;
}

interface EngagementDetails {
  engaged: boolean;
  phase: TDDPhase | null;
  reason: string;
}

function normalizePhase(value: string | undefined): TDDPhase | null {
  if (!value) return null;
  const normalized = value.trim().toUpperCase();
  if (normalized === "SPEC" || normalized === "RED" || normalized === "GREEN" || normalized === "REFACTOR") {
    return normalized;
  }
  if (normalized === "PLAN") return "SPEC";
  return null;
}

function persistIfEnabled(deps: EngagementDeps): void {
  const config = deps.getConfig();
  if (config.persistPhase) {
    persistState(deps.pi, deps.machine);
  }
}

export function createEngageTool(
  deps: EngagementDeps
): ToolDefinition<ReturnType<typeof Type.Object>, EngagementDetails, EngageParams> {
  return {
    name: ENGAGE_TOOL_NAME,
    label: "Engage TDD",
    description:
      "Engage the TDD phase gate for feature or bug-fix work. Call this at the start of any work that introduces, modifies, or fixes user-visible behavior. " +
      "Pass phase='SPEC' when the request still needs to be translated into testable acceptance criteria, or phase='RED' when criteria are already clear enough to write the first failing test. Defaults to SPEC.",
    promptSnippet:
      "Engage TDD enforcement before starting a feature or bug fix.",
    promptGuidelines: [
      "Call tdd_engage at the start of any feature or bug-fix work, before any code changes. Use phase='SPEC' if requirements need clarification, phase='RED' if you can write the first failing test immediately.",
      "Do NOT engage TDD for investigation, navigation, branch management, code review, or research. Stay dormant for non-feature work.",
      "After engaging, the TDD phase gate will judge subsequent tool calls against the active phase. Call tdd_disengage when leaving feature work.",
    ],
    parameters: Type.Object({
      phase: Type.Optional(
        Type.String({
          description: "TDD phase to start in: SPEC (default) or RED",
        })
      ),
      reason: Type.String({
        description: "Short description of the feature or bug being worked on",
      }),
    }),
    async execute(_toolCallId, params, _signal, _onUpdate, ctx: ExtensionContext) {
      const config = deps.getConfig();
      const machine = deps.machine;
      if (!config.enabled) {
        machine.enabled = false;
        ctx.ui.setStatus(STATUS_KEY, machine.bottomBarText());
        if (ctx.hasUI) {
          ctx.ui.notify("TDD is disabled by configuration", "warning");
        }
        return {
          content: [
            {
              type: "text",
              text: "TDD is disabled by configuration.",
            },
          ],
          details: { engaged: false, phase: null, reason: "disabled by configuration" },
        };
      }

      const phase = normalizePhase(params.phase) ?? "SPEC";
      const reason = String(params.reason ?? "feature/bug work");

      const wasEnabled = machine.enabled;
      machine.enabled = true;
      if (machine.phase !== phase) {
        machine.transitionTo(phase, `tdd_engage: ${reason}`, true);
      }

      persistIfEnabled(deps);
      ctx.ui.setStatus(STATUS_KEY, machine.bottomBarText());
      if (ctx.hasUI) {
        const verb = wasEnabled ? "TDD phase set to" : "TDD engaged in";
        ctx.ui.notify(`${verb} ${phase}: ${reason}`, "info");
      }

      return {
        content: [
          {
            type: "text",
            text: `TDD engaged in ${phase} phase. ${reason}`,
          },
        ],
        details: { engaged: true, phase, reason },
      };
    },
  };
}

export function createDisengageTool(
  deps: EngagementDeps
): ToolDefinition<ReturnType<typeof Type.Object>, EngagementDetails, DisengageParams> {
  return {
    name: DISENGAGE_TOOL_NAME,
    label: "Disengage TDD",
    description:
      "Disengage the TDD phase gate when leaving feature or bug-fix work. Call this when switching to investigation, navigation, code review, or any non-feature task so subsequent tool calls are not judged against TDD phase rules.",
    promptSnippet: "Disengage TDD enforcement when leaving feature work.",
    promptGuidelines: [
      "Call tdd_disengage when feature or bug-fix work is finished, or when switching to investigation, branch navigation, or unrelated tasks.",
      "Stay disengaged until you start the next feature or bug fix.",
    ],
    parameters: Type.Object({
      reason: Type.String({
        description: "Brief reason for disengaging (e.g. 'feature complete', 'switching to investigation')",
      }),
    }),
    async execute(_toolCallId, params, _signal, _onUpdate, ctx: ExtensionContext) {
      const machine = deps.machine;
      const reason = String(params.reason ?? "leaving feature work");
      const wasEnabled = machine.enabled;

      machine.enabled = false;

      persistIfEnabled(deps);
      ctx.ui.setStatus(STATUS_KEY, machine.bottomBarText());
      if (ctx.hasUI && wasEnabled) {
        ctx.ui.notify(`TDD disengaged: ${reason}`, "info");
      }

      return {
        content: [
          {
            type: "text",
            text: `TDD disengaged. ${reason}`,
          },
        ],
        details: { engaged: false, phase: null, reason },
      };
    },
  };
}

/**
 * Apply configured lifecycle hooks for an incoming tool call. Returns true if
 * the tool call is itself one of the engagement control tools (so callers can
 * skip the regular gate).
 */
export function applyLifecycleHooks(
  toolName: string,
  deps: EngagementDeps,
  ctx: ExtensionContext
): { isControlTool: boolean; engaged?: boolean; disengaged?: boolean } {
  if (toolName === ENGAGE_TOOL_NAME || toolName === DISENGAGE_TOOL_NAME) {
    return { isControlTool: true };
  }

  const config = deps.getConfig();
  const machine = deps.machine;

  if (!config.enabled) {
    return { isControlTool: false };
  }

  if (config.engageOnTools.includes(toolName) && !machine.enabled) {
    machine.enabled = true;
    const targetPhase = config.startInSpecMode ? "SPEC" : "RED";
    if (machine.phase !== targetPhase) {
      machine.transitionTo(targetPhase, `lifecycle hook: ${toolName}`, true);
    }
    persistIfEnabled(deps);
    ctx.ui.setStatus(STATUS_KEY, machine.bottomBarText());
    if (ctx.hasUI) {
      ctx.ui.notify(`TDD engaged in ${targetPhase} (via ${toolName})`, "info");
    }
    return { isControlTool: false, engaged: true };
  }

  if (config.disengageOnTools.includes(toolName) && machine.enabled) {
    machine.enabled = false;
    persistIfEnabled(deps);
    ctx.ui.setStatus(STATUS_KEY, machine.bottomBarText());
    if (ctx.hasUI) {
      ctx.ui.notify(`TDD disengaged (via ${toolName})`, "info");
    }
    return { isControlTool: false, disengaged: true };
  }

  return { isControlTool: false };
}
