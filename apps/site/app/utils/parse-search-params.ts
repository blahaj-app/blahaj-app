import type { z } from "zod";

// accept a request and zod schema, and return a result with data or errors
const parseSearchParams = <T extends z.ZodTypeAny>(
  request: Request,
  schema: T,
): z.SafeParseReturnType<T, z.infer<T>> => {
  const url = new URL(request.url);
  const params = Object.fromEntries(url.searchParams.entries());
  const result = schema.safeParse(params);
  return result;
};

export default parseSearchParams;
