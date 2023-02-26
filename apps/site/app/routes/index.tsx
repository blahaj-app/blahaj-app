import { Item } from "@blahaj-app/static";
import type { LoaderArgs } from "@remix-run/cloudflare";
import { redirect } from "@remix-run/cloudflare";
import { $path } from "remix-routes";

export const loader = async ({ params, request, context }: LoaderArgs) => {
  return redirect($path("/:item/map", { item: Item.BLAHAJ }));
};
