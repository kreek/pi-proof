import { describe, expect, it, vi } from "vitest";
import { handleTddCommand, splitCommandArgs } from "../src/commands.ts";
import { PhaseStateMachine } from "../src/phase.ts";

function createCommandContext() {
  return {
    ui: {
      notify: vi.fn(),
      setStatus: vi.fn(),
    },
  } as never;
}

describe("splitCommandArgs", () => {
  it("handles quoted and unquoted segments", () => {
    expect(splitCommandArgs('"a b" c')).toEqual(["a b", "c"]);
  });

  it("handles escaped spaces", () => {
    expect(splitCommandArgs(String.raw`a\ b c`)).toEqual(["a b", "c"]);
  });
});

describe("handleTddCommand", () => {
  it("does not mark a normal SPEC to RED transition as an override", async () => {
    const machine = new PhaseStateMachine({ phase: "SPEC", plan: ["first criterion"] });
    const publish = vi.fn();

    await handleTddCommand("red", machine, createCommandContext(), publish);

    expect(machine.getHistory()).toHaveLength(1);
    expect(machine.getHistory()[0]?.override).toBe(false);
  });

  it("marks a non-sequential phase jump as an override", async () => {
    const machine = new PhaseStateMachine({ phase: "SPEC" });
    const publish = vi.fn();

    await handleTddCommand("green", machine, createCommandContext(), publish);

    expect(machine.getHistory()).toHaveLength(1);
    expect(machine.getHistory()[0]?.override).toBe(true);
  });
});
