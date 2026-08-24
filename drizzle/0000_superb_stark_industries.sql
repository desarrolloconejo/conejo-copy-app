CREATE TABLE `auditRules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerId` int NOT NULL,
	`clientId` int,
	`sector` varchar(120),
	`label` varchar(120) NOT NULL,
	`maxSpokenWords` int NOT NULL DEFAULT 12,
	`maxOverlayWords` int NOT NULL DEFAULT 6,
	`requireProof` boolean NOT NULL DEFAULT true,
	`preambles` text NOT NULL,
	`tiredPhrases` text NOT NULL,
	`tensionTerms` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `auditRules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `clients` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerId` int NOT NULL,
	`name` varchar(120) NOT NULL,
	`sector` varchar(120) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `clients_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `copyRecords` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerId` int NOT NULL,
	`clientId` int NOT NULL,
	`objective` varchar(40) NOT NULL,
	`platform` varchar(40) NOT NULL,
	`audience` text NOT NULL,
	`tension` text NOT NULL,
	`spoken` text NOT NULL,
	`overlay` text NOT NULL,
	`proof` text NOT NULL,
	`firstFrame` text NOT NULL,
	`cta` text NOT NULL,
	`auditScore` int NOT NULL,
	`primaryMetric` varchar(80) NOT NULL,
	`status` enum('draft','published','analyzed') NOT NULL DEFAULT 'draft',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `copyRecords_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `copyResults` (
	`id` int AUTO_INCREMENT NOT NULL,
	`copyRecordId` int NOT NULL,
	`impressions` int NOT NULL DEFAULT 0,
	`threeSecondViews` int NOT NULL DEFAULT 0,
	`saves` int NOT NULL DEFAULT 0,
	`shares` int NOT NULL DEFAULT 0,
	`clicks` int NOT NULL DEFAULT 0,
	`conversions` int NOT NULL DEFAULT 0,
	`learning` text,
	`observedAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `copyResults_id` PRIMARY KEY(`id`),
	CONSTRAINT `copyResults_copyRecordId_unique` UNIQUE(`copyRecordId`)
);
--> statement-breakpoint
CREATE TABLE `trendReferences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerId` int NOT NULL,
	`spoken` text NOT NULL,
	`insertTitle` varchar(250),
	`platform` varchar(40) NOT NULL,
	`territory` varchar(60) NOT NULL,
	`sourceUrl` varchar(1000),
	`insight` text NOT NULL,
	`tags` varchar(500) NOT NULL DEFAULT '',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `trendReferences_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320) NOT NULL,
	`passwordHash` varchar(255) NOT NULL,
	`name` varchar(160) NOT NULL,
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`isActive` boolean NOT NULL DEFAULT true,
	`mustChangePassword` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
ALTER TABLE `auditRules` ADD CONSTRAINT `auditRules_ownerId_users_id_fk` FOREIGN KEY (`ownerId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `auditRules` ADD CONSTRAINT `auditRules_clientId_clients_id_fk` FOREIGN KEY (`clientId`) REFERENCES `clients`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `clients` ADD CONSTRAINT `clients_ownerId_users_id_fk` FOREIGN KEY (`ownerId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `copyRecords` ADD CONSTRAINT `copyRecords_ownerId_users_id_fk` FOREIGN KEY (`ownerId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `copyRecords` ADD CONSTRAINT `copyRecords_clientId_clients_id_fk` FOREIGN KEY (`clientId`) REFERENCES `clients`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `copyResults` ADD CONSTRAINT `copyResults_copyRecordId_copyRecords_id_fk` FOREIGN KEY (`copyRecordId`) REFERENCES `copyRecords`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `trendReferences` ADD CONSTRAINT `trendReferences_ownerId_users_id_fk` FOREIGN KEY (`ownerId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;