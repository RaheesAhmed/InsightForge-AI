"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  useTable,
  useSortBy,
  usePagination,
  useGlobalFilter,
} from "react-table";
import {
  Trash2,
  Loader2,
  ChevronDown,
  ChevronUp,
  Search,
  Eye,
  Shield,
  CheckCircle,
  XCircle,
  MoreVertical,
  FileText,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface User {
  id: string;
  email: string;
  name: string | null;
  imageUrl: string | null;
  createdAt: string;
  subscription: {
    plan: string;
    status: string;
    validUntil: string;
  } | null;
  stats: {
    questions: number;
    documents: number;
  };
}

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterInput, setFilterInput] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users");
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      const data = await response.json();
      setUsers(data);
      setLoading(false);
    } catch (err: any) {
      console.error("Error fetching users:", err);
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (userId: string) => {
    if (window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      try {
        const response = await fetch("/api/admin/users", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId }),
        });

        if (!response.ok) {
          throw new Error("Failed to delete user");
        }

        await fetchUsers();
      } catch (err: any) {
        console.error("Error deleting user:", err);
        setError(err.message);
      }
    }
  };

  const handleViewDetails = (user: User) => {
    setSelectedUser(user);
    setShowUserDetails(true);
  };

  const columns = useMemo(
    () => [
      {
        Header: "User",
        accessor: (row: User) => ({
          name: row.name || "Anonymous",
          email: row.email,
          imageUrl: row.imageUrl,
        }),
        Cell: ({ value }: { value: { name: string; email: string; imageUrl: string | null } }) => (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
              {value.imageUrl ? (
                <img src={value.imageUrl} alt={value.name} className="w-10 h-10 rounded-full" />
              ) : (
                <span className="text-slate-600 font-medium">
                  {value.name.charAt(0)}
                </span>
              )}
            </div>
            <div>
              <div className="font-medium text-slate-800">{value.name}</div>
              <div className="text-sm text-slate-500">{value.email}</div>
            </div>
          </div>
        ),
      },
      {
        Header: "Subscription",
        accessor: (row: User) => row.subscription,
        Cell: ({ value }: { value: User["subscription"] }) => (
          <div className="flex flex-col gap-1">
            <Badge variant={value?.status === "ACTIVE" ? "success" : "secondary"}>
              {value?.plan || "FREE"}
            </Badge>
            {value?.validUntil && (
              <span className="text-xs text-slate-500">
                Until {format(new Date(value.validUntil), "MMM d, yyyy")}
              </span>
            )}
          </div>
        ),
      },
      {
        Header: "Usage",
        accessor: (row: User) => row.stats,
        Cell: ({ value }: { value: User["stats"] }) => (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <MessageSquare className="w-4 h-4 text-slate-400" />
              <span>{value.questions}</span>
            </div>
            <div className="flex items-center gap-1">
              <FileText className="w-4 h-4 text-slate-400" />
              <span>{value.documents}</span>
            </div>
          </div>
        ),
      },
      {
        Header: "Joined",
        accessor: "createdAt",
        Cell: ({ value }: { value: string }) => (
          <span className="text-slate-600">
            {format(new Date(value), "MMM d, yyyy")}
          </span>
        ),
      },
      {
        Header: "Actions",
        Cell: ({ row }: { row: { original: User } }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="flex items-center gap-2"
                onClick={() => handleViewDetails(row.original)}
              >
                <Eye className="w-4 h-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex items-center gap-2 text-red-600 focus:text-red-600"
                onClick={() => handleDelete(row.original.id)}
              >
                <Trash2 className="w-4 h-4" />
                Delete User
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    []
  );

  const tableInstance = useTable(
    {
      columns,
      data: users,
      initialState: { pageIndex: 0, pageSize: 10 },
    },
    useGlobalFilter,
    useSortBy,
    usePagination
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    prepareRow,
    setGlobalFilter,
    nextPage,
    previousPage,
    canNextPage,
    canPreviousPage,
    pageOptions,
    state: { pageIndex },
  } = tableInstance;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Client Management</h2>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search users..."
            className="pl-8 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-slate-400"
            value={filterInput}
            onChange={(e) => {
              setFilterInput(e.target.value);
              setGlobalFilter(e.target.value);
            }}
          />
        </div>
      </div>

      <div className="rounded-md border">
        <table {...getTableProps()} className="w-full">
          <thead>
            {headerGroups.map((headerGroup) => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column) => (
                  <th
                    {...column.getHeaderProps(column.getSortByToggleProps())}
                    className="border-b px-4 py-3 text-left"
                  >
                    <div className="flex items-center gap-2">
                      {column.render("Header")}
                      <span>
                        {column.isSorted ? (
                          column.isSortedDesc ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronUp className="h-4 w-4" />
                          )
                        ) : null}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()}>
            {page.map((row) => {
              prepareRow(row);
              return (
                <tr {...row.getRowProps()}>
                  {row.cells.map((cell) => (
                    <td {...cell.getCellProps()} className="border-b px-4 py-3">
                      {cell.render("Cell")}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-500">
          Page {pageIndex + 1} of {pageOptions.length}
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={previousPage}
            disabled={!canPreviousPage}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={nextPage}
            disabled={!canNextPage}
          >
            Next
          </Button>
        </div>
      </div>

      <Dialog open={showUserDetails} onOpenChange={setShowUserDetails}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              Comprehensive information about the user
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
                  {selectedUser.imageUrl ? (
                    <img
                      src={selectedUser.imageUrl}
                      alt={selectedUser.name || ""}
                      className="w-16 h-16 rounded-full"
                    />
                  ) : (
                    <span className="text-2xl text-slate-600 font-medium">
                      {(selectedUser.name || "A").charAt(0)}
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-semibold">
                    {selectedUser.name || "Anonymous"}
                  </h3>
                  <p className="text-slate-500">{selectedUser.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-slate-900">Account Details</h4>
                  <div className="space-y-1">
                    <p className="text-sm">
                      <span className="text-slate-500">Joined:</span>{" "}
                      {format(new Date(selectedUser.createdAt), "PPP")}
                    </p>
                    <p className="text-sm">
                      <span className="text-slate-500">Subscription:</span>{" "}
                      {selectedUser.subscription?.plan || "FREE"}
                    </p>
                    {selectedUser.subscription?.validUntil && (
                      <p className="text-sm">
                        <span className="text-slate-500">Valid Until:</span>{" "}
                        {format(
                          new Date(selectedUser.subscription.validUntil),
                          "PPP"
                        )}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-slate-900">Usage Statistics</h4>
                  <div className="space-y-1">
                    <p className="text-sm">
                      <span className="text-slate-500">Questions Asked:</span>{" "}
                      {selectedUser.stats.questions}
                    </p>
                    <p className="text-sm">
                      <span className="text-slate-500">Documents Processed:</span>{" "}
                      {selectedUser.stats.documents}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="destructive"
                  onClick={() => {
                    handleDelete(selectedUser.id);
                    setShowUserDetails(false);
                  }}
                >
                  Delete User
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowUserDetails(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;
