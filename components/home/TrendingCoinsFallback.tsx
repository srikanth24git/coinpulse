import DataTable from "../DataTable";

const columns = [
  {
    header: "Name",
    cell: () => <div className="h-5 w-32 bg-white/10 rounded" />,
  },
  {
    header: "24h",
    cell: () => <div className="h-5 w-20 bg-white/10 rounded" />,
  },
  {
    header: "Price",
    cell: () => <div className="h-5 w-24 bg-white/10 rounded" />,
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
