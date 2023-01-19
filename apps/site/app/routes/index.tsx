import { drizzle, tables } from "@blahaj-app/database";
import { Box } from "@chakra-ui/react";
import type { LoaderArgs } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import type { FC } from "react";

export const loader = async ({ context, params, request }: LoaderArgs) => {
  const db = drizzle(context.DB as D1Database);

  return json(await db.select(tables.stores).all());
};

const Index: FC = () => {
  const data = useLoaderData<typeof loader>();

  return (
    <Box background="red.100">
      <code>
        <pre>{data.length}</pre>
      </code>
    </Box>
  );
};
export default Index;
