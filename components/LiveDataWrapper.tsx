"use client";

import { useCoinGeckoWebSocket } from "@/hooks/useCoinGeckoWebSocket";
import { Separator } from "@radix-ui/react-separator";
import React from "react";
import DataTable from "./DataTable";
import { formatCurrency } from "@/lib/utils";
import { timeAgo } from "@/lib/utils";
import CoinHeader from "./CoinHeader";
import CandlestickChart from "./CandlestickChart";
import { fetcher } from "@/lib/coingecko.actions";

const LiveDataWrapper = ({
  children,
  coinId,
  poolId,
  coin,
  coinOHLCData,
}: LiveDataProps) => {
  const price = null;
  const trades: Trade[] = [];
  const ohlcv = null;

  const [updateInterval, setUpdateInterval] = React.useState(10000);

  const [liveMarketData, setLiveMarketData] = React.useState({
    price: coin.market_data.current_price.usd,
    change24h: coin.market_data.price_change_percentage_24h_in_currency.usd,
  });

  const [displayPrice, setDisplayPrice] = React.useState(
    coin.market_data.current_price.usd,
  );

  React.useEffect(() => {
    const fetchLatestPrice = async () => {
      try {
        const response = await fetch(`/api/coin/${coinId}`);

        if (!response.ok) return;

        const latest: CoinDetailsData = await response.json();

        setLiveMarketData({
          price: latest.market_data.current_price.usd,
          change24h:
            latest.market_data.price_change_percentage_24h_in_currency.usd,
        });

        // console.log(
        //   "Previous:",
        //   liveMarketData.price,
        //   "New:",
        //   latest.market_data.current_price.usd,
        // );

        // console.log("Latest REST price:", latest.market_data.current_price.usd);
      } catch (error) {
        console.error("Polling error:", error);
      }
    };

    // Fetch immediately
    fetchLatestPrice();

    // Then every 10 seconds
    const interval = setInterval(fetchLatestPrice, updateInterval);
    return () => clearInterval(interval);
  }, [coinId, updateInterval]);

  React.useEffect(() => {
    const animation = setInterval(() => {
      setDisplayPrice((prev) => {
        const diff = liveMarketData.price - prev;

        if (Math.abs(diff) < 0.000001) {
          return liveMarketData.price;
        }

        return prev + diff * 0.15;
      });
    }, 100);

    return () => clearInterval(animation);
  }, [liveMarketData.price]);

  const tradeColumns: DataTableColumn<Trade>[] = [
    {
      header: "Price",
      cellClassName: "price-cell",
      cell: (trade) => (trade.price ? formatCurrency(trade.price) : "-"),
    },
    {
      header: "Amount",
      cellClassName: "amount-cell",
      cell: (trade) => trade.amount?.toFixed(4) ?? "-",
    },
    {
      header: "Value",
      cellClassName: "value-cell",
      cell: (trade) => (trade.value ? formatCurrency(trade.value) : "-"),
    },
    {
      header: "Buy/Sell",
      cellClassName: "type-cell",
      cell: (trade) => (
        <span
          className={trade.type === "b" ? "text-green-500" : "text-red-500"}
        >
          {trade.type === "b" ? "Buy" : "Sell"}
        </span>
      ),
    },
    {
      header: "Time",
      cellClassName: "time-cell",
      cell: (trade) => (trade.timestamp ? timeAgo(trade.timestamp) : "-"),
    },
  ];

  return (
    <section id="live-data-wrapper" className="fade-up">
      <CoinHeader
        name={coin.name}
        image={coin.image.large}
        livePrice={displayPrice}
        livePriceChangePercentage24h={liveMarketData.change24h}
        priceChangePercentage30d={
          coin.market_data.price_change_percentage_30d_in_currency.usd
        }
        priceChange24h={coin.market_data.price_change_24h_in_currency.usd}
      />
      <Separator className="divider" />

      <div className="trend">
        <div className="trend-header flex items-center justify-between">
          <h4>Trend Overview</h4>

          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-xs font-medium text-green-400">LIVE</span>
          </div>
        </div>

        <CandlestickChart
          coinId={coinId}
          data={coinOHLCData}
          livePrice={displayPrice}
          mode="live"
          updateInterval={updateInterval}
          onUpdateIntervalChange={setUpdateInterval}
        />
      </div>
      <Separator className="divider" />

      {tradeColumns && (
        <div className="trades">
          <h4>Recent Trades</h4>

          <div className="rounded-lg bg-dark-500 p-6 text-center text-purple-200">
            Live trade streaming requires a CoinGecko Analyst or higher API
            plan.
          </div>
        </div>
      )}
      {children}
    </section>
  );
};

export default LiveDataWrapper;
