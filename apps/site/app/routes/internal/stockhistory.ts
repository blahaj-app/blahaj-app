import type { AwaitedReturn, LoaderArgs } from "apps/site/app/util";
import { deserializeLoader, getDatabase } from "apps/site/app/util";
import { subDays } from "date-fns";
import moize from "moize";
import { getSearchParams } from "remix-params-helper";
import { $path } from "remix-routes";
import { typedjson } from "remix-typedjson";
import { z } from "zod";

const SearchParamsSchema = z.object({
  storeId: z.string(),
  item: z.string(),
});

export type SearchParams = z.infer<typeof SearchParamsSchema>;

export const getStockHistoryServer = async (item: string, storeId: string, db: ReturnType<typeof getDatabase>) =>
  db
    .selectFrom("stock")
    .select(["quantity", "reported_at"])
    .where("store_id", "=", storeId)
    .where("type", "=", item)
    .where("created_at", ">", subDays(new Date(), 90))
    .orderBy("created_at", "asc")
    .$assertType<{ quantity: number; reported_at: Date }>()
    .execute();

export const getStockHistoryClient = moize.promise(
  async (item: string, storeId: string) => {
    const res = await fetch($path("/internal/stockhistory", { item, storeId }));
    if (!res.ok) return null;
    const data = await res.json<AwaitedReturn<typeof loader>>();

    return deserializeLoader<typeof loader>(data).history;
  },
  { maxSize: 1000 },
);

export const loader = async ({ context, request }: LoaderArgs) => {
  const db = getDatabase(context.DATABASE_URL);

  const result = getSearchParams(request, SearchParamsSchema);

  if (!result.success) {
    throw new Response("Bad Request", { status: 400 });
  }

  const { item, storeId } = result.data;

  const history = await getStockHistoryServer(item, storeId, db);

  return typedjson({ history });
};
