import { drizzle, tables, Items, sql } from "@blahaj-app/database";
import { IkeaResponse } from "./ikea-response";

function toUnixTime(date: string) {
  return Math.floor(new Date(date).getTime() / 1000);
}

function getCurrentDay() {
  return Math.floor(Date.now() / 1000 / 60 / 60 / 24);
}

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
  const db = drizzle(env.DB);

  const [stores, articleIDs] = await Promise.all([db.select(tables.stores).all(), db.select(tables.articleIDs).all()]);

  const countries = stores
    .map(({ country }) => country)
    .filter((c, i, a) => a.indexOf(c) === i)
    .map((country) => {
      const articles = articleIDs.filter((a) => a.country === country);

      return {
        code: country,
        articleIDs: {
          [Items.BLAHAJ]: articles.find((a) => a.type === "blahaj")?.articleID ?? null,
          [Items.SMOLHAJ]: articles.find((a) => a.type === "smolhaj")?.articleID ?? null,
        },
        stores: stores.filter((s) => s.country === country),
      };
    });

  const promises = countries.map(({ code, articleIDs, stores }) =>
    Promise.all([
      articleIDs[Items.BLAHAJ] ? checkIkeaStock(code, articleIDs[Items.BLAHAJ]) : null,
      articleIDs[Items.SMOLHAJ] ? checkIkeaStock(code, articleIDs[Items.SMOLHAJ]) : null,
    ])
      .then(([blahaj, smolhaj]) => ({
        [Items.BLAHAJ]: blahaj,
        [Items.SMOLHAJ]: smolhaj,
      }))
      .then((data) => {
        const insertStock = db.insert(tables.stockRecords).values;
        const stockValues: Parameters<typeof insertStock>[0][] = [];

        const insertRestock = db.insert(tables.restocks).values;
        const restockValues: Parameters<typeof insertRestock>[0][] = [];

        for (const store of stores) {
          for (const item of Object.values(Items)) {
            const itemData = data[item]?.[store.id];

            if (itemData?.stock) {
              stockValues.push({
                storeId: store.id,
                type: item,
                quantity: itemData.stock.quantity,
                time: toUnixTime(itemData.stock.time),
                day: getCurrentDay(),
              });
            }

            if (itemData?.restocks) {
              restockValues.push(
                ...itemData.restocks.map((restock) => ({
                  storeId: store.id,
                  type: item,
                  quantity: restock.quantity,
                  earliest: toUnixTime(restock.earliest),
                  latest: toUnixTime(restock.latest),
                  time: toUnixTime(restock.time),
                })),
              );
            }
          }
        }

        return [stockValues, restockValues] as const;
      }),
  );

  const everything = Promise.all(promises).then((values) => {
    const stockValues = values.map(([stock]) => stock).flat();
    const restockValues = values.map(([, restock]) => restock).flat();

    return Promise.all([
      stockValues.length > 0
        ? db
            .insert(tables.stockRecords)
            .values(...stockValues)
            .onConflictDoUpdate({
              set: { quantity: sql`excluded.quantity` },
              target: [tables.stockRecords.storeId, tables.stockRecords.type, tables.stockRecords.day],
            })
            .run()
        : null,

      db
        .delete(tables.restocks)
        .run()
        .then(() =>
          restockValues.length > 0
            ? db
                .insert(tables.restocks)
                .values(...restockValues)
                .run()
            : null,
        ),
      // eslint-disable-next-line @typescript-eslint/no-empty-function
    ]).then(() => {});
  });

  ctx.waitUntil(everything);
}

export default { scheduled: handleCron };
