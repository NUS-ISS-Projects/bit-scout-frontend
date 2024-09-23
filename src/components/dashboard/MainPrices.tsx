"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  Star,
  Search,
  MinusIcon,
} from "lucide-react";
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

import axios from "axios";
import { Client } from "@stomp/stompjs";

const WATCHLIST_API = process.env.NEXT_PUBLIC_API_BASE_URL;
const WS_ENDPOINT = `${process.env.NEXT_PUBLIC_API_BASE_URL?.replace(
  "http",
  "ws"
)}/coin`;

export type Crypto = {
  id: string;
  rank: number;
  name: string;
  token: string;
  price: number;
  previousPrice: number;
  sortOrder: number;
};

export type PriceUpdateDto = {
  token: string;
  price: number;
};

export const amountFormatter = (value: any) => {
  const hasDecimals = value % 1 !== 0;
  return new Intl.NumberFormat("en-US", {
    style: "decimal",
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: hasDecimals ? 2 : 0,
  }).format(value);
};

export function MainPrices() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [loading, setLoading] = useState(false);
  const [favourites, setFavourites] = useState<{
    [key: string]: boolean;
  }>({});
  const userId = 1; //Mock User ID
  const [cryptos, setCryptos] = useState<Crypto[]>([]);
  const dataBuffer = useRef<{ [token: string]: PriceUpdateDto }>({});
  const selectedCoins = [
    "btcusdt", // #1 Bitcoin
    "ethusdt", // #2 Ethereum
    "bnbusdt", // #3 BNB
    "solusdt", // #4 Solana
    "usdcusdt", // #5 USD Coin
    "xrpusdt", // #6 XRP
    "dogeusdt", // #7 Dogecoin
    "tonusdt", // #8 Toncoin
    "trxusdt", // #9 Tron
    "adausdt", //#10 Cardano
  ];

  const coinOrderMap = selectedCoins.reduce(
    (acc: Record<string, number>, token, index) => {
      acc[token.toUpperCase()] = index;
      return acc;
    },
    {} as Record<string, number>
  );

  const tokenNameMap: Record<string, string> = {
    BTCUSDT: "Bitcoin",
    ETHUSDT: "Ethereum",
    BNBUSDT: "Binance Coin",
    SOLUSDT: "Solana",
    USDCUSDT: "USD Coin",
    XRPUSDT: "Ripple",
    DOGEUSDT: "Dogecoin",
    TONUSDT: "Toncoin",
    TRXUSDT: "Tron",
    ADAUSDT: "Cardano",
  };

  const fetchWatchlist = async () => {
    try {
      const response = await axios.get(`${WATCHLIST_API}/${userId}`);
      const watchlist = response.data.cryptoIds;
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

  const handleSubscribe = async () => {
    try {
      const response = await axios.post(
        `${WATCHLIST_API}/api/v1/coin/subscribe`,
        selectedCoins
      );
      // console.log(response.data);
    } catch (error) {
      console.error("Error subscribing to coins:", error);
    }
  };

  useEffect(() => {
    handleSubscribe();
  }, []);

  useEffect(() => {
    const stompClient = new Client({
      webSocketFactory: () => new WebSocket(WS_ENDPOINT),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: (str) => {
        console.log(str);
      },
    });
    stompClient.onConnect = () => {
      console.log("Connected to STOMP over WebSocket");
      stompClient.subscribe("/topic/price-updates", (message) => {
        if (message.body) {
          const data = JSON.parse(message.body);
          console.log(data);
          dataBuffer.current[data.token.toUpperCase()] = data;
        }
      });
    };
    stompClient.activate();

    const intervalId = setInterval(() => {
      const bufferedData = dataBuffer.current;
      dataBuffer.current = {};

      if (Object.keys(bufferedData).length > 0) {
        setCryptos((prevCryptos) => {
          let updatedCryptos = [...prevCryptos];
          Object.values(bufferedData).forEach((data) => {
            const token = data.token.toUpperCase();
            const index = updatedCryptos.findIndex(
              (crypto) => crypto.token === token
            );
            const sortOrder =
              coinOrderMap[token] !== undefined
                ? coinOrderMap[token]
                : updatedCryptos.length;

            const name = tokenNameMap[token] || token;

            if (index !== -1) {
              const previousPrice = updatedCryptos[index].price;
              updatedCryptos[index] = {
                ...updatedCryptos[index],
                price: data.price,
                previousPrice: previousPrice,
              };
            } else {
              updatedCryptos.push({
                id: data.token,
                rank: sortOrder + 1,
                name: name,
                token: data.token.toUpperCase(),
                price: data.price,
                previousPrice: data.price,
                sortOrder: sortOrder,
              });
            }
          });
          updatedCryptos.sort((a, b) => a.sortOrder - b.sortOrder);
          updatedCryptos = updatedCryptos.map((crypto, index) => ({
            ...crypto,
            rank: index + 1,
          }));
          return updatedCryptos;
        });
      }
    }, 4000);

    return () => {
      stompClient.deactivate();
      clearInterval(intervalId);
    };

    //fetchWatchlist();
  }, [selectedCoins]);

  const toggleFavourite = async (cryptoId: string) => {
    setLoading(true);

    try {
      // Make a POST request to add the crypto to the user's watchlist
      await axios.post(`${WATCHLIST_API}/${userId}/add?cryptoId=${cryptoId}`);

      // Update the local state after a successful POST request
      setFavourites((prev) => ({
        ...prev,
        [cryptoId]: true,
      }));
    } catch (error) {
      console.error("Failed to update watchlist:", error);
      // Optionally handle the error (e.g., show a notification)
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
            onClick={() => toggleFavourite(row.original.token)}
            disabled={loading}
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
      accessorKey: "rank",
      header: "#",
      cell: ({ row }) => (
        <div className='capitalize'>{row.getValue("rank")}</div>
      ),
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => {
        const name = row.getValue("name") as string;
        const tokenSymbol = row.original.token.replace("USDT", "");
        return (
          <div className='capitalize'>
            {name} {tokenSymbol}
          </div>
        );
      },
    },
    {
      accessorKey: "price",
      header: "Price",
      cell: ({ row }) => {
        const price = row.getValue("price") as number;
        const previousPrice = row.original.previousPrice;
        const priceChange = price - previousPrice;

        const priceColor =
          priceChange > 0
            ? "text-green-500"
            : priceChange < 0
            ? "text-red-500"
            : "text-black";
        const ArrowIcon =
          priceChange > 0
            ? ChevronUpIcon
            : priceChange < 0
            ? ChevronDownIcon
            : MinusIcon;

        return (
          <div className={`flex items-center ${priceColor}`}>
            {ArrowIcon && <ArrowIcon className='w-4 h-4 mr-1' />} $
            {amountFormatter(price)}
          </div>
        );
      },
    },
    // {
    //   accessorKey: "onehour",
    //   header: "1h %",
    //   cell: ({ row }) => (
    //     <div className='capitalize'>{row.getValue("onehour")} %</div>
    //   ),
    // },
    // {
    //   accessorKey: "twentyfourhour",
    //   header: "24h %",
    //   cell: ({ row }) => (
    //     <div className='capitalize'>{row.getValue("twentyfourhour")} %</div>
    //   ),
    // },
    // {
    //   accessorKey: "sevendays",
    //   header: "7d %",
    //   cell: ({ row }) => (
    //     <div className='capitalize'>{row.getValue("sevendays")} %</div>
    //   ),
    // },
    // {
    //   accessorKey: "marketcap",
    //   header: "Market Cap",
    //   cell: ({ row }) => (
    //     <div className='capitalize'>$ {row.getValue("marketcap")}</div>
    //   ),
    // },
    // {
    //   accessorKey: "volume",
    //   header: "Volume(24h)",
    //   cell: ({ row }) => (
    //     <div className='capitalize'>
    //       ${amountFormatter(row.getValue("volume"))}
    //       <div className='text-xs text-gray-500 '>
    //         {amountFormatter(row.original.volumeEqu)} {row.original.token}
    //       </div>
    //     </div>
    //   ),
    // },
    // {
    //   accessorKey: "circulatingSupply",
    //   header: "Circulating Supply",
    //   cell: ({ row }) => (
    //     <div className='capitalize'>
    //       {amountFormatter(row.getValue("circulatingSupply"))} {""}
    //       {row.original.token}
    //     </div>
    //   ),
    // },
  ];

  const table = useReactTable({
    data: cryptos,
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
