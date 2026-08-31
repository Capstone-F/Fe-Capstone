import { describe, expect, it } from "vitest";
import { humanizeWarning, resolveWarnings } from "./warnings";

describe("resolveWarnings", () => {
  it("returns an empty array when warnings is undefined", () => {
    expect(resolveWarnings(undefined)).toEqual([]);
  });

  it("returns an empty array when warnings is empty", () => {
    expect(resolveWarnings([])).toEqual([]);
  });

  it("passes through non-empty warnings", () => {
    expect(resolveWarnings(["a", "b"])).toEqual(["a", "b"]);
  });
});

describe("humanizeWarning", () => {
  it("replaces known backend constant names with their UI label", () => {
    expect(
      humanizeWarning(
        "EXPERT_LATE_CANCEL_THRESHOLD_MIN (1440 phút) lớn hơn BOOKING_MIN_LEAD_TIME_MIN (120 phút)",
      ),
    ).toBe(
      "Ngưỡng hủy sát giờ (1440 phút) lớn hơn Thời gian đặt trước tối thiểu (120 phút)",
    );
  });

  it("leaves unrecognized constant-looking tokens untouched", () => {
    expect(humanizeWarning("SOME_UNKNOWN_FIELD is invalid")).toBe(
      "SOME_UNKNOWN_FIELD is invalid",
    );
  });

  it("leaves plain sentences untouched", () => {
    expect(humanizeWarning("Đây có thể là chủ đích.")).toBe(
      "Đây có thể là chủ đích.",
    );
  });
});
