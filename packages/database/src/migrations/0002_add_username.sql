ALTER TABLE `users` ADD COLUMN `username` TEXT;
--> statement-breakpoint
UPDATE `users` SET `username` = `display_name`;
--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);
