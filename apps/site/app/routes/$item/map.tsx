import type { Store } from "@blahaj-app/static";
import { ALL_STORES, COUNTRY_NAMES, Item } from "@blahaj-app/static";
import { Box, Button, ButtonGroup, Flex, Heading, Link, ListItem, Spinner, UnorderedList } from "@chakra-ui/react";
import useResizeObserver from "@react-hook/resize-observer";
import { json } from "@remix-run/cloudflare";
import type { ShouldRevalidateFunction } from "@remix-run/react";
import { useNavigate, useParams } from "@remix-run/react";
import { ParentSize } from "@visx/responsive";
import { format } from "date-fns";
import eases from "eases";
import type { Transition } from "framer-motion";
import { AnimatePresence } from "framer-motion";
import type { MapLayerEventType } from "mapbox-gl";
import type { FC, PropsWithChildren } from "react";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { LayerProps, MapRef, SourceProps } from "react-map-gl";
import MapGL, { GeolocateControl, Layer, NavigationControl, Source } from "react-map-gl";
import { $params, $path } from "remix-routes";
import { typedjson, useTypedLoaderData } from "remix-typedjson";
import SimpleBar from "simplebar-react";
import { throttle } from "throttle-debounce";
import { useUpdateEffect } from "usehooks-ts";
import { MotionFlex } from "../../components/motion-flex";
import type { StockChartDatum } from "../../components/stock-history-chart";
import Test from "../../components/stock-history-chart";
import { useLayoutContext } from "../../layout";
import { StockStatus, getStockStatus, stockStyles } from "../../stock-status";
import type { LoaderArgs, SetStateType } from "../../util";
import { definedOrEmptyArray, getDatabase, noop } from "../../util";
import { getGlobalDataClient, getGlobalDataServer } from "../internal/globaldata";
import { getStockHistoryClient, getStockHistoryServer } from "../internal/stockhistory";

export const shouldRevalidate: ShouldRevalidateFunction = ({ currentParams, nextParams }) => {
  currentParams = $params("/:item/map/:storeId", currentParams);
  nextParams = $params("/:item/map/:storeId", nextParams);

  const revalidate = false;

  return revalidate;
};

export const loader = async ({ context, params: rawParams, request }: LoaderArgs) => {
  const params = $params("/:item/map/:storeId", rawParams);
  const db = getDatabase(context.DATABASE_URL);

  if (!Object.values(Item).includes(rawParams.item as Item)) {
    throw json(null, { status: 404 });
  }

  const [globalData, history] = await Promise.all([
    getGlobalDataServer(params.item, db),
    ...definedOrEmptyArray(params.storeId ? getStockHistoryServer(params.item, params.storeId, db) : undefined),
  ]);

  return typedjson({
    globalData,
    history,
    ...(request.cf?.country && request.cf.country !== "T1" && request.cf.longitude && request.cf.latitude
      ? { location: { latitude: parseFloat(request.cf.latitude), longitude: parseFloat(request.cf.longitude) } }
      : {}),
  });
};

type FocusedStoreData = {
  id: string;
  store: Store;
  stock: { store_id: string; quantity: number; reported_at: Date } | undefined;
  restocks: { store_id: string; quantity: number; reported_at: Date; earliest: Date; latest: Date }[];
  status: StockStatus;
  formatted: { stockReportedAt: string | null; nextRestockRange: string | null };
} | null;

interface MapContextType {
  currentItem: string;
  loaderHistory: StockChartDatum[] | undefined;
  focusedStoreData: FocusedStoreData;
  storeBasicsHeight: number | undefined;
  setStoreBasicsHeight: SetStateType<number | undefined>;
}

export const MapContext = createContext<MapContextType>({
  currentItem: Item.BLAHAJ,
  loaderHistory: undefined,
  focusedStoreData: null,
  storeBasicsHeight: undefined,
  setStoreBasicsHeight: noop,
});

export const useMapContext = () => useContext(MapContext);

const transition: Transition = {
  type: "tween",
  duration: 0.5,
  ease: eases.cubicOut,
};

