import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

const DataTable = <T,>({
  columns,
  data,
  rowKey,
  tableClassName,
  headerClassName,
  headerRowClassName,
  headerCellClassName,
  bodyRowClassName,
  bodyCellClassName,
}: DataTableProps<T>) => {
  return (
    <Table className={cn("custom-scrollbar", tableClassName)}>
      <TableHeader>
        <TableRow>
          <TableHead style={{ background: "red", color: "white" }}>A</TableHead>
          <TableHead style={{ background: "blue", color: "white" }}>
            B
          </TableHead>
          <TableHead style={{ background: "green", color: "white" }}>
            C
          </TableHead>
          <TableHead style={{ background: "purple", color: "white" }}>
            D
          </TableHead>
          <TableHead style={{ background: "orange", color: "white" }}>
            E
          </TableHead>
          <TableHead style={{ background: "black", color: "white" }}>
            F
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((row, rowIndex) => (
          <TableRow
            key={rowKey(row, rowIndex)}
            className={cn(
              "overflow-hidden rounded-lg border-b border-purple-100/5 hover:bg-dark-400/30! relative",
              bodyRowClassName,
            )}
          >
            {columns.map((column, columnIndex) => {
              console.log("CELL", columnIndex);

              return (
                <TableCell
                  key={columnIndex}
                  className={cn(
                    "py-4 first:pl-5 last:pr-5",
                    bodyCellClassName,
                    column.cellClassName,
                  )}
                >
                  {column.cell(row, rowIndex)}
                </TableCell>
              );
            })}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
export default DataTable;
