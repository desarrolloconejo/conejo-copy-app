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
ALTER TABLE `trendReferences` ADD CONSTRAINT `trendReferences_ownerId_users_id_fk` FOREIGN KEY (`ownerId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;