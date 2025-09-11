import { foreignKey } from 'drizzle-orm/mysql-core';
import { timestamp } from 'drizzle-orm/mysql-core';
import { date, index, int, varchar } from 'drizzle-orm/mysql-core';
import { mysqlTable } from 'drizzle-orm/mysql-core';

export const applicantDataTable = mysqlTable(
  'applicant_data',
  {
    id: varchar('id', { length: 36 }).primaryKey(), // UUID
    nama_lengkap: varchar('nama_lengkap', { length: 64 }).notNull(),
    jenis_kelamin: varchar('jenis_kelamin', { length: 1 }).notNull(), // L or P
    tempat_lahir: varchar('tempat_lahir', { length: 64 }).notNull(),
    tanggal_lahir: date('tanggal_lahir').notNull(),
    usia: int('usia').notNull(),
    daerah_lahir: varchar('daerah_lahir', { length: 64 }).notNull(),
    provinsi_lahir: varchar('provinsi_lahir', { length: 64 }).notNull(),
    tinggi_badan: int('tinggi_badan').notNull(),
    berat_badan: int('berat_badan').notNull(),
    nik: varchar('nik', { length: 16 }).notNull(),
    daerah_domisili: varchar('daerah_domisili', { length: 64 }).notNull(),
    provinsi_domisili: varchar('provinsi_domisili', { length: 64 }).notNull(),
    kota_domisili: varchar('kota_domisili', { length: 64 }).notNull(),
    alamat_domisili: varchar('alamat_domisili', { length: 255 }).notNull(),
    program_terpilih: varchar('program_terpilih', { length: 64 }).notNull(),
    batch_id: varchar('batch_id', { length: 36 }).notNull(),
    created_at: timestamp('created_at').notNull().defaultNow(),
    updated_at: timestamp('updated_at').notNull().defaultNow(),
    deleted_at: timestamp('deleted_at'),
  },
  (table) => [
    foreignKey({
      name: 'fk_applicant_data_batch_id',
      columns: [table.batch_id],
      foreignColumns: [batchTable.id],
    }),
    index('idx_applicant_data_batch_id').on(table.batch_id),
  ]
);

export const batchTable = mysqlTable('batch', {
  id: varchar('id', { length: 36 }).primaryKey(), // UUID
  number: int('number').notNull(),
  number_code: varchar('number_code', { length: 64 }).notNull(),
  location: varchar('location', { length: 64 }).notNull(),
  location_code: varchar('location_code', { length: 64 }).notNull(),
  year: int('year').notNull(),
  status: int('status').notNull().default(1), // 0: inactive, 1: active
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
  deleted_at: timestamp('deleted_at'),
});
