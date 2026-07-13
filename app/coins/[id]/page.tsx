import { fetcher, getPools } from "@/lib/coingecko.actions";
import { ArrowUp, ArrowUpRight } from "lucide-react";
import React from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import LiveDataWrapper from "@/components/LiveDataWrapper";
import Converter from "@/components/Converter";

const page = async ({ params }: NextPageProps) => {
  const { id } = await params;

  const [coinData, coinOHLCData, coinTickers, marketCoins] = await Promise.all([
    fetcher<CoinDetailsData>(`coins/${id}`, {
      dex_pair_format: "contract_address",
    }),

    fetcher<OHLCData[]>(`coins/${id}/ohlc`, {
      vs_currency: "usd",
      days: 1,
    }),

    fetcher<any>(`coins/${id}/tickers`),

    fetcher<CoinMarketData[]>("coins/markets", {
      vs_currency: "usd",
      order: "market_cap_desc",
      per_page: 100,
      page: 1,
      sparkline: "false",
      price_change_percentage: "24h",
    }),
  ]);

  const platform = coinData.asset_platform_id
    ? coinData.detail_platforms?.[coinData.asset_platform_id]
    : null;
  const network = platform?.geckoterminal_url.split("/")[3] || null;
  const contract_address = platform?.contract_address || null;

  const pool = await getPools(id, network, contract_address);

  const exchangeListings = coinTickers.tickers.slice(0, 10);
  const sortedCoins = [...marketCoins].sort(
    (a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h,
  );

  const topGainers = sortedCoins.slice(0, 5);

  const topLosers = [...sortedCoins].reverse().slice(0, 5);

  console.log(exchangeListings);

  const coinDetails: {
    label: string;
    value: string;
    link?: string;
    linkText?: string;
  }[] = [
    {
      label: "Market Cap",
      value: formatCurrency(coinData.market_data.market_cap.usd),
    },
    {
      label: "Market Cap Rank",
      value: `# ${coinData.market_cap_rank}`,
    },
    {
      label: "Total Volume",
      value: formatCurrency(coinData.market_data.total_volume.usd),
    },
    {
      label: "Circulating Supply",
      value: coinData.market_data.circulating_supply?.toLocaleString() ?? "-",
    },
    {
      label: "Total Supply",
      value: coinData.market_data.total_supply?.toLocaleString() ?? "-",
    },
    {
      label: "Max Supply",
      value: coinData.market_data.max_supply?.toLocaleString() ?? "Unlimited",
    },
    {
      label: "Fully Diluted Valuation",
      value: coinData.market_data.fully_diluted_valuation?.usd
        ? formatCurrency(coinData.market_data.fully_diluted_valuation.usd)
        : "-",
    },
    {
      label: "All-Time High",
      value: coinData.market_data.fully_diluted_valuation?.usd
        ? formatCurrency(coinData.market_data.fully_diluted_valuation.usd)
        : "-",
    },
    {
      label: "All-Time Low",
      value: coinData.market_data.fully_diluted_valuation?.usd
        ? formatCurrency(coinData.market_data.fully_diluted_valuation.usd)
        : "-",
    },
    {
      label: "Genesis Date",
      value: coinData.genesis_date ?? "-",
    },
    {
      label: "Hashing Algorithm",
      value: coinData.hashing_algorithm ?? "-",
    },
    {
      label: "Website",
      value: "-",
      link: coinData.links.homepage[0],
      linkText: "Homepage",
    },
    {
      label: "Explorer",
      value: "-",
      link: coinData.links.blockchain_site[0],
      linkText: "Explorer",
    },
    {
      label: "Community",
      value: "-",
      link: coinData.links.subreddit_url,
      linkText: "Community",
    },
  ];
  return (
    <main id="coin-details-page">
      <section className="primary">
        <LiveDataWrapper
          coinId={id}
          poolId={pool.id}
          coin={coinData}
          coinOHLCData={coinOHLCData}
        >
          <div className="exchange-section">
            <div className="flex items-center justify-between">
              <h4>Exchange Listings</h4>

              <span className="text-sm text-purple-100/60">
                Showing {exchangeListings.length} markets
              </span>
            </div>

            <div className="exchange-table">
              <table className="w-full border-collapse">
                <thead className="border-b border-dark-400">
                  <tr className="text-left text-sm text-purple-100/60">
                    <th className="px-5 py-4">Exchange</th>
                    <th className="px-5 py-4">Pair</th>
                    <th className="px-5 py-4">Price</th>
                    <th className="px-5 py-4">24h Volume</th>
                    <th className="px-5 py-4">Visit</th>
                  </tr>
                </thead>

                <tbody>
                  {exchangeListings.map((ticker: any, index: number) => (
                    <tr
                      key={index}
                      className="border-b border-dark-400 hover:bg-dark-400 transition-colors"
                    >
                      <td className="exchange-name px-5 py-4">
                        <a
                          href={ticker.trade_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold hover:text-green-400 transition"
                        >
                          {ticker.market.name}
                        </a>
                      </td>

                      <td className="pair px-5 py-4">
                        {ticker.base}/{ticker.target}
                      </td>

                      <td className="price-cell px-5 py-4">
                        {formatCurrency(ticker.last)}
                      </td>

                      <td className="px-5 py-4 font-medium">
                        {formatCurrency(
                          ticker.converted_volume?.usd ?? ticker.volume,
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <a
                          href={ticker.trade_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-500 hover:text-green-400 underline"
                        >
                          Trade →
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </LiveDataWrapper>
      </section>

      <section className="secondary">
        <Converter
          symbol={coinData.symbol}
          icon={coinData.image.small}
          priceList={coinData.market_data.current_price}
        />
        <div className="details">
          <h4>Market Information</h4>

          <ul className="details-grid">
            {coinDetails.map(({ label, value, link, linkText }, index) => (
              <li key={index}>
                <p className={label}>{label}</p>

                {link && link.trim() !== "" ? (
                  <div className="link">
                    <Link href={link} target="_blank">
                      {linkText || label}
                    </Link>

                    <ArrowUpRight size={16} />
                  </div>
                ) : (
                  <p className="text-base font-medium">{value}</p>
                )}
              </li>
            ))}
          </ul>
        </div>
        <div className="exchange-section">
          <h4>Top Gainers & Losers</h4>

          <div className="grid grid-cols-2 gap-4 mt-5">
            <div className="bg-dark-500 rounded-xl p-4">
              <h5 className="text-green-500 font-semibold mb-3">
                📈 Top Gainers
              </h5>

              {topGainers.map((coin) => (
                <div key={coin.id} className="flex justify-between py-2">
                  <span>{coin.symbol.toUpperCase()}</span>

                  <span className="text-green-500 font-semibold">
                    +{coin.price_change_percentage_24h.toFixed(2)}%
                  </span>
                </div>
              ))}
            </div>

            <div className="bg-dark-500 rounded-xl p-4">
              <h5 className="text-red-500 font-semibold mb-3">📉 Top Losers</h5>

              {topLosers.map((coin) => (
                <div key={coin.id} className="flex justify-between py-2">
                  <span>{coin.symbol.toUpperCase()}</span>

                  <span className="text-red-500 font-semibold">
                    {coin.price_change_percentage_24h.toFixed(2)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default page;
