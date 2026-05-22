ALTER TABLE `api_keys` ADD COLUMN `encrypted_key` TEXT;
--> statement-breakpoint
ALTER TABLE `api_keys` ADD COLUMN `key_iv` TEXT;
--> statement-breakpoint
ALTER TABLE `api_keys` ADD COLUMN `key_auth_tag` TEXT;
