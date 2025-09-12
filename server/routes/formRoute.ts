import { zValidator } from '@hono/zod-validator';
import { randomUUIDv7 } from 'bun';
import { and, eq } from 'drizzle-orm';
import { Hono } from 'hono';

import { db } from '../db/database';
import { applicantDataTable } from '../db/schema/schema';
import { logger } from '../lib/logger';
import { containsSuspiciousPatterns, sanitizeText } from '../lib/security';
import { zodApplicantDataPost } from '../types/applicantData.type';

export const formRoute = new Hono().post(
  '/',
  zValidator('json', zodApplicantDataPost),
  async (c) => {
    try {
      const body = c.req.valid('json');

      // Additional security checks
      const textFields = [
        body.nama_lengkap,
        body.alamat_domisili,
        body.kota_domisili,
        body.daerah_domisili,
        body.provinsi_domisili,
      ];

      // Check for suspicious patterns
      for (const field of textFields) {
        if (field && containsSuspiciousPatterns(field)) {
          logger.warn(
            `Suspicious input detected from IP: ${c.req.header('x-forwarded-for') || 'unknown'}`
          );
          return c.json({ error: 'INVALID_INPUT', message: 'Invalid input detected' }, 400);
        }
      }

      // Sanitize text inputs
      const sanitizedBody = {
        ...body,
        nama_lengkap: sanitizeText(body.nama_lengkap),
        alamat_domisili: sanitizeText(body.alamat_domisili),
        kota_domisili: sanitizeText(body.kota_domisili),
        daerah_domisili: sanitizeText(body.daerah_domisili),
        provinsi_domisili: sanitizeText(body.provinsi_domisili),
      };

      // remove agreements from body to match ApplicantDataPostType
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { agreement1, agreement2, agreement3, ...applicantData } = sanitizedBody;

      // Check for duplicate submissions (same NIK)
      const existingSubmission = await db
        .select()
        .from(applicantDataTable)
        .where(
          and(
            eq(applicantDataTable.nik, sanitizedBody.nik),
            eq(applicantDataTable.batch_id, sanitizedBody.batch_id)
          )
        )
        .limit(1);

      if (existingSubmission.length > 0) {
        logger.warn(
          `Duplicate submission attempt from IP: ${c.req.header('x-forwarded-for') || 'unknown'}`
        );
        return c.json(
          { error: 'DUPLICATE_SUBMISSION', message: 'Duplicate submission detected' },
          409
        );
      }

      // validate body from type ApplicantDataPostType
      await db.insert(applicantDataTable).values({
        id: randomUUIDv7(),
        ...applicantData,
        tanggal_lahir: new Date(applicantData.tanggal_lahir),
      });

      logger.info(`Form submitted successfully by: ${sanitizedBody.nama_lengkap}`);
      return c.json({ message: 'Form submitted successfully' }, 201);
    } catch (error) {
      logger.error(`Error handling form submission: ${error}`);
      return c.json({ error: 'INTERNAL_SERVER_ERROR', message: 'Internal server error' }, 500);
    }
  }
);
