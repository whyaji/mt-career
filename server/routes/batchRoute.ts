import { eq } from 'drizzle-orm';
import { Hono } from 'hono';

import { db } from '../db/database';
import { batchTable } from '../db/schema/schema';
import { BatchStatus } from '../enum/batchStatus.enum';
import { logger } from '../lib/logger';

export const batchRoute = new Hono().get('/active', async (c) => {
  try {
    const batches = await db
      .select({
        id: batchTable.id,
        number: batchTable.number,
        number_code: batchTable.number_code,
        location: batchTable.location,
        location_code: batchTable.location_code,
        year: batchTable.year,
      })
      .from(batchTable)
      .where(eq(batchTable.status, BatchStatus.ACTIVE));
    return c.json({ success: true, data: batches }, 200);
  } catch (error) {
    logger.error(`Error getting active batches: ${error}`);
    return c.json({ success: false, error: 'INTERNAL_SERVER_ERROR' }, 500);
  }
});