const Sidebar: FC = () => {
  const { currentItem, loaderHistory, focusedStoreData, storeBasicsHeight, setStoreBasicsHeight } = useMapContext();
  const { setSidebarOpen } = useLayoutContext();

  const [focusedStoreHistory, setFocusedStoreHistory] = useState(loaderHistory ?? []);
  useEffect(() => {
    if (!loaderHistory) return;
    getStockHistoryClient.set([currentItem, focusedStoreData?.id], Promise.resolve(loaderHistory));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaderHistory]);
  const [historyLoading, setHistoryLoading] = useState(false);

  useUpdateEffect(() => {
    if (!focusedStoreData?.id) return;

    setHistoryLoading(true);
    getStockHistoryClient(currentItem, focusedStoreData?.id).then((history) => {
      setHistoryLoading(false);
      if (!history) {
        return setFocusedStoreHistory([]);
      }
      setFocusedStoreHistory(history);
    });
  }, [focusedStoreData?.id, currentItem]);

  const [tooltipData, setTooltipData] = useState<StockChartDatum | null>(null);

  const strings = useMemo(() => {
    const reportedAt = (tooltipData ? tooltipData : focusedStoreData?.stock)?.reported_at;
    const nextRestock = focusedStoreData?.restocks?.[0];

    return {
      focusedStoreCountry: focusedStoreData
        ? (focusedStoreData.id === "538" ? "Macau" : COUNTRY_NAMES[focusedStoreData.store.country]) ??
          focusedStoreData.store.country
        : "Unknown",
      focusedStoreName: focusedStoreData?.store?.name ?? "Click a store to get started",
      stockDataType: tooltipData ? "Historical Stock" : "Current Stock",
      stockDataValue: (tooltipData ? tooltipData : focusedStoreData?.stock)?.quantity ?? "--",
      stockDataReportedAt: reportedAt ? "Reported at " + format(reportedAt, "h:mm a 'on' LLL d") : "No Data",
      nextRestockValue: nextRestock ? nextRestock.quantity : "--",
      nextRestockRange: nextRestock
        ? `Expected ${format(nextRestock.earliest, "LLL d")} – ${format(nextRestock.latest, "LLL d")}`
        : "No restock expected",
      color: stockStyles[focusedStoreData?.status ?? StockStatus.UNKNOWN].color,
    };
  }, [focusedStoreData, tooltipData]);

  const chartContainerRef = useRef() as React.RefObject<HTMLDivElement>;

  const storeBasicsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storeBasics = storeBasicsRef.current;
    if (!storeBasics) return;

    const updateHeight = () => {
      setStoreBasicsHeight(storeBasics.scrollHeight);
    };
    updateHeight();

    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, [focusedStoreData, setStoreBasicsHeight, storeBasicsHeight]);

  return (
    <Flex
      flexDirection="column"
      shadow="2xl"
      width={{ base: "100%", md: "28rem" }}
      maxHeight={{ base: "unset", md: "calc(100vh - 4.25rem)" }}
    >
      <MotionFlex
        backgroundColor={strings.color}
        animate={{ backgroundColor: strings.color }}
        transition={transition}
        flexDirection="column"
        color="white"
      >
        <Box height="var(--store-basics-height)" overflow="hidden">
          <Flex flexDirection="column" paddingX="6" paddingY={{ base: "4", md: "6" }} ref={storeBasicsRef}>
            <Box fontSize={16} fontWeight="500">
              {strings.focusedStoreCountry}
            </Box>
            <Box fontSize={{ base: 28, md: 36 }} lineHeight="1" fontWeight="700">
              {strings.focusedStoreName}
            </Box>
          </Flex>
        </Box>
        <Box
          height={{ base: "20", md: "32" }}
          background="blackAlpha.200"
          ref={chartContainerRef}
          position="relative"
          overflow="hidden"
        >
          <ParentSize
            parentSizeStyles={{ position: "absolute", top: 0, bottom: -0.5, left: -0.5, right: -0.5, zIndex: "20" }}
            debounceTime={0}
          >
            {(size) => (
              <Test
                data={focusedStoreHistory}
                {...size}
                parentRef={chartContainerRef}
                setTooltipData={setTooltipData}
                loading={historyLoading}
                transition={transition}
              />
            )}
          </ParentSize>
          {historyLoading && <Spinner zIndex="10" position="absolute" top="2" right="2" thickness="6px" />}
        </Box>

        <Flex flexDirection="column" alignItems="center" paddingX="6" paddingY="4">
          <Flex alignItems="center" width="100%" justifyContent="space-between">
            <Flex flexDirection="column">
              <Box fontSize={16} fontWeight="600" lineHeight="1">
                {strings.stockDataType}
              </Box>
              <Box fontSize={14} lineHeight="1.1">
                {strings.stockDataReportedAt}
              </Box>
            </Flex>
            <Box fontSize={32} lineHeight="1.1" marginY="1" marginStart="4" fontWeight="700">
              {strings.stockDataValue}
            </Box>
          </Flex>
          <Flex alignItems="center" width="100%" justifyContent="space-between" marginTop="3">
            <Flex flexDirection="column">
              <Box fontSize={16} fontWeight="600" lineHeight="1">
                Next Restock
              </Box>
              <Box fontSize={14} lineHeight="1.1">
                {strings.nextRestockRange}
              </Box>
            </Flex>
            <Box fontSize={32} lineHeight="1.1" marginY="1" marginStart="4" fontWeight="700">
              {strings.nextRestockValue}
            </Box>
          </Flex>
        </Flex>
      </MotionFlex>
      <Box flexGrow="1" maxWidth="23rem" overflow="hidden">
        <Box as={SimpleBar} fontSize="14" maxHeight="100%" autoHide={false}>
          <Box paddingX="6" paddingY="4">
            <Heading size="md">Redisgned & Rebuilt</Heading>
            <p>
              Hey there. Long time no see. I think.
              <br />
              <br />
              Anyways, as of Feburary 12th, 2023, the new version of blahaj.app (the one you're looking at right now!)
              is live. This has been a long time coming, so I'm glad to finally be able to push this update out.
            </p>
            <Heading size="sm" marginTop="6">
              What's New?
            </Heading>
            <UnorderedList marginStart="6">
              <ListItem>Completely redesigned interface</ListItem>
              <ListItem>Shareable links</ListItem>
              <ListItem>Smolhaj (55cm size) tracking</ListItem>
              <ListItem>Stock history (up to 90 days)</ListItem>
              <ListItem>Various bug fixes</ListItem>
            </UnorderedList>
            <Heading size="sm" marginTop="6">
              Open Source
            </Heading>
            <p>
              blahaj.app is now open source! You can find the GitHub repository in{" "}
              <Link color="blue.400" onClick={() => setSidebarOpen(true)}>
                the side menu
              </Link>{" "}
              if you'd like to view the source code or contribute.
            </p>
            <Heading size="sm" marginTop="6">
              Feedback
            </Heading>
            <p>
              As always, if you have any feedback, suggestions, or just would like to say hi, feel free to reach out to
              me. Details can also be found in{" "}
              <Link color="blue.400" onClick={() => setSidebarOpen(true)}>
                the side menu
              </Link>
              .
            </p>
          </Box>
        </Box>
      </Box>
    </Flex>
  );
};

