import React, { Suspense } from "react";

import CoinOverview from "@/components/home/CoinOverview";
import TrendingCoins from "@/components/home/TrendingCoins";
import TrendingCoinsFallback from "@/components/home/TrendingCoinsFallback";
import CoinOverviewFallback from "@/components/home/CoinOverviewFallback";

const Page = async () => {
  return (
    <main className="main-container">
      <section className="home-grid">
        <Suspense fallback={<CoinOverviewFallback />}>
          <CoinOverview />
        </Suspense>

        <Suspense fallback={<TrendingCoinsFallback />}>
          <TrendingCoins />
        </Suspense>
        <section className="xl:col-span-3 mt-7">
          <p>Categories</p>
        </section>
      </section>
    </main>
  );
};

export default Page;
