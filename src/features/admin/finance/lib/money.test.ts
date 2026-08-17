import { describe, expect, it } from "vitest";
import { parseVnd, sumVnd } from "./money";

describe("parseVnd", () => {
  it("parses a bigint string as returned by /admin/clinic-withdrawals", () => {
    expect(parseVnd("45000")).toBe(45000);
  });

  it("passes a number through unchanged", () => {
    expect(parseVnd(45000)).toBe(45000);
  });

  it("treats null and undefined as zero", () => {
    expect(parseVnd(null)).toBe(0);
    expect(parseVnd(undefined)).toBe(0);
  });

  it("treats unparseable input as zero rather than NaN", () => {
    expect(parseVnd("abc")).toBe(0);
  });

  it("treats an empty string as zero", () => {
    expect(parseVnd("")).toBe(0);
  });
});

describe("sumVnd", () => {
  it("sums a mixed list of string and number amounts", () => {
    const rows = [
      { amountVnd: "1000" },
      { amountVnd: 2000 },
      { amountVnd: null },
    ];
    expect(sumVnd(rows, (row) => row.amountVnd)).toBe(3000);
  });

  it("returns zero for an empty list", () => {
    expect(sumVnd([], (row: { amountVnd: string }) => row.amountVnd)).toBe(0);
  });
});
