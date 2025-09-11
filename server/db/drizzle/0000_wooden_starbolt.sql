CREATE TABLE `applicant_data` (
	`id` varchar(36) NOT NULL,
	`nama_lengkap` varchar(64) NOT NULL,
	`jenis_kelamin` varchar(1) NOT NULL,
	`tempat_lahir` varchar(64) NOT NULL,
	`tanggal_lahir` date NOT NULL,
	`usia` int NOT NULL,
	`daerah_lahir` varchar(64) NOT NULL,
	`provinsi_lahir` varchar(64) NOT NULL,
	`tinggi_badan` int NOT NULL,
	`berat_badan` int NOT NULL,
	`nik` varchar(16) NOT NULL,
	`daerah_domisili` varchar(64) NOT NULL,
	`provinsi_domisili` varchar(64) NOT NULL,
	`kota_domisili` varchar(64) NOT NULL,
	`alamat_domisili` varchar(255) NOT NULL,
	`program_terpilih` varchar(64) NOT NULL,
	`batch_id` varchar(36) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	`deleted_at` timestamp,
	CONSTRAINT `applicant_data_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `batch` (
	`id` varchar(36) NOT NULL,
	`number` int NOT NULL,
	`number_code` varchar(64) NOT NULL,
	`location` varchar(64) NOT NULL,
	`location_code` varchar(64) NOT NULL,
	`year` int NOT NULL,
	`status` int NOT NULL DEFAULT 1,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	`deleted_at` timestamp,
	CONSTRAINT `batch_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `applicant_data` ADD CONSTRAINT `fk_applicant_data_batch_id` FOREIGN KEY (`batch_id`) REFERENCES `batch`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `idx_applicant_data_batch_id` ON `applicant_data` (`batch_id`);