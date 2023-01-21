CREATE TABLE article_ids (
	`country` text NOT NULL,
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
	`timestamp` integer NOT NULL,
	`day` integer NOT NULL
);

CREATE TABLE stores (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`country` text NOT NULL,
	`latitude` real NOT NULL,
	`longitude` real NOT NULL
);

CREATE UNIQUE INDEX idx_unique_article_id ON article_ids (`country`,`type`);
CREATE UNIQUE INDEX idx_one_per_day ON stock_records (`store_id`,`type`,`day`);