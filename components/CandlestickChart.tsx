"use client";

import { PERIOD_BUTTONS, PERIOD_CONFIG } from "../constants";
import { useState, useRef, useTransition, useEffect } from "react";
import { createChart, IChartApi, ISeriesApi } from "lightweight-charts";
import { fetcher } from "../lib/coingecko.actions";
import { getCandlestickConfig } from "../constants";
import { CandlestickSeries } from "lightweight-charts";
import { convertOHLCData } from "../lib/utils";
import type { UTCTimestamp } from "lightweight-charts";

const getChartConfig = (height: number, showTime: boolean) => ({
  height,
  layout: {
    background: { color: "#0d1117" },
    textColor: "#d1d5db",
  },
  grid: {
    vertLines: { visible: false },
    horzLines: { visible: false },
  },
  crosshair: {
    mode: 0,
  },
  rightPriceScale: {
    borderVisible: false,
  },
  timeScale: {
    timeVisible: showTime,
    borderVisible: false,
  },
});

const CandlestickChart = ({
  children,
  data,
  coinId,
  height = 360,
  initialPeriod = "daily",
  mode = "historical",
  livePrice,
  updateInterval = 10000,
  onUpdateIntervalChange,
}: CandlestickChartProps) => {
  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);

  const [period, setPeriod] = useState(initialPeriod);
  const [ohlcData, setOhlcData] = useState<OHLCData[]>(data ?? []);
  const latestCandleRef = useRef<OHLCData | null>(null);
  const previousPriceRef = useRef<number | null>(null);
  const [isPending, startTransition] = useTransition();

  const fetchOHLCData = async (selectedPeriod: Period) => {
    try {
      const { days } = PERIOD_CONFIG[selectedPeriod];

      console.log(PERIOD_CONFIG[selectedPeriod]);

      const newData = await fetcher<OHLCData[]>(`coins/${coinId}/ohlc`, {
        vs_currency: "usd",
        days,
      });
      setOhlcData(newData ?? []);
    } catch (e) {
      console.error("Failed to fetch OHLCData", e);
    }
  };

  const handlePeriodChange = (newPeriod: Period) => {
    if (newPeriod === period) return;

    startTransition(async () => {
      setPeriod(newPeriod);
      await fetchOHLCData(newPeriod);
    });
  };

  useEffect(() => {
    const container = chartContainerRef.current;
    if (!container) return;

    const showTime = ["daily", "hourly", "weekly"].includes(period);

    const chart = createChart(container, {
      ...getChartConfig(height, showTime),
      width: container.clientWidth,
    });

    const series = chart.addSeries(CandlestickSeries, getCandlestickConfig());

    const convertedToSeconds = ohlcData.map(
      (item) =>
        [
          Math.floor(item[0] / 1000),
          item[1],
          item[2],
          item[3],
          item[4],
        ] as OHLCData,
    );

    series.setData(convertOHLCData(convertedToSeconds));
    chart.timeScale().fitContent();

    chartRef.current = chart;
    candleSeriesRef.current = series;

    const observer = new ResizeObserver((entries) => {
      if (!entries.length) return;
      chart.applyOptions({ width: entries[0].contentRect.width });
    });

    observer.observe(container);

    return () => {
      observer.disconnect();
      chart.remove();
      chartRef.current = null;
      candleSeriesRef.current = null;
    };
  }, [height, period]);

  useEffect(() => {
    if (mode !== "live") return;

    const interval = setInterval(async () => {
      try {
        const { days } = PERIOD_CONFIG[period];

        const latest = await fetcher<OHLCData[]>(`coins/${coinId}/ohlc`, {
          vs_currency: "usd",
          days,
        });

        setOhlcData(latest ?? []);
      } catch (err) {
        console.error(err);
      }
    }, updateInterval);

    return () => clearInterval(interval);
  }, [coinId, period, mode, updateInterval]);

  useEffect(() => {
    if (!candleSeriesRef.current) return;

    const convertedToSeconds = ohlcData.map(
      (item) =>
        [
          Math.floor(item[0] / 1000),
          item[1],
          item[2],
          item[3],
          item[4],
        ] as OHLCData,
    );

    const converted = convertOHLCData(convertedToSeconds);
    candleSeriesRef.current.setData(converted);

    if (ohlcData.length > 0) {
      latestCandleRef.current = [...ohlcData].pop() ?? null;
    }

    if (ohlcData.length > 0) {
      latestCandleRef.current = ohlcData[ohlcData.length - 1];
    }

    chartRef.current?.timeScale().fitContent();
  }, [ohlcData, period]);

  useEffect(() => {
    if (mode !== "live") return;
    if (!livePrice) return;
    if (!latestCandleRef.current) return;
    if (!candleSeriesRef.current) return;

    // console.log("Updating candle:", livePrice);

    const previous = latestCandleRef.current;

    const updated: OHLCData = [
      previous[0], // keep same timestamp
      previous[1], // same open
      Math.max(previous[2], livePrice), // high
      Math.min(previous[3], livePrice), // low
      livePrice, // close
    ];

    latestCandleRef.current = updated;

    const converted = convertOHLCData([
      [
        Math.floor(updated[0] / 1000),
        updated[1],
        updated[2],
        updated[3],
        updated[4],
      ],
    ])[0];

    candleSeriesRef.current.update(converted);
  }, [livePrice, mode]);

  // useEffect(() => {
  //   if (!livePrice) return;
  //   if (!candleSeriesRef.current) return;

  //   const now = Math.floor(Date.now() / 1000);

  //   // first update
  //   if (!latestCandleRef.current) {
  //     latestCandleRef.current = [
  //       now * 1000,
  //       livePrice,
  //       livePrice,
  //       livePrice,
  //       livePrice,
  //     ];

  //     previousPriceRef.current = livePrice;

  //     candleSeriesRef.current.update({
  //       time: now as UTCTimestamp,
  //       open: livePrice,
  //       high: livePrice,
  //       low: livePrice,
  //       close: livePrice,
  //     });

  //     return;
  //   }

  //   const candle = latestCandleRef.current;

  //   candle[2] = Math.max(candle[2], livePrice); // high
  //   candle[3] = Math.min(candle[3], livePrice); // low
  //   candle[4] = livePrice; // close

  //   candleSeriesRef.current.update({
  //     time: Math.floor(candle[0] / 1000) as UTCTimestamp,
  //     open: candle[1],
  //     high: candle[2],
  //     low: candle[3],
  //     close: candle[4],
  //   });
  //   chartRef.current?.timeScale().scrollToRealTime();

  //   previousPriceRef.current = livePrice;
  // }, [livePrice]);

  useEffect(() => {
    if (mode !== "live") return;

    const interval = setInterval(() => {
      if (!latestCandleRef.current) return;

      const lastClose = latestCandleRef.current[4];

      latestCandleRef.current = [
        Date.now(),
        lastClose,
        lastClose,
        lastClose,
        lastClose,
      ];

      // console.log("🕯 New candle created");
    }, 15000);

    return () => clearInterval(interval);
  }, [mode]);

  return (
    <div id="candlestick-chart">
      <div className="chart-header">
        <div className="flex-1">{children}</div>

        <div className="button-group">
          <span className="text-sm mx-2 font-medium text-purple-100/50">
            Period:
          </span>
          {PERIOD_BUTTONS.map(({ value, label }) => (
            <button
              key={value}
              className={
                period === value ? "config-button active" : "config-button"
              }
              onClick={() => handlePeriodChange(value)}
              disabled={isPending}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <select
        value={updateInterval}
        onChange={(e) => onUpdateIntervalChange?.(Number(e.target.value))}
        className="config-select"
      >
        <option value={5000}>5s</option>
        <option value={10000}>10s</option>
        <option value={30000}>30s</option>
        <option value={60000}>1m</option>
      </select>
      <div ref={chartContainerRef} className="chart" style={{ height }} />
    </div>
  );
};
export default CandlestickChart;
