import { fetcher, getPools } from "@/lib/coingecko.actions";
import {
  ArrowUp,
  ArrowUpRight,
  Globe,
  Search,
  MessageCircle,
  DollarSign,
  Trophy,
  BarChart3,
  Coins,
} from "lucide-react";
import React from "react";
import Link from "next/link";
import { formatCurrency, formatLargeNumber } from "@/lib/utils";
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

    fetcher<{ tickers: Ticker[] }>(`coins/${id}/tickers`),

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

  const coinDetails: {
    label: string;
    value: string | number;
    icon: React.ReactNode;
    link?: string;
    linkText?: string;
  }[] = [
    {
      label: "Market Cap",
      icon: <DollarSign size={18} />,
      value: formatLargeNumber(coinData.market_data.market_cap.usd),
    },
    {
      label: "Market Cap Rank",
      icon: <Trophy size={18} />,
      value: `# ${coinData.market_cap_rank}`,
    },
    {
      label: "Total Volume",
      icon: <BarChart3 size={18} />,
      value: `$${formatLargeNumber(coinData.market_data.total_volume.usd)}`,
    },
    {
      label: "Circulating Supply",
      icon: <Coins size={18} />,
      value: `${formatLargeNumber(coinData.market_data.circulating_supply)} ${coinData.symbol.toUpperCase()}`,
    },
    {
      label: "Total Supply",
      icon: <Coins size={18} />,
      value: `${formatLargeNumber(coinData.market_data.total_supply)} ${coinData.symbol.toUpperCase()}`,
    },
    {
      label: "Max Supply",
      icon: <Coins size={18} />,
      value: coinData.market_data.max_supply
        ? `${formatLargeNumber(coinData.market_data.max_supply)} ${coinData.symbol.toUpperCase()}`
        : "Unlimited",
    },
    {
      label: "Fully Diluted Valuation",
      icon: <DollarSign size={18} />,
      value: coinData.market_data.fully_diluted_valuation?.usd
        ? `$${formatLargeNumber(coinData.market_data.fully_diluted_valuation.usd)}`
        : "-",
    },
    {
      label: "All-Time High",
      icon: <ArrowUp size={18} />,
      value: coinData.market_data.ath?.usd
        ? formatCurrency(coinData.market_data.ath.usd)
        : "-",
    },
    {
      label: "All-Time Low",
      icon: <ArrowUp size={18} className="rotate-180" />,
      value: coinData.market_data.atl?.usd
        ? formatCurrency(coinData.market_data.atl.usd)
        : "-",
    },
    {
      label: "Genesis Date",
      icon: <Trophy size={18} />,
      value: coinData.genesis_date ?? "-",
    },
    {
      label: "Hashing Algorithm",
      icon: <Search size={18} />,
      value: coinData.hashing_algorithm ?? "-",
    },
    {
      label: "Website",
      icon: <Globe size={18} />,
      value: "-",
      link: coinData.links.homepage[0],
      linkText: "Homepage",
    },
    {
      label: "Explorer",
      icon: <Search size={18} />,
      value: "-",
      link: coinData.links.blockchain_site[0],
      linkText: "Explorer",
    },
    {
      label: "Community",
      icon: <MessageCircle size={18} />,
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
                  {exchangeListings.map((ticker: Ticker, index: number) => (
                    <tr
                      key={index}
                      className="border-b border-dark-400 hover:bg-dark-400/60 hover:scale-[1.01] transition-all duration-200"
                    >
                      <td className="exchange-name px-5 py-5">
                        <a
                          href={ticker.trade_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold hover:text-green-400 transition-all duration-200 hover:underline"
                        >
                          {ticker.market.name}
                        </a>
                      </td>

                      <td className="pair px-5 py-5">
                        {ticker.base}/{ticker.target}
                      </td>

                      <td className="price-cell px-5 py-5 font-semibold">
                        {formatCurrency(ticker.last)}
                      </td>

                      <td className="px-5 py-5 font-medium">
                        {formatCurrency(
                          ticker.converted_volume?.usd ?? ticker.volume,
                        )}
                      </td>

                      <td className="px-5 py-5">
                        <a
                          href={ticker.trade_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-green-400 hover:text-green-300 font-medium transition"
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
        <div className="details fade-up space-y-5">
          <h4 className="text-2xl font-bold mb-5">Market Statistics</h4>

          <ul className="details-grid">
            {coinDetails.map(
              ({ label, value, icon, link, linkText }, index) => (
                <li
                  key={index}
                  className="rounded-xl bg-dark-500 border border-dark-400 p-4 transition-all hover:border-green-500/50 hover:shadow-lg"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="text-green-500 shrink-0">{icon}</div>

                    <p className="text-sm text-purple-100/60 whitespace-nowrap">
                      {label}
                    </p>
                  </div>

                  {link && link.trim() !== "" ? (
                    <div className="flex items-center gap-2 text-green-400 font-semibold">
                      <Link href={link} target="_blank">
                        {linkText || label}
                      </Link>

                      <ArrowUpRight size={16} />
                    </div>
                  ) : (
                    <p className="text-base font-semibold text-white wrap-break-word leading-snug">
                      {value}
                    </p>
                  )}
                </li>
              ),
            )}
          </ul>
        </div>
        <div className="exchange-section">
          <h4>Top Gainers & Losers</h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
            <div className="bg-dark-500 rounded-xl p-4">
              <h5 className="text-green-500 font-semibold mb-3">
                📈 Top Gainers
              </h5>

              {topGainers.map((coin) => (
                <div
                  key={coin.id}
                  className="flex justify-between py-2 transition-all duration-200 hover:translate-x-1"
                >
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
                <div
                  key={coin.id}
                  className="flex justify-between py-2 transition-all duration-200 hover:translate-x-1"
                >
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
