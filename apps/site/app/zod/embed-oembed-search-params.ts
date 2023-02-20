import { Item } from "@blahaj-app/static";
import { z } from "zod";

export const EmbedOembedSearchParamsSchema = z.union([
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

export type EmbedOembedSearchParams = z.infer<typeof EmbedOembedSearchParamsSchema>;
