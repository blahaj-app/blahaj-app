import { z } from "zod";

export const InternalGlobalDataSearchParamsSchema = z.object({
  item: z.string(),
});

export type InternalGlobalDataSearchParams = z.infer<typeof InternalGlobalDataSearchParamsSchema>;
