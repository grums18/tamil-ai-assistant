CREATE TABLE `publishing_jobs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`scheduled_content_id` int NOT NULL,
	`user_id` int NOT NULL,
	`platform` enum('youtube','instagram','tiktok','twitter') NOT NULL,
	`status` enum('pending','processing','success','failed','retrying') DEFAULT 'pending',
	`platform_job_id` varchar(255),
	`platform_url` varchar(512),
	`error_message` text,
	`retry_count` int DEFAULT 0,
	`max_retries` int DEFAULT 3,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`completed_at` timestamp,
	CONSTRAINT `publishing_jobs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `scheduled_content` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`content_id` int,
	`title` varchar(255) NOT NULL,
	`description` text,
	`content` text NOT NULL,
	`content_type` enum('video','short','post','reel') NOT NULL,
	`language` enum('tamil','tanglish','mixed') DEFAULT 'tamil',
	`platforms` json,
	`scheduled_at` timestamp NOT NULL,
	`status` enum('draft','scheduled','published','failed','cancelled') DEFAULT 'draft',
	`video_url` varchar(512),
	`thumbnail_url` varchar(512),
	`tags` json,
	`hashtags` json,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`published_at` timestamp,
	CONSTRAINT `scheduled_content_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `social_media_integrations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`youtube_access_token` text,
	`youtube_refresh_token` text,
	`youtube_channel_id` varchar(255),
	`instagram_access_token` text,
	`instagram_business_account_id` varchar(255),
	`tiktok_access_token` text,
	`tiktok_user_id` varchar(255),
	`twitter_access_token` text,
	`twitter_access_token_secret` text,
	`twitter_user_id` varchar(255),
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `social_media_integrations_id` PRIMARY KEY(`id`),
	CONSTRAINT `social_media_integrations_user_id_unique` UNIQUE(`user_id`)
);
--> statement-breakpoint
CREATE INDEX `scheduled_content_id_idx` ON `publishing_jobs` (`scheduled_content_id`);--> statement-breakpoint
CREATE INDEX `user_id_idx` ON `publishing_jobs` (`user_id`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `publishing_jobs` (`status`);--> statement-breakpoint
CREATE INDEX `platform_idx` ON `publishing_jobs` (`platform`);--> statement-breakpoint
CREATE INDEX `user_id_idx` ON `scheduled_content` (`user_id`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `scheduled_content` (`status`);--> statement-breakpoint
CREATE INDEX `scheduled_at_idx` ON `scheduled_content` (`scheduled_at`);--> statement-breakpoint
CREATE INDEX `user_id_idx` ON `social_media_integrations` (`user_id`);