type ItemSelectorButtonProps = PropsWithChildren<{
  active?: boolean;
  rounded?: "start" | "end" | "none" | "both";
  onClick: () => void;
}>;

const ItemSelectorButton: FC<ItemSelectorButtonProps> = ({ children, active = false, rounded, onClick }) => {
  return (
    <Button
      color={active ? "white" : "gray.600"}
      background={active ? "blahaj.600" : "white"}
      _hover={active ? { background: "blahaj.500" } : { background: "gray.100" }}
      _active={active ? { background: "blahaj.400" } : { background: "gray.200" }}
      borderWidth="2px"
      borderStyle="solid"
      borderColor="blackAlpha.300"
      roundedStart={rounded === "start" || rounded === "both" ? "full" : "none"}
      roundedEnd={rounded === "end" || rounded === "both" ? "full" : "none"}
      marginStart={rounded === "end" ? "-1px" : "0"}
      marginEnd={rounded === "start" || rounded === "both" ? "-1px" : "0"}
      onClick={onClick}
    >
      {children}
    </Button>
  );
};
interface ItemSelectorProps {
  item: string;
  setItem: (item: string) => void;
  loading?: boolean;
}

const ItemSelector: FC<ItemSelectorProps> = ({ item, setItem, loading = false }) => {
  const updateItem = useCallback(
    (newItem: string) => {
      if (newItem === item) return;
      setItem(newItem);
    },
    [item, setItem],
  );

  return (
    <Flex
      position="absolute"
      top={{ base: "2", sm: "4" }}
      left="50%"
      transform="auto"
      translateX="-50%"
      zIndex="10"
      alignItems="stretch"
    >
      <ButtonGroup
        isAttached
        size={{ base: "md", sm: "lg" }}
        isDisabled={loading}
        background="white"
        rounded="full"
        shadow="lg"
        zIndex="20"
      >
        <ItemSelectorButton active={item === Item.BLAHAJ} rounded="start" onClick={() => updateItem(Item.BLAHAJ)}>
          Blåhaj
        </ItemSelectorButton>
        <ItemSelectorButton active={item === Item.SMOLHAJ} rounded="end" onClick={() => updateItem(Item.SMOLHAJ)}>
          Smolhaj
        </ItemSelectorButton>
      </ButtonGroup>
      <AnimatePresence>
        {loading && (
          <MotionFlex
            initial={{ marginInlineStart: "-4.5rem" }}
            animate={{ marginInlineStart: "-1.5rem" }}
            exit={{ marginInlineStart: "-4.5rem" }}
            transition={{ ...transition, duration: 0.35 }}
            alignItems="center"
            paddingStart="8"
            paddingEnd="4"
            roundedEnd="full"
            background="white"
          >
            <Spinner color="blahaj.700" size="md" thickness="6px" />
          </MotionFlex>
        )}
      </AnimatePresence>
    </Flex>
  );
};

