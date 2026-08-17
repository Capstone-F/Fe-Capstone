import type { BoundedFetchResult } from "../types/finance.types";

interface PagedResponse<T> {
  items: T[];
  total: number;
}

/**
 * WHAT: Fetches every page of a paginated endpoint, up to a hard row cap.
 * WHY: Neither /admin/clinic-withdrawals nor /admin/order-cancellations supports
 *      date filtering, so period totals require the whole set. The fetcher is
 *      injected so this logic is testable without network or React.
 */
export async function fetchAllPages<T>(
  fetchPage: (page: number) => Promise<PagedResponse<T>>,
  pageSize: number,
  cap: number,
): Promise<BoundedFetchResult<T>> {
  const maxPages = Math.ceil(cap / pageSize);
  const items: T[] = [];
  let total = 0;

  for (let page = 1; page <= maxPages; page += 1) {
    const response = await fetchPage(page);
    total = response.total;
    // Guard against a server that reports a total it cannot page through.
    if (response.items.length === 0) break;
    items.push(...response.items);
    if (items.length >= total) break;
  }

  const collected = items.slice(0, cap);
  return {
    items: collected,
    // True when the server claims more rows than we actually hold — whether
    // because the cap stopped us or because paging ended early.
    truncated: total > cap || collected.length < total,
    cap,
  };
}
