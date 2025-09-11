import { zValidator } from '@hono/zod-validator';
import { randomUUIDv7 } from 'bun';
import { Hono } from 'hono';

import { db } from '../db/database';
import { applicantDataTable } from '../db/schema/schema';
import { logger } from '../lib/logger';
import { zodApplicantDataPost } from '../types/applicantData.type';

export const formRoute = new Hono().post(
  '/',
  zValidator('json', zodApplicantDataPost),
  async (c) => {
    try {
      const body = c.req.valid('json');
      // remove agreements from body to match ApplicantDataPostType
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { agreement1, agreement2, agreement3, ...applicantData } = body;
      // validate body from type ApplicantDataPostType
      await db.insert(applicantDataTable).values({
        id: randomUUIDv7(),
        ...applicantData,
        tanggal_lahir: new Date(applicantData.tanggal_lahir),
      });
      return c.json({ message: 'Form submitted successfully' }, 201);
    } catch (error) {
      logger.error(`Error handling form submission: ${error}`);
      return c.json({ error: 'Internal Server Error' }, 500);
    }
  }
);
