CREATE TABLE `collaboration_activity` (
	`id` int AUTO_INCREMENT NOT NULL,
	`project_id` int NOT NULL,
	`user_id` int NOT NULL,
	`activity_type` enum('document_created','document_edited','document_deleted','comment_added','comment_resolved','member_joined','member_left','member_role_changed','document_locked','document_unlocked') NOT NULL,
	`target_id` int,
	`description` text,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `collaboration_activity_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `collaboration_projects` (
	`id` int AUTO_INCREMENT NOT NULL,
	`creator_id` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`status` enum('active','archived','completed') DEFAULT 'active',
	`visibility` enum('private','team','public') DEFAULT 'private',
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `collaboration_projects_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `document_comments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`document_id` int NOT NULL,
	`user_id` int NOT NULL,
	`content` text NOT NULL,
	`line_number` int,
	`char_offset` int,
	`resolved` boolean DEFAULT false,
	`resolved_by` int,
	`resolved_at` timestamp,
	`replies` json,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `document_comments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `document_versions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`document_id` int NOT NULL,
	`version` int NOT NULL,
	`content` text NOT NULL,
	`edited_by` int NOT NULL,
	`changes_summary` text,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `document_versions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `project_members` (
	`id` int AUTO_INCREMENT NOT NULL,
	`project_id` int NOT NULL,
	`user_id` int NOT NULL,
	`role` enum('owner','editor','viewer','commenter') DEFAULT 'editor',
	`joined_at` timestamp NOT NULL DEFAULT (now()),
	`permissions` json,
	`metadata` json,
	CONSTRAINT `project_members_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `shared_documents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`project_id` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`document_type` enum('script','outline','notes','brainstorm') NOT NULL,
	`content` text NOT NULL,
	`language` enum('tamil','tanglish','mixed') DEFAULT 'tamil',
	`current_version` int DEFAULT 1,
	`last_edited_by` int,
	`last_edited_at` timestamp,
	`is_locked` boolean DEFAULT false,
	`locked_by` int,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `shared_documents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `youtube_analytics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`channel_id` varchar(255) NOT NULL,
	`video_id` varchar(255),
	`views` int DEFAULT 0,
	`likes` int DEFAULT 0,
	`comments` int DEFAULT 0,
	`shares` int DEFAULT 0,
	`watch_time` int DEFAULT 0,
	`average_view_duration` decimal(5,2) DEFAULT '0',
	`click_through_rate` decimal(5,2) DEFAULT '0',
	`subscribers` int DEFAULT 0,
	`subscriber_growth` int DEFAULT 0,
	`audience_demographics` json,
	`traffic_sources` json,
	`top_videos` json,
	`metrics_date` timestamp NOT NULL,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `youtube_analytics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `project_id_idx` ON `collaboration_activity` (`project_id`);--> statement-breakpoint
CREATE INDEX `user_id_idx` ON `collaboration_activity` (`user_id`);--> statement-breakpoint
CREATE INDEX `activity_type_idx` ON `collaboration_activity` (`activity_type`);--> statement-breakpoint
CREATE INDEX `creator_id_idx` ON `collaboration_projects` (`creator_id`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `collaboration_projects` (`status`);--> statement-breakpoint
CREATE INDEX `document_id_idx` ON `document_comments` (`document_id`);--> statement-breakpoint
CREATE INDEX `user_id_idx` ON `document_comments` (`user_id`);--> statement-breakpoint
CREATE INDEX `resolved_idx` ON `document_comments` (`resolved`);--> statement-breakpoint
CREATE INDEX `document_id_idx` ON `document_versions` (`document_id`);--> statement-breakpoint
CREATE INDEX `version_idx` ON `document_versions` (`version`);--> statement-breakpoint
CREATE INDEX `project_id_idx` ON `project_members` (`project_id`);--> statement-breakpoint
CREATE INDEX `user_id_idx` ON `project_members` (`user_id`);--> statement-breakpoint
CREATE INDEX `project_id_idx` ON `shared_documents` (`project_id`);--> statement-breakpoint
CREATE INDEX `document_type_idx` ON `shared_documents` (`document_type`);--> statement-breakpoint
CREATE INDEX `user_id_idx` ON `youtube_analytics` (`user_id`);--> statement-breakpoint
CREATE INDEX `channel_id_idx` ON `youtube_analytics` (`channel_id`);--> statement-breakpoint
CREATE INDEX `metrics_date_idx` ON `youtube_analytics` (`metrics_date`);