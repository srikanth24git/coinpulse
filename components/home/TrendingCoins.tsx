import React from "react";
import { fetcher } from "@/lib/coingecko.actions";
import DataTable from "../DataTable";
import { TrendingUp, TrendingDown } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import TrendingCoinsFallback from "./TrendingCoinsFallback";
import { formatCurrency, formatPercentage } from "@/lib/utils";

const TrendingCoins = async () => {
  let trendingCoins;
  try {
    trendingCoins = await fetcher<TrendingCoinsResponse>("search/trending");
  } catch (error) {
    console.error("Error fetching trending coins:", error);
    return <TrendingCoinsFallback />;
  }

  const columns: DataTableColumn<TrendingCoin>[] = [
    {
      header: "Name",
      cellClassName: "name-cell",
      cell: (coin) => {
        const item = coin.item;

        return (
          <Link href={`/coins/${item.id}`}>
            <Image src={item.thumb} alt={item.name} width={36} height={36} />
            <p>{item.name}</p>
          </Link>
        );
      },
    },
    {
      header: "24h Change",
      cellClassName: "name-cell",
      cell: (coin) => {
        const item = coin.item;
        const change = item.data.price_change_percentage_24h.usd;
        const isTrendingUp = change > 0;

        return (
          <div
            className={`price-change ${isTrendingUp ? "text-green-500" : "text-red-500"}`}
          >
            <p className="flex items-center">
              {formatPercentage(item.data.price_change_percentage_24h.usd)}
              {isTrendingUp ? (
                <TrendingUp width={16} height={16} />
              ) : (
                <TrendingDown width={16} height={16} />
              )}
            </p>
          </div>
        );
      },
    },
    {
      header: "Price",
      cellClassName: "price-cell",
      cell: (coin) => {
        const item = coin.item;
        return <span>${item.data.price.toLocaleString()}</span>;
      },
    },
  ];
  return (
    <>
      <div id="trending-coins" className="xl:col-span-1 h-full">
        <h4>Trending Coins</h4>

        <DataTable
          data={trendingCoins.coins.slice(0, 5)}
          columns={columns}
          rowKey={(coin) => coin.item.id}
          tableClassName="trending-coins-table h-full"
          headerCellClassName="py-3!"
          bodyCellClassName="py-2!"
        />
      </div>
    </>
  );
};

export default TrendingCoins;
