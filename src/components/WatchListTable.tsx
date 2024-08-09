"use client";

import * as React from "react";
import { Star, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
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

const data: Crypto[] = [
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

export const columns: ColumnDef<Crypto>[] = [
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      return (
        <Button variant='ghost' className='h-8 w-8 p-0'>
          <Star className='h-4 w-4' />
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

export function WatchlistTable() {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

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

  return (
    <div className='w-full'>
      <div className='flex items-center py-4'>
        <div className='relative max-w-sm'>
          <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
          <Input
            type='search'
            placeholder='Search for a coin'
            value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("name")?.setFilterValue(event.target.value)
            }
            className='pl-10'
          />
        </div>
      </div>
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
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
