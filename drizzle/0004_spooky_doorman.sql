CREATE TABLE `learning_certificates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`learning_path_id` int NOT NULL,
	`certificate_code` varchar(100) NOT NULL,
	`title` varchar(255) NOT NULL,
	`issue_date` timestamp NOT NULL DEFAULT (now()),
	`expiry_date` timestamp,
	`certificate_url` varchar(512),
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `learning_certificates_id` PRIMARY KEY(`id`),
	CONSTRAINT `learning_certificates_certificate_code_unique` UNIQUE(`certificate_code`)
);
--> statement-breakpoint
CREATE TABLE `learning_paths` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`level` enum('beginner','intermediate','advanced') NOT NULL,
	`duration` varchar(100),
	`target_audience` varchar(255),
	`content_ids` json,
	`learning_objectives` json,
	`assessment_type` enum('quiz','essay','project','discussion'),
	`certificate_eligible` boolean DEFAULT true,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `learning_paths_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `literature_assessments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`learning_path_id` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`assessment_type` enum('quiz','essay','project','discussion') NOT NULL,
	`questions` json,
	`passing_score` decimal(5,2) DEFAULT '70',
	`time_limit` int,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `literature_assessments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `literature_content` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`content_type` enum('kural','story','poem','essay','lesson') NOT NULL,
	`category` varchar(100) NOT NULL,
	`tamil_text` text NOT NULL,
	`english_translation` text NOT NULL,
	`tanglish_transliteration` text,
	`meaning` text,
	`cultural_context` text,
	`author` varchar(255),
	`period` varchar(100),
	`audio_url` varchar(512),
	`difficulty` enum('beginner','intermediate','advanced') DEFAULT 'beginner',
	`tags` json,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `literature_content_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_assessment_results` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`assessment_id` int NOT NULL,
	`responses` json,
	`score` decimal(5,2) NOT NULL,
	`passed` boolean NOT NULL,
	`feedback` text,
	`time_spent` int DEFAULT 0,
	`metadata` json,
	`submitted_at` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `user_assessment_results_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_learning_progress` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`learning_path_id` int NOT NULL,
	`content_id` int NOT NULL,
	`status` enum('not_started','in_progress','completed','reviewed') DEFAULT 'not_started',
	`score` decimal(5,2),
	`time_spent` int DEFAULT 0,
	`notes` text,
	`bookmarked` boolean DEFAULT false,
	`completed_at` timestamp,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_learning_progress_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `user_id_idx` ON `learning_certificates` (`user_id`);--> statement-breakpoint
CREATE INDEX `learning_path_id_idx` ON `learning_certificates` (`learning_path_id`);--> statement-breakpoint
CREATE INDEX `level_idx` ON `learning_paths` (`level`);--> statement-breakpoint
CREATE INDEX `learning_path_id_idx` ON `literature_assessments` (`learning_path_id`);--> statement-breakpoint
CREATE INDEX `category_idx` ON `literature_content` (`category`);--> statement-breakpoint
CREATE INDEX `content_type_idx` ON `literature_content` (`content_type`);--> statement-breakpoint
CREATE INDEX `difficulty_idx` ON `literature_content` (`difficulty`);--> statement-breakpoint
CREATE INDEX `user_id_idx` ON `user_assessment_results` (`user_id`);--> statement-breakpoint
CREATE INDEX `assessment_id_idx` ON `user_assessment_results` (`assessment_id`);--> statement-breakpoint
CREATE INDEX `user_id_idx` ON `user_learning_progress` (`user_id`);--> statement-breakpoint
CREATE INDEX `learning_path_id_idx` ON `user_learning_progress` (`learning_path_id`);--> statement-breakpoint
CREATE INDEX `content_id_idx` ON `user_learning_progress` (`content_id`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `user_learning_progress` (`status`);