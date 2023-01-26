import { ALL_STORES, ARTICLE_IDS } from "@blahaj-app/data";
import type { DB, Restock, Stock } from "@blahaj-app/newdb";
import { Pool } from "@neondatabase/serverless";
import { Insertable, Kysely, PostgresDialect, sql } from "kysely";
import { IkeaResponse } from "./ikea-response";

async function checkIkeaStock(country: string, articleID: string) {
  const res = await fetch(
    `https://api.ingka.ikea.com/cia/availabilities/ru/${country}?` +
      new URLSearchParams({ expand: "StoresList,Restocks", itemNos: articleID }),
    { headers: { "x-client-id": "b6c117e5-ae61-4ef5-b4cc-e0b1e37f0631" } },
  );

  if (!res.ok) {
    return null;
  }

  try {
    const { data } = await res.json<IkeaResponse>();

    return Object.fromEntries(
      data.map((a) => {
        const stock = a.availableStocks?.find((s) => s.type === "CASHCARRY");
        const restocks = stock?.restocks ?? [];

        return [
          a.classUnitKey.classUnitCode,
          {
            stock: stock ? { quantity: stock.quantity, time: stock.updateDateTime } : null,
            restocks: restocks.map((r) => ({
              quantity: r.quantity,
              earliest: r.earliestDate,
              latest: r.latestDate,
              time: r.updateDateTime,
            })),
          },
        ] as const;
      }),
    );
  } catch {
    return null;
  }
}

async function handleCron(event: ScheduledController, env: Bindings, ctx: ExecutionContext) {
  const db = new Kysely<DB>({
    dialect: new PostgresDialect({
      pool: new Pool({ connectionString: env.DATABASE_URL }),
    }),
  });

  const promises = Promise.all(
    ALL_STORES.map(({ country }) => country)
      .filter((c, i, a) => a.indexOf(c) === i)
      .map((country) =>
        Promise.all(
          Object.entries(ARTICLE_IDS[country] ?? {})
            .filter((tuple): tuple is [string, string] => tuple[1] !== null)
            .map(async ([item, articleId]) => [item, await checkIkeaStock(country, articleId)] as const),
        ).then((data) => {
          const stocks: Insertable<Stock>[] = [];
          let restocks: Insertable<Restock>[] = [];

          for (const store of ALL_STORES.filter((s) => s.country === country)) {
            for (const [item, itemData] of data) {
              const storeItemData = itemData?.[store.id];

              if (storeItemData?.stock) {
                stocks.push({
                  store_id: store.id,
                  type: item,
                  quantity: storeItemData.stock.quantity,
                  reported_at: new Date(storeItemData.stock.time),
                });
              }

              if (storeItemData?.restocks) {
                restocks = restocks.concat(
                  storeItemData.restocks.map((restock) => ({
                    store_id: store.id,
                    type: item,
                    quantity: restock.quantity,
                    earliest: new Date(restock.earliest),
                    latest: new Date(restock.latest),
                    reported_at: new Date(restock.time),
                  })),
                );
              }
            }
          }

          return [stocks, restocks] as const;
        }),
      ),
  )
    .then((values) => [values.map(([stock]) => stock).flat(), values.map(([, restock]) => restock).flat()] as const)
    .then(async ([stocks, restocks]) => {
      await Promise.all([
        db
          .insertInto("stock")
          .values(stocks)
          .onConflict((oc) =>
            oc.columns(["store_id", "type", "created_at"]).doUpdateSet({
              quantity: sql`EXCLUDED.quantity`,
              reported_at: sql`EXCLUDED.reported_at`,
            }),
          )
          .execute(),
        db
          .deleteFrom("restock")
          .execute()
          .then(() => db.insertInto("restock").values(restocks).execute()),
      ]);
    });

  ctx.waitUntil(promises);
}

export default { scheduled: handleCron };
