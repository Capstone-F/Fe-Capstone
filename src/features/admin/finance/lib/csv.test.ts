import { describe, expect, it } from "vitest";
import { toCsv } from "./csv";

describe("toCsv", () => {
  it("joins headers and rows with newlines", () => {
    expect(toCsv(["a", "b"], [[1, 2]])).toBe("a,b\n1,2");
  });

  it("quotes and escapes values containing commas or quotes", () => {
    expect(toCsv(["note"], [['say "hi", please']])).toBe(
      'note\n"say ""hi"", please"',
    );
  });

  it("renders an empty row set as headers only", () => {
    expect(toCsv(["a", "b"], [])).toBe("a,b");
  });
});
