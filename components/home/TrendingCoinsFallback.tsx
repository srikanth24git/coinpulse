import DataTable from "../DataTable";
import { Skeleton } from "../ui/skeleton";

const columns = [
  {
    header: "Name",
    cell: () => <Skeleton className="category-skeleton" />,
  },
  {
    header: "24h",
    cell: () => <Skeleton className="value-skeleton-md" />,
  },
  {
    header: "Price",
    cell: () => <Skeleton className="value-skeleton-lg" />,
  },
];

const rows = Array.from({ length: 5 }, (_, i) => ({ id: i }));

export default function TrendingCoinsFallback() {
  return (
    <div id="trending-coins-fallback">
      <DataTable data={rows} columns={columns} rowKey={(row) => row.id} />
    </div>
  );
}
