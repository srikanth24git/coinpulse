"use client";

import { useEffect, useState } from "react";
import { isFavorite, toggleFavorite } from "@/lib/watchlist";

interface Props {
  coinId: string;
}

export default function WatchlistButton({ coinId }: Props) {
  const [favorite, setFavorite] = useState(false);

  useEffect(() => {
    setFavorite(isFavorite(coinId));
  }, [coinId]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent future row click handlers

    toggleFavorite(coinId);

    setFavorite(isFavorite(coinId));
  };

  return (
    <button
      onClick={handleClick}
      className="text-xl transition-all duration-200 hover:scale-125 cursor-pointer"
      aria-label="Toggle Watchlist"
    >
      {favorite ? "⭐" : "☆"}
    </button>
  );
}
