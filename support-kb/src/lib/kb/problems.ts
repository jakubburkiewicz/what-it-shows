// The problems inside one merged ticket, counted the way the desk counts them.
// causes.ts decides parser vs hint from the tenant (never from intake's guess) and the desk counts
// a report where it is filed. The desk notes (desk-notes.json) name reports that describe a different
// symptom: a date moved by one day, not a month and day swapped. That is a problem of its own; its
// reports stay counted under the cause they are filed under, and are counted again here.
import { causeOf, uniqueById, type Report, type Tenant } from '#lib/kb/causes';

export type Problem = 'parser' | 'hint' | 'one-day' | 'unplaced';
export const PROBLEMS: readonly Problem[] = ['parser', 'hint', 'one-day', 'unplaced'];

// The problems a report belongs to: its cause, plus `one-day` when the desk notes read it that way.
export function problemsOf(r: Report, t: Tenant | undefined, oneDay: readonly string[]): Problem[] {
  const own: Problem[] = [causeOf(r, t) ?? 'unplaced'];
  return oneDay.includes(r.id) ? [...own, 'one-day'] : own;
}

export type ProblemGroup = {
  problem: Problem;
  reports: Report[];
  tenants: string[];
  channels: Record<string, number>;
  firstSeen: string;
  lastSeen: string;
};

export function problemsIn(
  reports: Report[],
  ticket: number,
  tenantOf: (r: Report) => Tenant | undefined,
  oneDay: readonly string[],
): { merged: number; groups: ProblemGroup[] } {
  const merged = uniqueById(reports).filter((r) => r.mergedInto === ticket);
  const groups = PROBLEMS.flatMap((problem) => {
    const rs = merged.filter((r) => problemsOf(r, tenantOf(r), oneDay).includes(problem));
    if (rs.length === 0) return [];
    const days = rs.map((r) => r.receivedAt.slice(0, 10)).sort();
    return [
      {
        problem,
        reports: rs,
        tenants: [...new Set(rs.map((r) => r.tenant))].sort(),
        channels: rs.reduce<Record<string, number>>((n, r) => ({ ...n, [r.channel]: (n[r.channel] ?? 0) + 1 }), {}),
        firstSeen: days[0],
        lastSeen: days[days.length - 1],
      },
    ];
  });
  return { merged: merged.length, groups };
}
