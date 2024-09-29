"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Trash,
  Search,
  ChevronDownIcon,
  ChevronUpIcon,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/components/hooks/use-toast";
import { useNotification } from "@/contexts/NotificationContext";

import axios from "axios";
import Image from "next/image";
import { Client } from "@stomp/stompjs";
const NOTIFICATION_API = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/notifications`;
const USER_API = `${process.env.NEXT_PUBLIC_API_BASE_URL}/account/userId`;
const WS_ENDPOINT_NOTIFICATIONS = `${process.env.NEXT_PUBLIC_API_BASE_URL?.replace(
  "http",
  "ws"
)}/notifications`;
const WS_ENDPOINT_COIN = `${process.env.NEXT_PUBLIC_API_BASE_URL?.replace(
  "http",
  "ws"
)}/coin`;

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

interface NotificationDto {
  userId: string;
  token: string;
  notificationType: string;
  notificationValue: number;
  remarks: string;
  currentPrice: number;
}

export type Alert = {
  id?: string;
  name: string;
  token: string;
  alertType: string;
  currentPrice: number | null;
  previousPrice: number | null;
  alertValue: number;
  remarks: string;
  lastNotifiedAt?: number | null;
};

export type PriceUpdateDto = {
  token: string;
  price: number;
};

export const amountFormatter = (value: any) => {
  if (value == null || isNaN(value)) return "N/A";
  const hasDecimals = value % 1 !== 0;
  return new Intl.NumberFormat("en-US", {
    style: "decimal",
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: hasDecimals ? 2 : 0,
  }).format(value);
};

export function AlertsTable() {
  const router = useRouter();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [manageMode, setManageMode] = useState(false);

  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [userId, setUserId] = useState("");

  const fetchUserId = async () => {
    const authToken = localStorage.getItem("authToken");
    if (!authToken) {
      router.push("/login");
      return;
    }
    try {
      const userIdResponse = await axios.get(`${USER_API}?token=${authToken}`);
      setUserId(userIdResponse.data);
    } catch (error) {
      console.error("Error fetching user ID:", error);
    }
  };

  const fetchAlerts = async () => {
    const authToken = localStorage.getItem("authToken");
    if (!authToken) {
      router.push("/login");
      return;
    }

    try {
      const response = await axios.get(`${NOTIFICATION_API}/getUserList`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      const mappedAlerts = response.data.map((alert: any) => ({
        name: tokenNameMap[alert.token.toUpperCase()] || alert.token,
        token: alert.token.toUpperCase(),
        alertType: alert.notificationType,
        alertValue: alert.notificationValue,
        remarks: alert.remarks,
      }));
      setAlerts(mappedAlerts);
    } catch (error: any) {
      console.error(
        "Error fetching alerts:",
        error.response?.data || error.message || error
      );
    }
  };

  useEffect(() => {
    fetchAlerts();
    fetchUserId();
  }, []);

  // Notification WebSocket
  useEffect(() => {
    if (!userId) return;
    const stompClient = new Client({
      webSocketFactory: () => new WebSocket(WS_ENDPOINT_NOTIFICATIONS),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: () => {
        null;
      },
    });

    stompClient.onConnect = () => {
      console.log("Connected to Notification WebSocket");

      stompClient.subscribe(`/topic/notifications/${userId}`, (message) => {
        if (message.body) {
          const data = JSON.parse(message.body);
          handleNotification(data);
        }
      });
    };
    stompClient.activate();

    return () => {
      stompClient.deactivate();
    };
  }, [userId]);

  const tokensSetRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    tokensSetRef.current = new Set(
      alerts.map((alert) => alert.token.toUpperCase())
    );
  }, [alerts]);

  // Coin WebSocket
  useEffect(() => {
    if (alerts.length === 0) return;

    // const tokensSet = new Set(alerts.map((alert) => alert.token.toUpperCase()));
    const stompClientCoin = new Client({
      webSocketFactory: () => new WebSocket(WS_ENDPOINT_COIN),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: () => null,
    });

    stompClientCoin.onConnect = () => {
      console.log("Connected to Coin WebSocket");
      stompClientCoin.subscribe("/topic/price-updates", (message) => {
        if (message.body) {
          const data: PriceUpdateDto = JSON.parse(message.body);
          const token = data.token.toUpperCase();

          if (tokensSetRef.current.has(token)) {
            setAlerts((prevAlerts) =>
              prevAlerts.map((alert) => {
                if (alert.token.toUpperCase() === token) {
                  const previousPrice = alert.currentPrice ?? data.price;
                  return {
                    ...alert,
                    previousPrice: previousPrice,
                    currentPrice: data.price,
                  };
                }
                return alert;
              })
            );
          }
        }
      });
    };

    stompClientCoin.activate();

    return () => {
      stompClientCoin.deactivate();
    };
  }, []);

  const handleNotification = (data: NotificationDto) => {
    const now = Date.now();

    setAlerts((prevAlerts) =>
      prevAlerts.map((alert) => {
        if (alert.token.toUpperCase() === data.token.toUpperCase()) {
          const timeSinceLastNotification = alert.lastNotifiedAt
            ? now - alert.lastNotifiedAt
            : Infinity;
          if (timeSinceLastNotification >= 5000) {
            alertUser({
              ...alert,
              currentPrice: data.currentPrice,
            });

            return {
              ...alert,
              currentPrice: data.currentPrice,
              lastNotifiedAt: now,
            };
          } else {
            return {
              ...alert,
              currentPrice: data.currentPrice,
            };
          }
        }
        return alert;
      })
    );
  };

  const { toast } = useToast();
  const { notifications, setNotifications } = useNotification();

  const alertUser = (alert: Alert) => {
    const message = `Current Price (${amountFormatter(alert.currentPrice)}) ${
      alert.alertType
    } ${amountFormatter(alert.alertValue)}.`;

    setTimeout(() => {
      setNotifications((prev) => prev + 1);

      toast({
        title: `Alert Triggered for ${alert.name} (${alert.token})`,
        description: message,
        variant: "default",
      });
    }, 0);
  };

  const handleDeleteAlert = async (selectedTokens: string[]) => {
    const authToken = localStorage.getItem("authToken");
    if (!authToken) {
      router.push("/login");
      return;
    }

    if (!selectedTokens.length) {
      alert("No alerts selected for deletion!");
      return;
    }

    try {
      await Promise.all(
        selectedTokens.map((token) =>
          axios.delete(`${NOTIFICATION_API}/delete/${token}`, {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          })
        )
      );

      console.log("Selected notifications deleted successfully.");
      fetchAlerts();
    } catch (error: any) {
      console.error(
        "Error deleting alerts:",
        error.response?.data || error.message || error
      );
    }
  };

  const columns: ColumnDef<Alert>[] = [
    ...(manageMode
      ? [
          {
            id: "select",
            header: ({ table }: { table: any }) => (
              <input
                type='checkbox'
                checked={table.getIsAllRowsSelected()}
                onChange={table.getToggleAllRowsSelectedHandler()}
              />
            ),
            cell: ({ row }: { row: any }) => (
              <input
                type='checkbox'
                checked={row.getIsSelected()}
                onChange={row.getToggleSelectedHandler()}
              />
            ),
          },
        ]
      : []),
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
      accessorKey: "alertType",
      header: "Alert Type",
      cell: ({ row }) => (
        <div className='capitalize'>{row.getValue("alertType")}</div>
      ),
    },
    {
      accessorKey: "alertValue",
      header: "Alert Value",
      cell: ({ row }) => (
        <div className='capitalize'>
          ${amountFormatter(row.getValue("alertValue"))}
        </div>
      ),
    },
    {
      accessorKey: "currentPrice",
      header: "Current Price",
      cell: ({ row }) => {
        const currentPrice = row.original.currentPrice as number;
        const previousPrice = row.original.previousPrice as number;

        if (currentPrice == null) {
          return <div>N/A</div>;
        }

        if (previousPrice == null) {
          return <div>${amountFormatter(currentPrice)}</div>;
        }

        const priceChange = currentPrice - previousPrice;

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
            {amountFormatter(currentPrice)}
          </div>
        );
      },
    },
    {
      accessorKey: "remarks",
      header: "Remarks",
      cell: ({ row }) => (
        <div className='capitalize'>{row.getValue("remarks")}</div>
      ),
    },
    ...(manageMode
      ? [
          {
            id: "edit",
            header: "Edit",
            cell: ({ row }: { row: any }) => (
              <Button
                className='text-white'
                onClick={() =>
                  router.push(
                    `/dashboard/alerts/edit?token=${row.original.token}`
                  )
                }
              >
                Edit
              </Button>
            ),
          },
        ]
      : []),
  ];

  const table = useReactTable({
    data: alerts,
    columns,
    getRowId: (row) => row.token.toLowerCase(),
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
            placeholder='Search for an alert'
            value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("name")?.setFilterValue(event.target.value)
            }
            className='pl-10'
          />
        </div>
        <Button
          className='ml-4'
          onClick={() => router.push("/dashboard/alerts/add")}
        >
          Add Alert
        </Button>
        <Button className='ml-3' onClick={() => setManageMode(!manageMode)}>
          Manage Alert
        </Button>
        {manageMode && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                className='ml-3 bg-red-600 hover:bg-red-400'
                disabled={!Object.keys(rowSelection).length}
              >
                <Trash className='mr-2 h-4 w-4' />
                Delete Alert
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent aria-describedby='delete-description'>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete the alert?</AlertDialogTitle>
                <AlertDialogDescription id='delete-description'>
                  This action cannot be undone. This will permanently delete the
                  selected alerts from your list.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className=' bg-red-600 hover:bg-red-400'
                  onClick={() => handleDeleteAlert(Object.keys(rowSelection))}
                >
                  <Trash className='mr-2 h-4 w-4' />
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
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
                  <div className='text-center py-10'>
                    <p className='mb-4 text-lg font-semibold'>
                      Your alerts are empty.
                    </p>
                    <Button
                      onClick={() => router.push("/dashboard/alerts/add")}
                    >
                      Add alert
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
