import DataTable from "../DataTable";

const CategoriesFallback = () => {
  const columns = [
    {
      header: "Category",
      cell: () => (
        <div className="h-5 w-28 rounded bg-dark-400 animate-pulse" />
      ),
    },
    {
      header: "Top-Gainers",
      cell: () => (
        <div className="flex gap-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="w-7 h-7 rounded-full bg-dark-400 animate-pulse"
            />
          ))}
        </div>
      ),
    },
    {
      header: "24h Change",
      cell: () => (
        <div className="h-5 w-16 rounded bg-dark-400 animate-pulse" />
      ),
    },
    {
      header: "Market Cap",
      cell: () => (
        <div className="h-5 w-20 rounded bg-dark-400 animate-pulse" />
      ),
    },
    {
      header: "24h Volume",
      cell: () => (
        <div className="h-5 w-20 rounded bg-dark-400 animate-pulse" />
      ),
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
