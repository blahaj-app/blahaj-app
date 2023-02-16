import type { AwaitedReturn, LoaderArgs } from "apps/site/app/util";
import { deserializeLoader, getDatabase } from "apps/site/app/util";
import { subDays } from "date-fns";
import moize from "moize";
import { getSearchParams } from "remix-params-helper";
import { $path } from "remix-routes";
import { typedjson } from "remix-typedjson";
import { z } from "zod";

const SearchParamsSchema = z.object({
  item: z.string(),
});

export type SearchParams = z.infer<typeof SearchParamsSchema>;

export const getGlobalDataServer = async (item: string, db: ReturnType<typeof getDatabase>) => {
  const [stocks, allRestocks] = await Promise.all([
    db
      .selectFrom("stock")
      .select(["store_id", "quantity", "reported_at"])
      .distinctOn(["store_id", "type"])
      .where("type", "=", item)
      .where("created_at", ">", subDays(new Date(), 2))
      .orderBy("store_id")
      .orderBy("type")
      .orderBy("created_at", "desc")
      .$assertType<{ store_id: string; quantity: number; reported_at: Date }>()
      .execute(),
    db
      .selectFrom("restock")
      .select(["store_id", "quantity", "reported_at", "earliest", "latest"])
      .where("type", "=", item)
      .orderBy("earliest", "desc")
      .$assertType<{ store_id: string; quantity: number; reported_at: Date; earliest: Date; latest: Date }>()
      .execute(),
  ]);

  return { stocks, allRestocks };
};

export const getGlobalDataClient = moize.promise(
  async (item: string) => {
    const res = await fetch($path("/internal/globaldata", { item }));
    if (!res.ok) return null;
    const data = await res.json<AwaitedReturn<typeof loader>>();

    return deserializeLoader<typeof loader>(data).globalData;
  },
  { maxSize: 5 },
);

export const loader = async ({ context, request }: LoaderArgs) => {
  const db = getDatabase(context.DATABASE_URL);

  const result = getSearchParams(request, SearchParamsSchema);

  if (!result.success) {
    throw new Response("Bad Request", { status: 400 });
  }

  const { item } = result.data;

  const globalData = await getGlobalDataServer(item, db);

  return typedjson({ globalData });
};
