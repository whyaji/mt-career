import { zValidator } from '@hono/zod-validator';
import { randomUUIDv7 } from 'bun';
import { and, eq } from 'drizzle-orm';
import { Hono } from 'hono';

import { db } from '../db/database';
import { applicantDataTable } from '../db/schema/schema';
import { logger } from '../lib/logger';
import { containsSuspiciousPatterns, sanitizeText, verifyTurnstileToken } from '../lib/security';
import { ApplicantDataPostType, zodApplicantDataPost } from '../types/applicantData.type';

export const formRoute = new Hono().post(
  '/',
  zValidator('json', zodApplicantDataPost),
  async (c) => {
    try {
      const body = c.req.valid('json');

      // Verify Turnstile token
      const clientIP = c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown';
      const turnstileValid = await verifyTurnstileToken(body.turnstileToken, clientIP);

      if (!turnstileValid) {
        logger.warn(`Turnstile verification failed from IP: ${clientIP}`);
        return c.json({ error: 'TURNSTILE_FAILED', message: 'Security verification failed' }, 400);
      }

      // check pkpp need to be in this list
      const validPrograms = ['pkpp-estate', 'pkpp-ktu', 'pkpp-mill'];
      if (!validPrograms.includes(body.program_terpilih)) {
        logger.warn(`Invalid program selected from IP: ${clientIP}`);
        return c.json({ error: 'INVALID_PROGRAM', message: 'Invalid program selected' }, 400);
      }

      // Additional security checks
      const textFields = [
        body.nama_lengkap,
        body.alamat_domisili,
        body.kota_domisili,
        body.daerah_domisili,
        body.provinsi_domisili,
        body.tempat_lahir,
        body.daerah_lahir,
        body.provinsi_lahir,
        body.program_terpilih,
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
      const sanitizedBody: ApplicantDataPostType = {
        ...body,
        program_terpilih: sanitizeText(body.program_terpilih),
        nama_lengkap: sanitizeText(body.nama_lengkap.toUpperCase()),
        daerah_lahir: sanitizeText(body.daerah_lahir.toUpperCase()),
        provinsi_lahir: sanitizeText(body.provinsi_lahir.toUpperCase()),
        tempat_lahir: sanitizeText(body.tempat_lahir.toUpperCase()),
        alamat_domisili: sanitizeText(body.alamat_domisili.toUpperCase()),
        kota_domisili: sanitizeText(body.kota_domisili.toUpperCase()),
        daerah_domisili: sanitizeText(body.daerah_domisili.toUpperCase()),
        provinsi_domisili: sanitizeText(body.provinsi_domisili.toUpperCase()),
      };

      // remove agreements and turnstileToken from body to match ApplicantDataPostType
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { agreement1, agreement2, agreement3, turnstileToken, ...applicantData } =
        sanitizedBody;

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
