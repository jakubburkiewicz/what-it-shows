<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import type { Report } from '#lib/kb/causes';
  import { tenantOf } from '#lib/kb/locales';
  import { problemsIn } from '#lib/kb/problems';

  let { ticket }: { ticket: number } = $props();

  const result = $derived(problemsIn(reports as Report[], ticket, tenantOf, notes.oneDayMove));
  const channels = (c: Record<string, number>) =>
    Object.entries(c)
      .sort((a, b) => b[1] - a[1])
      .map(([name, n]) => `${name} ×${n}`)
      .join(' · ');
</script>

<p class="sum">
  <strong>{result.merged}</strong> reports in #{ticket}, counted once each ·
  <strong>{result.groups.length}</strong> problems
</p>

<table>
  <thead>
    <tr><th>problem</th><th>reports</th><th>tenants</th><th>channels</th><th>seen</th></tr>
  </thead>
  <tbody>
    {#each result.groups as g (g.problem)}
      <tr>
        <td><code>{g.problem}</code></td>
        <td>{g.reports.length}</td>
        <td>{g.tenants.length}</td>
        <td class="ch">{channels(g.channels)}</td>
        <td>{g.firstSeen} → {g.lastSeen}</td>
      </tr>
    {/each}
  </tbody>
</table>

{#each result.groups.filter((g) => g.problem === 'one-day') as g (g.problem)}
  <p class="note">
    The {g.reports.length} <code>one-day</code> reports are also filed under the cause their tenant gives them,
    so they are counted in that row too. The desk counts a report where it is filed.
  </p>
{/each}

<style>
  .sum { font-size: 1.1rem; }
  .note { color: var(--muted); font-size: 0.85em; }
  .ch { color: var(--muted); font-size: 0.85em; }
</style>
