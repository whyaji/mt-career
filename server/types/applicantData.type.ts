import z from 'zod';

export type ApplicantDataType = {
  id: string;
  nama_lengkap: string;
  jenis_kelamin: string;
  tempat_lahir: string;
  tanggal_lahir: string;
  usia: number;
  daerah_lahir: string;
  provinsi_lahir: string;
  tinggi_badan: number;
  berat_badan: number;
  nik: string;
  daerah_domisili: string;
  provinsi_domisili: string;
  kota_domisili: string;
  alamat_domisili: string;
  program_terpilih: string;
  batch_id: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type ApplicantDataPostType = Omit<
  ApplicantDataType,
  'id' | 'created_at' | 'updated_at' | 'deleted_at'
> & { agreement1: string; agreement2: string; agreement3: string; turnstileToken: string };

export const zodApplicantDataPost = z.object({
  nama_lengkap: z.string().min(1),
  jenis_kelamin: z.string().min(1),
  tempat_lahir: z.string().min(1),
  tanggal_lahir: z.string().min(1),
  usia: z.number().min(0),
  daerah_lahir: z.string().min(1),
  provinsi_lahir: z.string().min(1),
  tinggi_badan: z.number().min(0),
  berat_badan: z.number().min(0),
  nik: z.string().min(16).max(16),
  daerah_domisili: z.string().min(1),
  provinsi_domisili: z.string().min(1),
  kota_domisili: z.string().min(1),
  alamat_domisili: z.string().min(1),
  program_terpilih: z.string().min(1),
  batch_id: z.string().min(1),
  agreement1: z.string().min(1),
  agreement2: z.string().min(1),
  agreement3: z.string().min(1),
  turnstileToken: z.string().min(1),
});
