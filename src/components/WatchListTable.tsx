"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Star, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import axios from "axios";
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

const WATCHLIST_API = process.env.NEXT_PUBLIC_WATCHLIST_API;

const mockData: Crypto[] = [
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

export function WatchlistTable() {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [loading, setLoading] = React.useState(false); // Loading state
  const [favourites, setFavourites] = React.useState<{
    [key: string]: boolean;
  }>({});
  const [data, setData] = React.useState(mockData); // Watchlist data state
  const router = useRouter();
  const [watchlistData, setWatchlistData] = React.useState<Crypto[]>([]);
  const userId = 1; //Mock User ID

  React.useEffect(() => {
    const fetchWatchlist = async () => {
      try {
        const response = await axios.get(`${WATCHLIST_API}/${userId}`);
        const watchlist = response.data.cryptoIds;

        // Filter the fullData to only include those in the watchlist
        const filtered = mockData.filter((crypto) =>
          watchlist.includes(crypto.token)
        );
        setWatchlistData(filtered);

        // Assuming the API returns an array of crypto IDs
        const favouritesMap = watchlist.reduce(
          (acc: { [key: string]: boolean }, crypto: string) => {
            acc[crypto] = true;
            return acc;
          },
          {}
        );

        setFavourites(favouritesMap);
      } catch (error) {
        console.error("Failed to fetch watchlist:", error);
      }
    };

    fetchWatchlist();
  }, [userId]);

  const handleRemoveFromWatchlist = async (cryptoId: string) => {
    setLoading(true);
    try {
      // Send a request to remove the crypto from the watchlist
      await axios.delete(
        `${WATCHLIST_API}/${userId}/remove?cryptoId=${cryptoId}`
      );

      // Remove the crypto from the local state
      setWatchlistData((prevData) =>
        prevData.filter((coin) => coin.token !== cryptoId)
      );

      // Update the favourites state
      setFavourites((prevFavourites) => {
        const newFavourites = { ...prevFavourites };
        delete newFavourites[cryptoId];
        return newFavourites;
      });
    } catch (error) {
      console.error("Failed to remove from watchlist:", error);
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnDef<Crypto>[] = [
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const isFavourited = favourites[row.original.token];
        return (
          <Button
            variant='ghost'
            className='h-8 w-8 p-0'
            onClick={() => handleRemoveFromWatchlist(row.original.token)}
            disabled={loading} // Disable button during loading
          >
            {isFavourited ? (
              <Star className='h-4 w-4 text-yellow-500 fill-yellow-500' />
            ) : (
              <Star className='h-4 w-4 text-black fill-white' />
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
    data: watchlistData,
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
            {watchlistData.length ? (
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
