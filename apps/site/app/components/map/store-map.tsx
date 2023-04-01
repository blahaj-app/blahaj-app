import type { Item } from "@blahaj-app/static";
import { ALL_STORES } from "@blahaj-app/static";
import { Box } from "@chakra-ui/react";
import useResizeObserver from "@react-hook/resize-observer";
import { useNavigate } from "@remix-run/react";
import eases from "eases";
import type { MapLayerEventType } from "mapbox-gl";
import { useEffect, useMemo, useRef } from "react";
import type { FC } from "react";
import type { LayerProps, MapRef, SourceProps } from "react-map-gl";
import { GeolocateControl, Layer, Map as MapboxGL, NavigationControl, Source } from "react-map-gl";
import { $path } from "remix-routes";
import { throttle } from "throttle-debounce";
import { useUpdateEffect } from "usehooks-ts";
import { useGlobalDataQuery, useMapContext } from "../../routes/$item/map";
import { getStockStatus, stockStyles } from "../../stock-status";
import findStore from "../../utils/find-store";
import noop from "../../utils/noop";
import ItemSelector from "./item-selector";

const StoreMap: FC = () => {
  const {
    params,
    loaderData,
    storeBasicsHeightState: [storeBasicsHeight],
  } = useMapContext();

  const { data: globalData } = useGlobalDataQuery(params.item as Item, loaderData?.globalData);

  const navigate = useNavigate();

  const mapRef = useRef() as React.MutableRefObject<MapRef>;

  const PIN_PREFIX = "pin-";
  const MARKERS_LAYER_ID = "markers";

  const markersLayerStyle: LayerProps = {
    id: MARKERS_LAYER_ID,
    type: "symbol",
    layout: {
      "icon-image": ["get", "pin"],
      "icon-size": ["interpolate", ["linear"], ["zoom"], 4, 0.2, 10, 0.325],
      "icon-anchor": "bottom",
      "icon-allow-overlap": true,
    },
  };

  const markersLayerSource: SourceProps = useMemo(
    () => ({
      id: "markers",
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features: ALL_STORES.map((store) => {
          const stock = globalData?.stocks.find((stock) => stock.store_id === store.id);
          const restocks = globalData?.allRestocks.filter((restock) => restock.store_id === store.id);

          return {
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [store.longitude, store.latitude],
            },
            properties: { storeId: store.id, pin: PIN_PREFIX + getStockStatus(stock, restocks) },
          };
        }),
      },
    }),
    [globalData],
  );

  const flyToStore = (storeId: string) => {
    const map = mapRef.current;

    if (!map) return;

    const store = findStore(storeId);

    if (!store) return;

    map.flyTo({
      center: [store.longitude, store.latitude],
      zoom: Math.max(10, map.getZoom()),
      screenSpeed: 1.75,
      easing: eases.sineInOut,
    });
  };

  useUpdateEffect(() => {
    if (params?.storeId) {
      flyToStore(params.storeId);
    }
  }, [params?.storeId]);

  const onPinClicked = useRef<(e: MapLayerEventType["click"]) => void>(noop);

  useEffect(() => {
    onPinClicked.current = (e) => {
      const feature = e.features?.[0];
      if (!feature) return;

      // @ts-expect-error custom property
      const storeId = feature.properties.storeId;
      if (!(typeof storeId === "string" && storeId)) return;

      if (params.storeId === storeId) {
        flyToStore(storeId);
      } else {
        navigate($path("/:item/map/:storeId", { item: params.item, storeId }, {}), { preventScrollReset: true });
      }
    };
  }, [navigate, params.item, params.storeId]);

  const onMapLoad = () => {
    const map = mapRef.current;
    const canvas = map.getCanvas();

    const setPointer = (set: boolean) => (canvas.style.cursor = set ? "pointer" : "");

    map.on("mouseenter", MARKERS_LAYER_ID, () => {
      setPointer(true);
    });

    map.on("mouseleave", MARKERS_LAYER_ID, () => {
      setPointer(false);
    });

    map.on("click", MARKERS_LAYER_ID, (e) => onPinClicked.current(e));

    Object.entries(stockStyles).forEach(([status, style]) => {
      const icon = new Image(27 * 4.25, 41 * 4.25);
      icon.onload = () => map.addImage(PIN_PREFIX + status, icon);
      icon.src = style.pin;
    });
  };

  const mapContainerRef = useRef<HTMLDivElement>(null);

  const resizeMap = throttle(1000 / 60, (ref: MapRef) => requestIdleCallback(() => ref.resize()));

  useResizeObserver(mapContainerRef, () => {
    if (!mapRef.current) return;
    resizeMap(mapRef.current);
  });

  const focusedStore = params?.storeId ? findStore(params.storeId) : undefined;

  return (
    <Box
      width="100%"
      height={{
        base: storeBasicsHeight ? `calc(100vh - 19.25rem - var(--store-basics-height))` : "calc(100vh - 25rem)",
        md: "unset",
      }}
      flexGrow={{ base: "unset", md: "1" }}
      ref={mapContainerRef}
      position="relative"
    >
      <ItemSelector />
      <MapboxGL
        reuseMaps
        ref={mapRef}
        onLoad={onMapLoad}
        initialViewState={
          focusedStore
            ? { longitude: focusedStore.longitude, latitude: focusedStore.latitude, zoom: 10 }
            : loaderData?.location
            ? { ...loaderData?.location, zoom: 7.5 }
            : { latitude: 37.5, longitude: 6, zoom: 2 }
        }
        minZoom={1.75}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        mapboxAccessToken={__mapboxToken__}
      >
        <NavigationControl />
        <GeolocateControl />
        <Source {...markersLayerSource}>
          <Layer {...markersLayerStyle} />
        </Source>
      </MapboxGL>
    </Box>
  );
};

export default StoreMap;
