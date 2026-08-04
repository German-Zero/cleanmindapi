import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    const datasourceUrl = configureSupavisor(process.env.DATABASE_URL);
    super(datasourceUrl ? { datasourceUrl } : undefined);
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}

export function configureSupavisor(databaseUrl?: string): string | undefined {
  if (!databaseUrl) return undefined;

  const url = new URL(databaseUrl);
  const isTransactionPooler =
    url.port === '6543' && url.hostname.endsWith('.pooler.supabase.com');

  if (isTransactionPooler) url.searchParams.set('pgbouncer', 'true');

  return url.toString();
}
