import { z } from "zod";

export const InternalStockHistorySearchParamsSchema = z.object({
  storeId: z.string(),
  item: z.string(),
});

export type InternalStockHistorySearchParams = z.infer<typeof InternalStockHistorySearchParamsSchema>;
