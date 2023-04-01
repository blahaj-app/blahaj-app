import type { Item } from "@blahaj-app/static";
import { Box, Flex, Heading, ListItem, Spinner, UnorderedList } from "@chakra-ui/react";
import { ParentSize } from "@visx/responsive";
import { format } from "date-fns";
import type { FC } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { ClientOnly } from "remix-utils";
import SimpleBar from "simplebar-react";
import { useGlobalDataQuery, useMapContext, useStockHistoryQuery } from "../../routes/$item/map";
import { StockStatus, getStockStatus, stockStyles } from "../../stock-status";
import defaultTransition from "../../utils/default-transition";
import findStore from "../../utils/find-store";
import formatTz from "../../utils/format-tz";
import getStoreCountryDatum from "../../utils/get-store-country-datum";
import { MotionFlex } from "../motion-flex";
import OpenSideMenuButton from "./open-side-menu-button";
import type { StockChartDatum } from "./stock-history-chart";
import StockHistoryChart from "./stock-history-chart";

export const Sidebar: FC = () => {
  const {
    params,
    loaderData,
    storeBasicsHeightState: [storeBasicsHeight, setStoreBasicsHeight],
  } = useMapContext();

  const { data: globalData } = useGlobalDataQuery(params.item as Item, loaderData?.globalData);
  const { data: focusedStoreHistory, isLoading: focusedStoreHistoryLoading } = useStockHistoryQuery(
    params.item as Item,
    params.storeId ?? null,
    loaderData?.stockHistory,
  );

  const focusedStoreData = useMemo(() => {
    if (!(params.storeId && globalData)) return null;

    const id = params.storeId;

    const store = findStore(id);
    if (!store) return null;

    const stock = globalData.stocks.find((stock) => stock.store_id === id);
    const restocks = globalData.allRestocks.filter((restock) => restock.store_id === id);
    const status = getStockStatus(stock, restocks);

    return { id, store, stock, restocks, status };
  }, [params.storeId, globalData]);

  const [tooltipData, setTooltipData] = useState<StockChartDatum | null>(null);

  const strings = useMemo(() => {
    const reportedAt = (tooltipData ? tooltipData : focusedStoreData?.stock)?.reported_at;
    const nextRestock = focusedStoreData?.restocks?.[0];

    return {
      focusedStoreCountry: focusedStoreData
        ? getStoreCountryDatum(focusedStoreData.store)?.name ?? focusedStoreData.store.country
        : "Unknown",
      focusedStoreName: focusedStoreData?.store?.name ?? "Click a store to get started",
      stockDataType: tooltipData ? "Historical Stock" : "Current Stock",
      stockDataValue: (tooltipData ? tooltipData : focusedStoreData?.stock)?.quantity ?? "--",
      stockDataReportedAt: reportedAt ? "Reported at " + format(reportedAt, "h:mm a 'on' LLL d") : "No Data",
      stockDataReportedAtUTC: reportedAt
        ? "Reported at " + formatTz(reportedAt, "h:mm a 'on' LLL d", "UTC") + " UTC"
        : "No Data",
      nextRestockValue: nextRestock ? nextRestock.quantity : "--",
      nextRestockRange: nextRestock
        ? `Expected ${format(nextRestock.earliest, "LLL d")} – ${format(nextRestock.latest, "LLL d")}`
        : "No restock expected",
      nextRestockRangeUTC: nextRestock
        ? `Expected ${formatTz(nextRestock.earliest, "LLL d", "UTC")} – ${formatTz(
            nextRestock.latest,
            "LLL d",
            "UTC",
          )} UTC`
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
        transition={defaultTransition}
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
              <StockHistoryChart
                data={focusedStoreHistory ?? []}
                {...size}
                parentRef={chartContainerRef}
                setTooltipData={setTooltipData}
                loading={focusedStoreHistoryLoading}
                transition={defaultTransition}
              />
            )}
          </ParentSize>
          {focusedStoreHistoryLoading && <Spinner zIndex="10" position="absolute" top="2" right="2" thickness="6px" />}
        </Box>

        <Flex flexDirection="column" alignItems="center" paddingX="6" paddingY="4">
          <Flex alignItems="center" width="100%" justifyContent="space-between">
            <Flex flexDirection="column">
              <Box fontSize={16} fontWeight="600" lineHeight="1">
                {strings.stockDataType}
              </Box>
              <Box fontSize={14} lineHeight="1.1">
                <ClientOnly fallback={strings.stockDataReportedAtUTC}>{() => strings.stockDataReportedAt}</ClientOnly>
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
                <ClientOnly fallback={strings.nextRestockRangeUTC}>{() => strings.nextRestockRange}</ClientOnly>
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
            <Heading size="md">Redesigned & Rebuilt</Heading>
            <p>
              Hey there. Long time no see. I think.
              <br />
              <br />
              Anyways, as of March 26th, 2023, the new version of blahaj.app (the one you're looking at right now!) is
              live. This has been a long time coming, so I'm glad to finally be able to push this update out.
            </p>
            <Heading size="sm" marginTop="6">
              What's New?
            </Heading>
            <UnorderedList marginStart="6">
              <ListItem>Completely redesigned interface</ListItem>
              <ListItem>Shareable links</ListItem>
              <ListItem>Smolhaj (55cm size) tracking</ListItem>
              <ListItem>Stock history (up to 90 days)</ListItem>
              <ListItem>Various fixes</ListItem>
            </UnorderedList>
            <Heading size="sm" marginTop="6">
              Open Source
            </Heading>
            <p>
              blahaj.app is now open source! You can find the GitHub repository in{" "}
              <OpenSideMenuButton>the side menu</OpenSideMenuButton> if you'd like to view the source code or
              contribute.
            </p>
            <Heading size="sm" marginTop="6">
              Feedback
            </Heading>
            <p>
              As always, if you have any feedback, suggestions, or just would like to say hi, feel free to reach out to
              me. Details can also be found in <OpenSideMenuButton>the side menu</OpenSideMenuButton>.
            </p>
          </Box>
        </Box>
      </Box>
    </Flex>
  );
};
