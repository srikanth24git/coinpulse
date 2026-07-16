import DataTable from "../DataTable";
import { Skeleton } from "../ui/skeleton";

const CategoriesFallback = () => {
  const columns = [
    {
      header: "Category",
      cell: () => <Skeleton className="category-skeleton" />,
    },
    {
      header: "Top-Gainers",
      cell: () => (
        <div className="flex gap-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="coin-skeleton" />
          ))}
        </div>
      ),
    },
    {
      header: "24h Change",
      cell: () => <Skeleton className="value-skeleton-sm" />,
    },
    {
      header: "Market Cap",
      cell: () => <Skeleton className="value-skeleton-md" />,
    },
    {
      header: "24h Volume",
      cell: () => <Skeleton className="value-skeleton-md" />,
    },
  ];

  return (
    <div id="categories">
      <h4>Top Categories</h4>

      <DataTable
        columns={columns}
        data={Array.from({ length: 10 })}
        rowKey={(_, index) => index}
        tableClassName="mt-3"
      />
    </div>
  );
};

export default CategoriesFallback;
