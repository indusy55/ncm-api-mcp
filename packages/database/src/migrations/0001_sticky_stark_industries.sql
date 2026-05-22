CREATE TABLE `api_key_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`api_key_id` text NOT NULL,
	`tool_name` text NOT NULL,
	`ip_address` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`api_key_id`) REFERENCES `api_keys`(`id`) ON UPDATE no action ON DELETE cascade
);
