import { Item } from "@blahaj-app/static";
import { z } from "zod";

export const EmbedOgSearchParamsSchema = z.union([
  z.object({
    type: z.literal("map_global"),
    item: z.nativeEnum(Item),
  }),
  z.object({
    type: z.literal("map_store"),
    storeId: z.string(),
    item: z.nativeEnum(Item),
  }),
]);

export type EmbedOgSearchParams = z.infer<typeof EmbedOgSearchParamsSchema>;
