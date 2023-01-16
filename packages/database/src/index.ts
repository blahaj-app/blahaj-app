import { int, real, sqliteTable, text, uniqueIndex } from "drizzle-orm-sqlite";

export const stores = sqliteTable("stores", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  country: text("country").notNull(),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
});

export const articleIDs = sqliteTable("article_ids", {
  country: text("country").primaryKey(),
  type: text("type").notNull(),
  articleID: text("article_id").notNull(),
});

export const stockRecords = sqliteTable(
  "stock_records",
  {
    id: int("id").primaryKey(),
    storeId: text("store_id").notNull(),
    type: text("type").notNull(),
    quantity: int("quantity"),
    time: int("timestamp").notNull(),
    day: int("day").notNull(),
  },
  (table) => ({
    onePerDay: uniqueIndex("idx_one_per_day").on(table.storeId, table.type, table.day),
  }),
);

export const restocks = sqliteTable("restocks", {
  id: int("id").primaryKey(),
  storeId: text("store_id").notNull(),
  type: text("type").notNull(),
  quantity: int("quantity").notNull(),
  earliest: int("earliest").notNull(),
  latest: int("latest").notNull(),
  time: int("timestamp").notNull(),
});

export enum Items {
  BLAHAJ = "blahaj",
  SMOLHAJ = "smolhaj",
}

export const tables = { stores, articleIDs, stockRecords, restocks };
export { drizzle } from "drizzle-orm-sqlite/d1";
export { sql } from "drizzle-orm";
