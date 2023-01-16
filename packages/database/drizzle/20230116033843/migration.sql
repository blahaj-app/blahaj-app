CREATE TABLE article_ids (
	`country` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`article_id` text NOT NULL
);

CREATE TABLE restocks (
	`id` integer PRIMARY KEY NOT NULL,
	`store_id` text NOT NULL,
	`type` text NOT NULL,
	`quantity` integer NOT NULL,
	`earliest` integer NOT NULL,
	`latest` integer NOT NULL,
	`timestamp` integer NOT NULL
);

CREATE TABLE stock_records (
	`id` integer PRIMARY KEY NOT NULL,
	`store_id` text NOT NULL,
	`type` text NOT NULL,
	`quantity` integer,
	`timestamp` integer NOT NULL
);

CREATE TABLE stores (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`country` text NOT NULL,
	`latitude` real NOT NULL,
	`longitude` real NOT NULL
);
