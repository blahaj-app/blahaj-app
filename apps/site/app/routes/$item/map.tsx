import { Flex } from "@chakra-ui/react";
import type { LoaderArgs } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import type { FC } from "react";
import MapGL from "react-map-gl";
import { $params } from "remix-routes";

export const loader = async ({ context, params, request }: LoaderArgs) => {
  const { storeId } = $params("/:item/map/:storeId", params);

  return json({ storeId: storeId as string | undefined });
};

const Map: FC = () => {
  const params = useLoaderData<typeof loader>();

  return (
    <Flex background="red.100">
      <MapGL
        initialViewState={{
          longitude: -122.4,
          latitude: 37.8,
          zoom: 14,
        }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        mapboxAccessToken=""
      />
    </Flex>
  );
};
export default Map;
