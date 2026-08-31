import { describe, expect, it } from "vitest";
import { isNoShowWeightValid } from "./cancellation-policy-validation";

describe("isNoShowWeightValid", () => {
  it("allows noShowWeight equal to cancelLimit", () => {
    expect(isNoShowWeightValid(5, 5)).toBe(true);
  });

  it("allows noShowWeight below cancelLimit", () => {
    expect(isNoShowWeightValid(10, 3)).toBe(true);
  });

  it("rejects noShowWeight above cancelLimit", () => {
    expect(isNoShowWeightValid(3, 10)).toBe(false);
  });
});
