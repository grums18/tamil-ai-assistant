CREATE TABLE `audio_recordings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`conversation_id` int,
	`file_name` varchar(255) NOT NULL,
	`file_url` varchar(512) NOT NULL,
	`file_size` int,
	`duration` decimal(8,2),
	`language` enum('tamil','tanglish','english','mixed') DEFAULT 'tamil',
	`transcription` text,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `audio_recordings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `conversations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`title` varchar(255),
	`topic` varchar(255),
	`language` enum('tamil','tanglish','mixed') DEFAULT 'tamil',
	`message_count` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `conversations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `creator_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`channel_name` varchar(255),
	`channel_description` text,
	`channel_url` varchar(512),
	`content_category` varchar(100),
	`preferred_language` enum('tamil','tanglish','mixed') DEFAULT 'tamil',
	`voice_preference` varchar(100),
	`content_style` text,
	`target_audience` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `creator_profiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `creator_profiles_user_id_unique` UNIQUE(`user_id`)
);
--> statement-breakpoint
CREATE TABLE `generated_content` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`conversation_id` int,
	`content_type` enum('script','thumbnail_ideas','seo_title','seo_description','trend_insight') NOT NULL,
	`topic` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`language` enum('tamil','tanglish','mixed') DEFAULT 'tamil',
	`quality` decimal(3,2),
	`file_url` varchar(512),
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `generated_content_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`conversation_id` int NOT NULL,
	`user_id` int NOT NULL,
	`role` enum('user','assistant') NOT NULL,
	`content` text NOT NULL,
	`language` enum('tamil','tanglish','english','mixed') DEFAULT 'tamil',
	`audio_url` varchar(512),
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `rag_documents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`language` enum('tamil','tanglish','english','mixed') DEFAULT 'tamil',
	`source` varchar(255),
	`category` varchar(100),
	`embedding` json,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `rag_documents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `trends` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`category` varchar(100),
	`view_count` int,
	`engagement_score` decimal(8,2),
	`language` enum('tamil','tanglish','mixed') DEFAULT 'tamil',
	`source` varchar(100),
	`source_url` varchar(512),
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`expires_at` timestamp,
	CONSTRAINT `trends_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `usage_analytics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`feature_name` varchar(100) NOT NULL,
	`usage_count` int DEFAULT 1,
	`total_tokens_used` int DEFAULT 0,
	`average_response_time` decimal(10,2),
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `usage_analytics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `user_id_idx` ON `audio_recordings` (`user_id`);--> statement-breakpoint
CREATE INDEX `user_id_idx` ON `conversations` (`user_id`);--> statement-breakpoint
CREATE INDEX `user_id_idx` ON `generated_content` (`user_id`);--> statement-breakpoint
CREATE INDEX `content_type_idx` ON `generated_content` (`content_type`);--> statement-breakpoint
CREATE INDEX `conversation_id_idx` ON `messages` (`conversation_id`);--> statement-breakpoint
CREATE INDEX `user_id_idx` ON `messages` (`user_id`);--> statement-breakpoint
CREATE INDEX `category_idx` ON `rag_documents` (`category`);--> statement-breakpoint
CREATE INDEX `category_idx` ON `trends` (`category`);--> statement-breakpoint
CREATE INDEX `created_at_idx` ON `trends` (`createdAt`);--> statement-breakpoint
CREATE INDEX `user_id_idx` ON `usage_analytics` (`user_id`);--> statement-breakpoint
CREATE INDEX `feature_name_idx` ON `usage_analytics` (`feature_name`);