declare module "routes-gen" {
  export type RouteParams = {
    "/internal/stockhistory": Record<string, never>;
    "/:item/map/:storeId?": { item: string; storeId?: string };
    "/embed/oembed.json": Record<string, never>;
    "/internal/globaldata": Record<string, never>;
    "/embed/og.png": Record<string, never>;
    "/": Record<string, never>;
  };

  export function route<
    T extends
      | ["/internal/stockhistory"]
      | ["/:item/map/:storeId?", RouteParams["/:item/map/:storeId?"]]
      | ["/embed/oembed.json"]
      | ["/internal/globaldata"]
      | ["/embed/og.png"]
      | ["/"],
  >(...args: T): (typeof args)[0];
}
