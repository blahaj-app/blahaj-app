import { Item } from "@blahaj-app/static";
import { z } from "zod";

export const InternalOembedSearchParamsSchema = z.union([
  z.object({
    type: z.literal("map_global"),
    item: z.nativeEnum(Item),
  }),
  z.object({
    type: z.literal("map_store"),
    storeId: z.string(),
    item: z.nativeEnum(Item),
  }),
  z.object<Record<string, never>>({}),
]);

export type InternalOembedSearchParams = z.infer<typeof InternalOembedSearchParamsSchema>;
