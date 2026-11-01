// The problems inside one merged ticket, counted once each.
// causes.ts decides parser vs hint from the tenant (never from intake's guess). The desk notes
// (desk-notes.json) name reports that describe a different symptom: a date moved by one day,
// not a month and day swapped. Those are their own problem, so they leave the cause they were filed under.
import { causeOf, uniqueById, type Cause, type Report, type Tenant } from '#lib/kb/causes';

export type Problem = Cause | 'one-day' | 'unplaced';
export const PROBLEMS: readonly Problem[] = ['parser', 'hint', 'one-day', 'unplaced'];

export function problemOf(r: Report, t: Tenant | undefined, oneDay: readonly string[]): Problem {
  if (oneDay.includes(r.id)) return 'one-day';
  return causeOf(r, t) ?? 'unplaced';
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
    const rs = merged.filter((r) => problemOf(r, tenantOf(r), oneDay) === problem);
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
