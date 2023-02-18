import { z } from "zod";

const InternalGlobalDataSearchParamsSchema = z.object({
  item: z.string(),
});

export type InternalGlobalDataSearchParams = z.infer<typeof InternalGlobalDataSearchParamsSchema>;
