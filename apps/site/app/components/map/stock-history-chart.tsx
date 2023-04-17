import { curveCatmullRom } from "@visx/curve";
import { localPoint } from "@visx/event";
import { LinearGradient } from "@visx/gradient";
import { scaleLinear, scaleTime } from "@visx/scale";
import { AreaClosed, Bar, Line } from "@visx/shape";
import { withTooltip } from "@visx/tooltip";
import type { WithTooltipProvidedProps } from "@visx/tooltip/lib/enhancers/withTooltip";
import { bisector, extent, max } from "d3-array";
import type { Transition } from "framer-motion";
import { motion } from "framer-motion";
import React, { useCallback, useEffect, useMemo } from "react";
import type { SetStateType } from "../../utils/types";

export interface StockChartDatum {
  reported_at: Date;
  quantity: number;
}

export const colors = {
  background: "rgba(255, 255, 255, 0.7)",
  background2: "rgba(255, 255, 255, 0.075)",
  indicator: "rgba(255, 255, 255, 0.75)",
};

// accessors
const getDate = (d: StockChartDatum) => new Date(d.reported_at);
const getStockQuantity = (d: StockChartDatum) => d?.quantity;
const bisectDate = bisector<StockChartDatum, Date>((d) => new Date(d.reported_at)).left;

export type AreaProps = {
  data: StockChartDatum[];
  width: number;
  height: number;
  setTooltipData?: SetStateType<StockChartDatum | null>;
  loading?: boolean;
  transition?: Transition;
  parentRef: React.RefObject<HTMLDivElement>;
};

const StockHistoryChart = withTooltip<AreaProps, StockChartDatum>(
  ({
    data,
    width,
    height,
    setTooltipData,
    loading = false,
    transition,
    showTooltip,
    hideTooltip,
    tooltipData,
    tooltipTop = 0,
    tooltipLeft = 0,
    parentRef,
  }: AreaProps & WithTooltipProvidedProps<StockChartDatum>) => {
    if (width < 10) return null;

    // bounds
    const innerWidth = width;
    const innerHeight = height;

    // scales
    const dateScale = useMemo(
      () =>
        scaleTime({
          range: [0, innerWidth],
          domain: extent(data, getDate) as [Date, Date],
        }),
      [data, innerWidth],
    );
    const stockValueScale = useMemo(
      () =>
        scaleLinear({
          range: [innerHeight, innerHeight / 6],
          domain: [-1, Math.max(max(data, getStockQuantity) ?? 0, 10)],
          nice: true,
        }),
      [data, innerHeight],
    );

    // tooltip handler
    const handleTooltip = useCallback(
      (event: TouchEvent | MouseEvent) => {
        if (loading) return;
        const { x } = localPoint(event) || { x: 0 };
        const x0 = dateScale.invert(x);
        const index = bisectDate(data, x0, 1);
        const d0 = data[index - 1];
        const d1 = data[index];
        let d = d0;
        if (d1 && getDate(d1)) {
          d = x0.valueOf() - getDate(d0).valueOf() > getDate(d1).valueOf() - x0.valueOf() ? d1 : d0;
        }
        setTooltipData?.(d);
        showTooltip({
          tooltipData: d,
          tooltipLeft: x,
          tooltipTop: stockValueScale(getStockQuantity(d)),
        });
      },
      [data, dateScale, loading, setTooltipData, showTooltip, stockValueScale],
    );

    useEffect(() => {
      if (loading) {
        hideTooltip();
        setTooltipData?.(null);
      }
    }, [hideTooltip, loading, setTooltipData]);

    useEffect(() => {
      const parent = parentRef.current;

      const pointerLeave = () => {
        hideTooltip();
        setTooltipData?.(null);
      };

      if (parent) {
        parent.addEventListener("touchstart", handleTooltip, { passive: true });
        parent.addEventListener("touchmove", handleTooltip, { passive: true });
        parent.addEventListener("mousemove", handleTooltip, { passive: true });
        parent.addEventListener("mouseleave", pointerLeave, { passive: true });
      }

      return () => {
        if (parent) {
          parent.removeEventListener("touchstart", handleTooltip);
          parent.removeEventListener("touchmove", handleTooltip);
          parent.removeEventListener("mousemove", handleTooltip);
          parent.removeEventListener("mouseleave", pointerLeave);
        }
      };
    }, [handleTooltip, hideTooltip, parentRef, setTooltipData]);

    return (
      <div>
        <svg width={width} height={height}>
          <LinearGradient id="area-gradient" from={colors.background} to={colors.background2} />

          <AreaClosed<StockChartDatum>
            x={(d) => dateScale(getDate(d)) ?? 0}
            y={(d) => stockValueScale(getStockQuantity(d)) ?? 0}
            yScale={stockValueScale}
            curve={curveCatmullRom}
          >
            {({ path }) => (
              <motion.path
                animate={{ d: path(data) ?? "" }}
                transition={transition}
                strokeWidth={2}
                stroke="url(#area-gradient)"
                fill="url(#area-gradient)"
              />
            )}
          </AreaClosed>
          <Bar x={0} y={0} width={innerWidth} height={innerHeight} fill="transparent" rx={14} />
          {tooltipData && (
            <g>
              <Line
                from={{ x: tooltipLeft, y: 0 }}
                to={{ x: tooltipLeft, y: innerHeight }}
                stroke={colors.indicator}
                strokeWidth={2}
                pointerEvents="none"
              />
              {/* <Line
                from={{ x: tooltipLeft, y: margin.top }}
                to={{ x: tooltipLeft, y: tooltipTop - 4 }}
                stroke={colors.indicator}
                strokeWidth={2}
                pointerEvents="none"
              />
              <Line
                from={{ x: tooltipLeft, y: tooltipTop + 4 }}
                to={{ x: tooltipLeft, y: innerHeight + margin.top }}
                stroke={colors.indicator}
                strokeWidth={2}
                pointerEvents="none"
              />
              <circle
                cx={tooltipLeft}
                cy={tooltipTop}
                r={4}
                stroke={colors.indicator}
                fill="none"
                strokeWidth={2}
                pointerEvents="none"
              /> */}
            </g>
          )}
        </svg>
      </div>
    );
  },
);

export default StockHistoryChart;
