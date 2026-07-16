import { Skeleton } from "../ui/skeleton";

const CoinOverviewFallback = () => {
  return (
    <div id="coin-overview-fallback">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Skeleton className="coin-skeleton" />

          <div className="space-y-2">
            <Skeleton className="value-skeleton-lg" />
            <Skeleton className="value-skeleton-md" />
          </div>
        </div>

        <Skeleton className="value-skeleton-sm" />
      </div>

      {/* Chart */}
      <Skeleton className="chart-skeleton h-[360px]" />

      {/* Buttons */}
      <div className="flex justify-end gap-2 mt-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="period-button-skeleton" />
        ))}
      </div>
    </div>
  );
};

export default CoinOverviewFallback;
