import React from "react";
import Image from "next/image";
import { fetcher } from "@/lib/coingecko.actions";
import { formatCurrency } from "@/lib/utils";
import CoinOverviewFallback from "./CoinOverviewFallback";
import CandlestickChart from "@/components/CandlestickChart";
import AnimatedPrice from "../AnimatedPrice";

const CoinOverview = async () => {
  let coin: CoinDetailsData | null = null;
  let coinOHLCData: OHLCData[] = [];

  try {
    [coin, coinOHLCData] = await Promise.all([
      fetcher<CoinDetailsData>("coins/bitcoin"),
      fetcher<OHLCData[]>("coins/bitcoin/ohlc", {
        vs_currency: "usd",
        days: 1,
      }),
    ]);
  } catch (error) {
    console.error("Error fetching coin overview:", error);
  }

  if (!coin) {
    return <CoinOverviewFallback />;
  }

  return (
    <div id="coin-overview">
      <CandlestickChart data={coinOHLCData} coinId="bitcoin">
        <div className="header">
          <Image
            src={coin.image.large}
            alt={coin.name}
            width={56}
            height={56}
          />

          <section id="coin-overview" className="fade-up">
            <p>
              {coin.name} / {coin.symbol.toUpperCase()}
            </p>

            <h1>
              <AnimatedPrice value={coin.market_data.current_price.usd} />
            </h1>
          </section>
        </div>
      </CandlestickChart>
    </div>
  );
};

export default CoinOverview;
