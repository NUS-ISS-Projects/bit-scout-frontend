"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Trash, Search } from "lucide-react";
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
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const data: Alert[] = [
  {
    id: "1",
    name: "Bitcoin",
    token: "BTC",
    alertType: "Price fail to",
    currentPrice: 64732.19,
    alertValue: 64732.19,
    remarks: "This is a remark",
  },
];

export type Alert = {
  id: string;
  name: string;
  token: string;
  alertType: string;
  currentPrice: number;
  alertValue: number;
  remarks: string;
};

export const amountFormatter = (value: any) => {
  const hasDecimals = value % 1 !== 0;
  return new Intl.NumberFormat("en-US", {
    style: "decimal",
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: hasDecimals ? 2 : 0,
  }).format(value);
};

export function AlertsTable() {
  const router = useRouter();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [manageMode, setManageMode] = React.useState(false);

  const columns: ColumnDef<Alert>[] = [
    ...(manageMode
      ? [
          {
            id: "select",
            header: ({ table }: { table: any }) => (
              <input
                type='checkbox'
                onChange={(e) => {
                  if (e.target.checked) {
                    table
                      .getRowModel()
                      .rows.forEach(({ row }: { row: any }) =>
                        row.toggleSelected(true)
                      );
                  } else {
                    table
                      .getRowModel()
                      .rows.forEach(({ row }: { row: any }) =>
                        row.toggleSelected(false)
                      );
                  }
                }}
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
      cell: ({ row }) => (
        <div className='capitalize'>
          {row.getValue("name")} {row.original.token}
        </div>
      ),
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
      cell: ({ row }) => (
        <div className='capitalize'>
          ${amountFormatter(row.getValue("currentPrice"))}
        </div>
      ),
    },
    {
      accessorKey: "remarks",
      header: "Remarks",
      cell: ({ row }) => (
        <div className='capitalize'>{row.getValue("remarks")}</div>
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
              <Button className='ml-3 bg-red-600 hover:bg-red-400'>
                <Trash className='mr-2 h-4 w-4' />
                Delete Alert
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete the alert?</AlertDialogTitle>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction className=' bg-red-600 hover:bg-red-400'>
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
