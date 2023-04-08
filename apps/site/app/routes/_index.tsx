import { Item } from "@blahaj-app/static";
import type { LoaderArgs } from "@remix-run/cloudflare";
import { redirect } from "@remix-run/cloudflare";
import { route } from "routes-gen";

export const loader = async ({ params, request, context }: LoaderArgs) => {
  return redirect(route("/:item/map/:storeId?", { item: Item.BLAHAJ }), 301);
};
