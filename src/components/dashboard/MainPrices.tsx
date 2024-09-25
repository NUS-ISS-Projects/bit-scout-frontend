"use client";

import React, { useEffect, useState, useRef } from "react";
import { ChevronDownIcon, ChevronUpIcon, Star, MinusIcon } from "lucide-react";
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

import { useRouter } from "next/navigation";
import Image from "next/image";
import axios from "axios";
import { Client } from "@stomp/stompjs";

const SUBSCRIBE_API = process.env.NEXT_PUBLIC_API_BASE_URL;
const WATCHLIST_API = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/watchlist`;
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
  const router = useRouter();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [loading, setLoading] = useState(false);
  const [favourites, setFavourites] = useState<{
    [key: string]: boolean;
  }>({});
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
    const token = localStorage.getItem("authToken");
    if (!token) {
      router.push("/login");
      return;
    }
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    try {
      const response = await axios.get(`${WATCHLIST_API}/getWatchList`, config);
      const watchlist = response.data.cryptoIds;
      const favouritesMap = watchlist.reduce(
        (acc: { [key: string]: boolean }, crypto: string) => {
          acc[crypto.toLowerCase()] = true;
          return acc;
        },
        {}
      );
      setFavourites(favouritesMap);
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        console.log("Watchlist not found, creating a new one...");
        try {
          await axios.post(
            `${WATCHLIST_API}/api/watchlist/create`,
            { cryptoIds: [] },
            config
          );

          setFavourites({});
        } catch (creationError) {
          console.error("Failed to create a new watchlist:", creationError);
        }
      } else {
        console.error("Failed to fetch watchlist:", error);
      }
    }
  };

  const handleSubscribe = async () => {
    try {
      await axios.post(`${SUBSCRIBE_API}/api/v1/coin/subscribe`, selectedCoins);
    } catch (error) {
      console.error("Error subscribing to coins:", error);
    }
  };

  useEffect(() => {
    handleSubscribe();
    fetchWatchlist();
  }, []);

  useEffect(() => {
    const stompClient = new Client({
      webSocketFactory: () => new WebSocket(WS_ENDPOINT),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: () => {
        null;
      },
      // debug: (str) => {
      //   console.log(str);
      // },
    });
    stompClient.onConnect = () => {
      console.log("Connected to STOMP over WebSocket");
      stompClient.subscribe("/topic/price-updates", (message) => {
        if (message.body) {
          const data = JSON.parse(message.body);
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
  }, [selectedCoins]);

  const toggleFavourite = async (cryptoId: string) => {
    setLoading(true);

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        router.push("/login");
        return;
      }
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          cryptoId: cryptoId.toLowerCase(),
        },
      };

      const isFavourited = favourites[cryptoId.toLowerCase()];

      if (isFavourited) {
        // Remove from favourites
        await axios.delete(`${WATCHLIST_API}/remove`, config);
      } else {
        // Add to favourites
        await axios.post(`${WATCHLIST_API}/add`, null, config);
      }

      setFavourites((prev) => ({
        ...prev,
        [cryptoId.toLowerCase()]: !isFavourited,
      }));
    } catch (error) {
      console.error("Failed to update watchlist:", error);
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnDef<Crypto>[] = [
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const isFavourited = favourites[row.original.token.toLowerCase()];
        return (
          <Button
            variant='ghost'
            className='h-8 w-8 p-0'
            onClick={() => toggleFavourite(row.original.token.toLowerCase())}
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
        const imageName = tokenSymbol.toLowerCase();
        const imageSrc = `/coins/${imageName}.png`;
        return (
          <div className='capitalize flex items-center'>
            <Image
              src={imageSrc}
              width={24}
              height={24}
              alt={`${name} logo`}
              className='mr-5'
            />
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
