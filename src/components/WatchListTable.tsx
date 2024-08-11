"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Star, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const initialData: Crypto[] = [
  {
    id: "1",
    rank: 1,
    name: "Bitcoin",
    token: "BTC",
    price: 64732.19,
    onehour: 0.16,
    twentyfourhour: 0.16,
    sevendays: 0.16,
    marketcap: 1234567890,
    volume: 1234567890,
    volumeEqu: 643045,
    circulatingSupply: 1234567890,
  },
];

export type Crypto = {
  id: string;
  rank: number;
  name: string;
  token: string;
  price: number;
  onehour: number;
  twentyfourhour: number;
  sevendays: number;
  marketcap: number;
  volume: number;
  volumeEqu: number;
  circulatingSupply: number;
};

export const amountFormatter = (value: any) => {
  const hasDecimals = value % 1 !== 0;
  return new Intl.NumberFormat("en-US", {
    style: "decimal",
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: hasDecimals ? 2 : 0,
  }).format(value);
};

export function WatchlistTable() {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [loading, setLoading] = React.useState(false); // Loading state
  const [data, setData] = React.useState(initialData); // Watchlist data state
  const router = useRouter();

  const columns: ColumnDef<Crypto>[] = [
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        return (
          <Button
            variant='ghost'
            className='h-8 w-8 p-0'
            onClick={() => handleRemoveFromWatchlist(row.original.id)}
            disabled={loading} // Disable button during loading
          >
            {loading ? (
              <Loader2 className='h-4 w-4 animate-spin' />
            ) : (
              <Star className='h-4 w-4 text-yellow-500 fill-yellow-500' />
            )}
          </Button>
        );
      },
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <div className='capitalize'>
          {row.getValue("name")} {row.original.token}
        </div>
      ),
    },
    {
      accessorKey: "price",
      header: "Price",
      cell: ({ row }) => (
        <div className='capitalize'>
          ${amountFormatter(row.getValue("price"))}
        </div>
      ),
    },
    {
      accessorKey: "onehour",
      header: "1h %",
      cell: ({ row }) => (
        <div className='capitalize'>{row.getValue("onehour")} %</div>
      ),
    },
    {
      accessorKey: "twentyfourhour",
      header: "24h %",
      cell: ({ row }) => (
        <div className='capitalize'>{row.getValue("twentyfourhour")} %</div>
      ),
    },
    {
      accessorKey: "sevendays",
      header: "7d %",
      cell: ({ row }) => (
        <div className='capitalize'>{row.getValue("sevendays")} %</div>
      ),
    },
    {
      accessorKey: "marketcap",
      header: "Market Cap",
      cell: ({ row }) => (
        <div className='capitalize'>$ {row.getValue("marketcap")}</div>
      ),
    },
    {
      accessorKey: "volume",
      header: "Volume(24h)",
      cell: ({ row }) => (
        <div className='capitalize'>
          ${amountFormatter(row.getValue("volume"))}
          <div className='text-xs text-gray-500 '>
            {amountFormatter(row.original.volumeEqu)} {row.original.token}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "circulatingSupply",
      header: "Circulating Supply",
      cell: ({ row }) => (
        <div className='capitalize'>
          {amountFormatter(row.getValue("circulatingSupply"))} {""}
          {row.original.token}
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  const handleRemoveFromWatchlist = async (id: string) => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate loading
    setData((prevData) => prevData.filter((coin) => coin.id !== id));
    setLoading(false);
  };

  return (
    <div className='w-full'>
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className='h-24 text-center'
                >
                  <div className='text-center py-10'>
                    <p className='mb-4 text-lg font-semibold'>
                      Your watchlist is empty.
                    </p>
                    <Button onClick={() => router.push("/dashboard")}>
                      Add Coins to Watchlist
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
