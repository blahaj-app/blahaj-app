import type { ColumnType } from "kysely";

export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;

export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export interface Restock {
  id: Generated<string>;
  store_id: string;
  type: string;
  quantity: number;
  earliest: Timestamp;
  latest: Timestamp;
  reported_at: Timestamp;
}

export interface Stock {
  id: Generated<string>;
  store_id: string;
  type: string;
  quantity: number;
  reported_at: Timestamp;
  created_at: Generated<Timestamp>;
}

export interface DB {
  restock: Restock;
  stock: Stock;
}
