import type {
  DateRangeQuery,
  HistoryDay,
} from "../types/routine-tracking.types";

/** Add deltaDays to a YYYY-MM-DD string. UTC-based so the device timezone never shifts it. */
export function shiftIsoDate(date: string, deltaDays: number): string {
  const cursor = new Date(`${date}T00:00:00.000Z`);
  cursor.setUTCDate(cursor.getUTCDate() + deltaDays);
  return cursor.toISOString().slice(0, 10);
}

/** Inclusive range of `days` calendar days ending at (and including) endDate. */
export function buildRangeEndingAt(
  endDate: string,
  days: number,
): DateRangeQuery {
  return { from: shiftIsoDate(endDate, -(days - 1)), to: endDate };
}

/** Monday-first index (0 = Monday ... 6 = Sunday) for a YYYY-MM-DD string. */
function mondayFirstWeekday(date: string): number {
  return (new Date(`${date}T00:00:00.000Z`).getUTCDay() + 6) % 7;
}

/**
 * Group history days into Monday-first weeks, padding the first week with nulls
 * so the calendar grid lines up. Backend omits days before routine activation,
 * so gaps inside the range are expected and rendered as empty cells.
 */
export function buildCalendarWeeks(
  days: HistoryDay[],
): Array<Array<HistoryDay | null>> {
  if (days.length === 0) {
    return [];
  }
  const byDate = new Map(days.map((day) => [day.date, day]));
  const first = days[0].date;
  const last = days[days.length - 1].date;

  const weeks: Array<Array<HistoryDay | null>> = [];
  let current: Array<HistoryDay | null> = Array.from(
    { length: mondayFirstWeekday(first) },
    () => null,
  );

  let cursor = first;
  while (cursor <= last) {
    current.push(byDate.get(cursor) ?? null);
    if (current.length === 7) {
      weeks.push(current);
      current = [];
    }
    cursor = shiftIsoDate(cursor, 1);
  }
  if (current.length > 0) {
    while (current.length < 7) {
      current.push(null);
    }
    weeks.push(current);
  }
  return weeks;
}
