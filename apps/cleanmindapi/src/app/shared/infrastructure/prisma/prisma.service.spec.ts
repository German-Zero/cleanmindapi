import { configureSupavisor } from './prisma.service';

describe('configureSupavisor', () => {
  it('enables Prisma compatibility for the Supabase transaction pooler', () => {
    const configured = configureSupavisor(
      'postgresql://user:password@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?sslmode=require',
    );
    const url = new URL(configured ?? '');

    expect(url.searchParams.get('pgbouncer')).toBe('true');
    expect(url.searchParams.get('sslmode')).toBe('require');
  });

  it('leaves the session pooler unchanged', () => {
    const original =
      'postgresql://user:password@aws-0-sa-east-1.pooler.supabase.com:5432/postgres';

    expect(configureSupavisor(original)).toBe(original);
  });

  it('allows Prisma to use its declared datasource without an environment URL', () => {
    expect(configureSupavisor()).toBeUndefined();
  });
});
