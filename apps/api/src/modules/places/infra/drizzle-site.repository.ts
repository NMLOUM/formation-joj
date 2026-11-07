import { Inject, Injectable } from '@nestjs/common';
import { asc, eq } from 'drizzle-orm';
import type { Database } from '../../../core/database/database';
import { DATABASE } from '../../../core/database/database.module';
import { SiteRepository } from '../application/site.repository';
import type { Site } from '../domain/site';
import { sites } from './places.schema';
import { toDomain } from './site.mapper';

@Injectable()
export class DrizzleSiteRepository extends SiteRepository {
  constructor(@Inject(DATABASE) private readonly db: Database) {
    super();
  }

  async findById(id: string): Promise<Site | null> {
    const [row] = await this.db.select().from(sites).where(eq(sites.id, id)).limit(1);
    return row ? toDomain(row) : null;
  }

  async list(): Promise<Site[]> {
    const rows = await this.db.select().from(sites).orderBy(asc(sites.name));
    return rows.map(toDomain);
  }
}
