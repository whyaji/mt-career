import { and, eq } from 'drizzle-orm';
import { Hono } from 'hono';

import { db } from '../db/database';
import { batchTable } from '../db/schema/schema';
import { BatchStatus } from '../enum/batchStatus.enum';

export const verficationRoute = new Hono().get('/path/:batchLocation/:batchNumber', async (c) => {
  try {
    const { batchNumber, batchLocation } = c.req.param();
    if (!batchNumber || !batchLocation) {
      return c.json({ success: false, error: 'BATCH_NUMBER_AND_BATCH_LOCATION_ARE_REQUIRED' }, 400);
    }
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
      .where(
        and(
          eq(batchTable.number_code, batchNumber.toUpperCase()),
          eq(batchTable.location_code, batchLocation.toUpperCase()),
          eq(batchTable.status, BatchStatus.ACTIVE)
        )
      )
      .limit(1);
    const batchData = batches[0];
    if (!batchData) {
      return c.json({ success: false, error: 'BATCH_NOT_FOUND' }, 404);
    }
    return c.json({ success: true, data: batchData });
  } catch {
    return c.json({ success: false, error: 'INTERNAL_SERVER_ERROR' }, 500);
  }
});
