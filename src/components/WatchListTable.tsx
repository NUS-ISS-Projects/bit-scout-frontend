"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Star, ChevronDownIcon, ChevronUpIcon, MinusIcon } from "lucide-react";
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
import Image from "next/image";
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

export function WatchlistTable() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [loading, setLoading] = useState(false);
  const [favourites, setFavourites] = useState<{
    [key: string]: boolean;
  }>({});
  const router = useRouter();
  const [watchlistData, setWatchlistData] = useState<Crypto[]>([]);

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

  useEffect(() => {
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
        const response = await axios.get(
          `${WATCHLIST_API}/getWatchList`,
          config
        );
        const watchlist = response.data.cryptoIds;
        const favouritesMap = watchlist.reduce(
          (acc: { [key: string]: boolean }, crypto: string) => {
            acc[crypto.toLowerCase()] = true;
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
    handleSubscribe();
  }, []);

  const handleSubscribe = async () => {
    try {
      await axios.post(`${SUBSCRIBE_API}/api/v1/coin/subscribe`, selectedCoins);
    } catch (error) {
      console.error("Error subscribing to coins:", error);
    }
  };

  useEffect(() => {
    const stompClient = new Client({
      webSocketFactory: () => new WebSocket(WS_ENDPOINT),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: () => {
        null;
      },
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
        setWatchlistData((prevCryptos) => {
          let updatedCryptos = [...prevCryptos];

          updatedCryptos = updatedCryptos.filter(
            (crypto) => favourites[crypto.token.toLowerCase()]
          );

          Object.values(bufferedData).forEach((data) => {
            const token = data.token.toUpperCase();

            if (!favourites[token.toLowerCase()]) {
              return;
            }

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
                sortOrder: sortOrder,
              };
            } else {
              updatedCryptos.push({
                id: data.token,
                rank: sortOrder + 1,
                name: name,
                token: token,
                price: data.price,
                previousPrice: data.price,
                sortOrder: sortOrder,
              });
            }
          });

          updatedCryptos = updatedCryptos.filter(
            (crypto) => favourites[crypto.token.toLowerCase()]
          );

          updatedCryptos.sort((a, b) => a.sortOrder - b.sortOrder);
          updatedCryptos = updatedCryptos.map((crypto, index) => ({
            ...crypto,
            rank: index + 1,
          }));
          return updatedCryptos;
        });
      }
    }, 2000);

    return () => {
      stompClient.deactivate();
      clearInterval(intervalId);
    };
  }, [selectedCoins, favourites]);

  const handleRemoveFromWatchlist = async (cryptoId: string) => {
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
      await axios.delete(`${WATCHLIST_API}/remove`, config);

      setFavourites((prevFavourites) => {
        const newFavourites = { ...prevFavourites };
        delete newFavourites[cryptoId.toLowerCase()];
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
        const isFavourited = favourites[row.original.token.toLowerCase()];
        return (
          <Button
            variant='ghost'
            className='h-8 w-8 p-0'
            onClick={() =>
              handleRemoveFromWatchlist(row.original.token.toLowerCase())
            }
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
