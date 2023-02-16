import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable("stock")
    .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("store_id", "text", (col) => col.notNull())
    .addColumn("type", "text", (col) => col.notNull())
    .addColumn("quantity", "integer", (col) => col.notNull())
    .addColumn("reported_at", "timestamp", (col) => col.notNull())
    .addColumn("created_at", "date", (col) => col.notNull().defaultTo(sql`now()`))
    .addUniqueConstraint("stock_store_id_type_created_at_unique", ["store_id", "type", "created_at"])
    .execute();

  await db.schema
    .createTable("restock")
    .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("store_id", "text", (col) => col.notNull())
    .addColumn("type", "text", (col) => col.notNull())
    .addColumn("quantity", "integer", (col) => col.notNull())
    .addColumn("earliest", "timestamp", (col) => col.notNull())
    .addColumn("latest", "timestamp", (col) => col.notNull())
    .addColumn("reported_at", "timestamp", (col) => col.notNull())
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("stock").execute();
  await db.schema.dropTable("restock").execute();
}
