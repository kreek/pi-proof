import { type ExtensionAPI, type ExtensionContext, isToolCallEventType } from "@mariozechner/pi-coding-agent";
import { Type } from "@sinclair/typebox";

import { createTddController } from "./tdd-controller.js";

export default function tddExtension(pi: ExtensionAPI) {
  const controller = createTddController();
  const toggleProof = async (_args: unknown, ctx: ExtensionContext) => {
    if (controller.getPhase() === "off") await controller.enable(ctx);
    else controller.disable(ctx);
  };

  pi.registerCommand("proof", {
    description: "Toggle proof-first mode (specifying-implementing-refactoring)",
    handler: toggleProof,
  });

  pi.registerTool({
    name: "proof_start",
    label: "Proof Start",
    description:
      "Enable proof-first mode." +
      " Call this before writing production code when the intended behavior should be made explicit" +
      " in tests before changing implementation.",
    parameters: Type.Object({}),
    async execute(_toolCallId, _params, _signal, _onUpdate, ctx) {
      const msg = await controller.enable(ctx);
      return { content: [{ type: "text", text: msg }], details: {} };
    },
  });

  pi.registerTool({
    name: "proof_done",
    label: "Proof Done",
    description: "End proof-first mode. Call this when the current change is complete and all tests pass.",
    parameters: Type.Object({}),
    async execute(_toolCallId, _params, _signal, _onUpdate, ctx) {
      const msg = controller.disable(ctx);
      return { content: [{ type: "text", text: msg }], details: {} };
    },
  });

  pi.registerCommand("tdd", {
    description: "Legacy alias for /proof",
    handler: toggleProof,
  });

  pi.registerTool({
    name: "tdd_start",
    label: "TDD Start (Legacy)",
    description: "Legacy alias for proof_start. Prefer proof_start.",
    parameters: Type.Object({}),
    async execute(_toolCallId, _params, _signal, _onUpdate, ctx) {
      const msg = await controller.enable(ctx);
      return { content: [{ type: "text", text: msg }], details: {} };
    },
  });

  pi.registerTool({
    name: "tdd_done",
    label: "TDD Done (Legacy)",
    description: "Legacy alias for proof_done. Prefer proof_done.",
    parameters: Type.Object({}),
    async execute(_toolCallId, _params, _signal, _onUpdate, ctx) {
      const msg = controller.disable(ctx);
      return { content: [{ type: "text", text: msg }], details: {} };
    },
  });

  pi.on("tool_call", async (event, ctx) => {
    let filePath: string | undefined;
    if (isToolCallEventType("write", event)) filePath = event.input.path;
    else if (isToolCallEventType("edit", event)) filePath = event.input.path;
    if (!filePath) return undefined;
    return controller.handleProductionWrite(filePath, ctx);
  });

  pi.on("tool_result", async (event, ctx) => controller.handleFileToolResult(event, ctx));
  pi.on("tool_result", async (event, ctx) => controller.handleShellWriteWarning(event, ctx));
  pi.on("tool_result", async (event, ctx) => controller.handleManualTestRun(event, ctx));
  pi.on("turn_start", async (_event, ctx) => controller.handleTurnStart(ctx));
  pi.on("before_agent_start", async (event) => ({ systemPrompt: controller.buildSystemPrompt(event.systemPrompt) }));
}
