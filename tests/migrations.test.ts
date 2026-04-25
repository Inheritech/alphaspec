import { describe, it, expect } from 'vitest';
import { planMigrations, MIGRATIONS } from '../src/lib/migrations';

describe('planMigrations', () => {
  it('returns the 0.3.0 migration when upgrading from 0.2.0', () => {
    const plan = planMigrations('0.2.0', '0.3.0');
    expect(plan).toHaveLength(1);
    expect(plan[0].to).toBe('0.3.0');
  });

  it('returns the 0.3.0 migration when upgrading from a missing version (treated as 0.0.0)', () => {
    const plan = planMigrations('0.0.0', '0.3.0');
    expect(plan).toHaveLength(1);
    expect(plan[0].to).toBe('0.3.0');
  });

  it('returns nothing when already on the current version', () => {
    expect(planMigrations('0.3.0', '0.3.0')).toEqual([]);
  });

  it('returns nothing when target version is below the migration target', () => {
    expect(planMigrations('0.1.0', '0.2.0')).toEqual([]);
  });

  it('does not include migrations targeted above the current version', () => {
    const plan = planMigrations('0.2.0', '0.2.5');
    expect(plan).toEqual([]);
  });

  it('handles unparseable version strings as 0.0.0', () => {
    const plan = planMigrations('garbage', '0.3.0');
    expect(plan).toHaveLength(1);
  });

  it('migrations registry is ordered ascending by `to`', () => {
    for (let i = 1; i < MIGRATIONS.length; i++) {
      const a = MIGRATIONS[i - 1].to.split('.').map(Number);
      const b = MIGRATIONS[i].to.split('.').map(Number);
      const cmp = a[0] - b[0] || a[1] - b[1] || a[2] - b[2];
      expect(cmp).toBeLessThanOrEqual(0);
    }
  });
});
