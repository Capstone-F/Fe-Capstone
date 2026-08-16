import { describe, it, expect } from "vitest";
import { fetchAllPages } from "./paged-fetch";

describe("fetchAllPages", () => {
  it("should fetch all items when total is below cap", async () => {
    const PAGE_SIZE = 100;
    const CAP = 500;
    let requestCount = 0;

    const fetcher = async (page: number) => {
      requestCount += 1;
      const start = (page - 1) * PAGE_SIZE;
      const pageTotal = 250;
      const items = Array.from(
        { length: Math.min(PAGE_SIZE, Math.max(0, pageTotal - start)) },
        (_, i) => ({ id: start + i }),
      );
      return { items, total: pageTotal };
    };

    const result = await fetchAllPages(fetcher, PAGE_SIZE, CAP);

    expect(requestCount).toBe(3);
    expect(result.items).toHaveLength(250);
    expect(result.truncated).toBe(false);
    expect(result.cap).toBe(CAP);
  });

  it("should cap items and mark truncated when total exceeds cap", async () => {
    const PAGE_SIZE = 100;
    const CAP = 500;
    let requestCount = 0;

    const fetcher = async (page: number) => {
      requestCount += 1;
      const start = (page - 1) * PAGE_SIZE;
      const pageTotal = 1200;
      const items = Array.from(
        { length: Math.min(PAGE_SIZE, Math.max(0, pageTotal - start)) },
        (_, i) => ({ id: start + i }),
      );
      return { items, total: pageTotal };
    };

    const result = await fetchAllPages(fetcher, PAGE_SIZE, CAP);

    expect(requestCount).toBe(5);
    expect(result.items).toHaveLength(500);
    expect(result.truncated).toBe(true);
    expect(result.cap).toBe(CAP);
  });

  it("should mark truncated when empty page arrives before reaching total", async () => {
    const PAGE_SIZE = 100;
    const CAP = 500;
    let requestCount = 0;

    const fetcher = async (page: number) => {
      requestCount += 1;
      if (page <= 2) {
        const start = (page - 1) * PAGE_SIZE;
        const items = Array.from({ length: PAGE_SIZE }, (_, i) => ({
          id: start + i,
        }));
        return { items, total: 250 };
      }
      // Page 3 returns empty even though total claims 250 rows
      return { items: [], total: 250 };
    };

    const result = await fetchAllPages(fetcher, PAGE_SIZE, CAP);

    expect(requestCount).toBe(3);
    expect(result.items).toHaveLength(200);
    expect(result.truncated).toBe(true);
    expect(result.cap).toBe(CAP);
  });

  it("should not mark truncated when total exactly equals cap with full pages", async () => {
    const PAGE_SIZE = 100;
    const CAP = 500;
    let requestCount = 0;

    const fetcher = async (page: number) => {
      requestCount += 1;
      const start = (page - 1) * PAGE_SIZE;
      const pageTotal = 500;
      const items = Array.from(
        { length: Math.min(PAGE_SIZE, Math.max(0, pageTotal - start)) },
        (_, i) => ({ id: start + i }),
      );
      return { items, total: pageTotal };
    };

    const result = await fetchAllPages(fetcher, PAGE_SIZE, CAP);

    expect(requestCount).toBe(5);
    expect(result.items).toHaveLength(500);
    expect(result.truncated).toBe(false);
    expect(result.cap).toBe(CAP);
  });
});