const Map: FC = () => {
  const navigate = useNavigate();

  const { globalData: loaderGlobalData, history: loaderHistory, location } = useTypedLoaderData<typeof loader>();

  const rawParams = useParams();
  const params = useMemo(() => $params("/:item/map/:storeId", rawParams), [rawParams]);

  const [globalData, setGlobalData] = useState(loaderGlobalData);
  const [globalDataLoading, setGlobalDataLoading] = useState(false);
  useEffect(() => {
    getGlobalDataClient.set([params.item], Promise.resolve(loaderGlobalData));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaderGlobalData]);

  useUpdateEffect(() => {
    setGlobalDataLoading(true);
    getGlobalDataClient(params.item).then((newGlobalData) => {
      setGlobalDataLoading(false);
      if (!newGlobalData) return;
      setGlobalData(newGlobalData);
    });
  }, [params.item]);

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

  const markersLayerSource: SourceProps = {
    id: "markers",
    type: "geojson",
    data: {
      type: "FeatureCollection",
      features: ALL_STORES.map((store) => {
        const stock = globalData.stocks.find((stock) => stock.store_id === store.id);
        const restocks = globalData.allRestocks.filter((restock) => restock.store_id === store.id);

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
  };

  const flyToStore = (storeId: string) => {
    const map = mapRef.current;

    if (!map) return;

    const store = ALL_STORES.find((store) => store.id === storeId);

    if (!store) return;

    map.flyTo({
      center: [store.longitude, store.latitude],
      zoom: Math.max(7.5, map.getZoom()),
      screenSpeed: 1,
    });
  };

  const focusedStoreData = useMemo((): FocusedStoreData => {
    const id = params.storeId;

    const store = ALL_STORES.find((store) => store.id === id);
    if (!store) return null;

    const stock = globalData.stocks.find((stock) => stock.store_id === id);
    const restocks = globalData.allRestocks.filter((restock) => restock.store_id === id);
    const status = getStockStatus(stock, restocks);

    const formatted = {
      stockReportedAt: stock ? format(stock.reported_at, "h:mm a 'on' LLL d") : null,
      nextRestockRange: restocks[0]
        ? `${format(restocks[0].earliest, "LLL d")} – ${format(restocks[0].latest, "LLL d")}`
        : null,
    };

    return { id, store, stock, restocks, status, formatted };
  }, [globalData.stocks, globalData.allRestocks, params.storeId]);

  useUpdateEffect(() => {
    flyToStore(params.storeId);
  }, [params.storeId]);

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
        navigate($path("/:item/map/:storeId", { item: params.item, storeId }), { preventScrollReset: true });
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

  const [storeBasicsHeight, setStoreBasicsHeight] = useState<number | undefined>(undefined);

  return (
    <MapContext.Provider
      value={{
        currentItem: params.item,
        loaderHistory,
        focusedStoreData,
        storeBasicsHeight,
        setStoreBasicsHeight,
      }}
    >
      <MotionFlex
        initial={false}
        animate={{ "--store-basics-height": storeBasicsHeight + "px" } as any}
        transition={transition}
        height="100%"
        flexDirection={{ base: "column-reverse", md: "row" }}
      >
        <Sidebar />
        <Box
          width="100%"
          height={{ base: `calc(100vh - 19.25rem - var(--store-basics-height))`, md: "unset" }}
          flexGrow={{ base: "unset", md: "1" }}
          ref={mapContainerRef}
          position="relative"
        >
          <ItemSelector
            item={params.item}
            setItem={(item) => navigate($path("/:item/map/:storeId", { storeId: params.storeId, item }))}
            loading={globalDataLoading}
          />
          <MapGL
            reuseMaps
            ref={mapRef}
            onLoad={onMapLoad}
            initialViewState={{
              ...(focusedStoreData?.store
                ? { longitude: focusedStoreData.store.longitude, latitude: focusedStoreData.store.latitude }
                : location ?? { longitude: -122.4, latitude: 37.8 }),
              zoom: 7.5,
            }}
            minZoom={1.75}
            mapStyle="mapbox://styles/mapbox/streets-v12"
            mapboxAccessToken="pk.eyJ1IjoieGN2cjQ4IiwiYSI6ImNsNGZ5MGZ4NDA3eTIzam1iM2p2dzByajQifQ.1GtWcbTzMu63t09MwnZAVQ"
          >
            <NavigationControl />
            <GeolocateControl />
            <Source {...markersLayerSource}>
              <Layer {...markersLayerStyle} />
            </Source>
          </MapGL>
        </Box>
      </MotionFlex>
    </MapContext.Provider>
  );
};
export default Map;