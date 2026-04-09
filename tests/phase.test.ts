import { describe, expect, it } from "vitest";
import { PhaseStateMachine } from "../src/phase.ts";

describe("PhaseStateMachine", () => {
  it("increments cycleCount only on REFACTOR to RED", () => {
    const machine = new PhaseStateMachine({ phase: "REFACTOR", cycleCount: 2 });

    machine.transitionTo("RED", "next slice");
    expect(machine.cycleCount).toBe(3);

    machine.transitionTo("GREEN", "manual");
    expect(machine.cycleCount).toBe(3);
  });

  it("reports SPEC as the next phase target for RED only through the cycle start", () => {
    const machine = new PhaseStateMachine({ phase: "SPEC" });
    expect(machine.nextPhase()).toBe("RED");
  });
});
