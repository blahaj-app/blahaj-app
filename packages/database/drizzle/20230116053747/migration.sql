ALTER TABLE stock_records ADD `day` integer NOT NULL;
CREATE UNIQUE INDEX idx_one_per_day ON stock_records (`store_id`,`type`,`day`);