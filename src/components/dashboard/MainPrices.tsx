"use client";

import * as React from "react";
import { ChevronDownIcon, Star, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
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

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  {
    id: "2",
    rank: 2,
    name: "Ethereum",
    token: "ETH",
    price: 4321.45,
    onehour: -0.32,
    twentyfourhour: 2.58,
    sevendays: -1.23,
    marketcap: 543210987,
    volume: 987654321,
    volumeEqu: 876543,
    circulatingSupply: 987654321,
  },
  {
    id: "3",
    rank: 3,
    name: "Ripple",
    token: "XRP",
    price: 1.23,
    onehour: 0.54,
    twentyfourhour: -0.45,
    sevendays: 3.45,
    marketcap: 234567890,
    volume: 123456789,
    volumeEqu: 234567,
    circulatingSupply: 1234567890,
  },
  {
    id: "4",
    rank: 4,
    name: "Litecoin",
    token: "LTC",
    price: 312.89,
    onehour: 0.12,
    twentyfourhour: 1.45,
    sevendays: -0.89,
    marketcap: 456789012,
    volume: 345678901,
    volumeEqu: 123456,
    circulatingSupply: 654321098,
  },
  {
    id: "5",
    rank: 5,
    name: "Cardano",
    token: "ADA",
    price: 2.45,
    onehour: -0.12,
    twentyfourhour: 3.12,
    sevendays: 1.78,
    marketcap: 567890123,
    volume: 234567890,
    volumeEqu: 765432,
    circulatingSupply: 789012345,
  },
  {
    id: "6",
    rank: 6,
    name: "Polkadot",
    token: "DOT",
    price: 45.67,
    onehour: 0.34,
    twentyfourhour: -0.56,
    sevendays: 2.34,
    marketcap: 678901234,
    volume: 123456789,
    volumeEqu: 987654,
    circulatingSupply: 890123456,
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
    accessorKey: "rank",
    header: "#",
    cell: ({ row }) => <div className='capitalize'>{row.getValue("rank")}</div>,
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
  //   {
  //     accessorKey: "email",
  //     header: ({ column }) => {
  //       return (
  //         <Button
  //           variant='ghost'
  //           onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
  //         >
  //           Email
  //           <ArrowDownUp className='ml-2 h-4 w-4' />
  //         </Button>
  //       );
  //     },
  //     cell: ({ row }) => <div className='lowercase'>{row.getValue("email")}</div>,
  //   },
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

export function MainPrices() {
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
            placeholder='Search for a market'
            value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("name")?.setFilterValue(event.target.value)
            }
            className='pl-10'
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='outline' className='ml-auto'>
              Filter <ChevronDownIcon className='ml-2 h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className='capitalize'
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
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
