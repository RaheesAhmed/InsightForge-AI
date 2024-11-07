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
  Edit,
  Shield,
  CheckCircle,
  XCircle,
  MoreVertical,
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

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterInput, setFilterInput] = useState("");

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users");
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      const {
        users: { data },
      } = await response.json();
      setUsers(data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        const response = await fetch("/api/users", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId }),
        });

        if (!response.ok) {
          throw new Error("Failed to delete user");
        }

        fetchUsers();
      } catch (err) {
        console.error("Error deleting user:", err);
        setError(err.message);
      }
    }
  };

  const columns = useMemo(
    () => [
      {
        Header: "User",
        accessor: (row) => ({
          name: `${row.firstName} ${row.lastName}`,
          email: row.emailAddresses[0]?.emailAddress || "N/A",
        }),
        Cell: ({ value }) => (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
              <span className="text-slate-600 font-medium">
                {value.name.charAt(0)}
              </span>
            </div>
            <div>
              <div className="font-medium text-slate-800">{value.name}</div>
              <div className="text-sm text-slate-500">{value.email}</div>
            </div>
          </div>
        ),
      },
      {
        Header: "Role",
        accessor: "role",
        Cell: ({ value }) => (
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium
                        ${
                          value === "Admin"
                            ? "bg-yellow-100 text-yellow-800"
                            : value === "Manager"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-slate-100 text-slate-800"
                        }`}
          >
            {value || "User"}
          </span>
        ),
      },
      {
        Header: "Status",
        accessor: "status",
        Cell: ({ value }) => (
          <div className="flex items-center gap-2">
            {value === "Active" ? (
              <>
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-green-700">Active</span>
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4 text-red-500" />
                <span className="text-red-700">Inactive</span>
              </>
            )}
          </div>
        ),
      },
      {
        Header: "Last Active",
        accessor: "lastActiveDate",
        Cell: ({ value }) => (
          <span className="text-slate-600">
            {value ? new Date(value).toLocaleDateString() : "Never"}
          </span>
        ),
      },
      {
        Header: "Actions",
        Cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex items-center gap-2">
                <Edit className="w-4 h-4" />
                Edit User
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Change Role
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
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    state: { pageIndex, pageSize, globalFilter },
  } = tableInstance;

  if (loading)
    return (
      <div className="flex justify-center items-center h-64 p-8">
        <Loader2 className="animate-spin h-8 w-8 text-yellow-500" />
      </div>
    );

  if (error)
    return (
      <div className="p-8">
        <div
          className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg"
          role="alert"
        >
          <strong className="font-medium">Error:</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      </div>
    );

  return (
    <div className="p-8 space-y-8">
      {/* Header Section */}
      <div>
        <h3 className="text-lg font-medium text-slate-800">User Management</h3>
        <p className="text-sm text-slate-500 mt-1">
          Manage your team members and their access levels
        </p>
      </div>

      {/* Filters Section */}
      <div className="flex justify-between items-center gap-4 bg-slate-50 p-6 rounded-lg border border-slate-200">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={filterInput}
            onChange={(e) => {
              setFilterInput(e.target.value);
              setGlobalFilter(e.target.value);
            }}
            placeholder="Search users..."
            className="pl-10 pr-4 py-2 w-full rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500"
          />
        </div>
        <select
          value={pageSize}
          onChange={(e) => setPageSize(Number(e.target.value))}
          className="px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500"
        >
          {[10, 20, 30, 40, 50].map((size) => (
            <option key={size} value={size}>
              Show {size}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table {...getTableProps()} className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              {headerGroups.map((headerGroup) => (
                <tr {...headerGroup.getHeaderGroupProps()}>
                  {headerGroup.headers.map((column) => (
                    <th
                      {...column.getHeaderProps(column.getSortByToggleProps())}
                      className="px-6 py-4 text-left text-sm font-medium text-slate-600"
                    >
                      <div className="flex items-center gap-2">
                        {column.render("Header")}
                        {column.isSorted &&
                          (column.isSortedDesc ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronUp className="w-4 h-4" />
                          ))}
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
                  <tr
                    {...row.getRowProps()}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors"
                  >
                    {row.cells.map((cell) => (
                      <td {...cell.getCellProps()} className="px-6 py-4">
                        {cell.render("Cell")}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200">
          <div className="text-sm text-slate-600">
            Showing {pageIndex * pageSize + 1} to{" "}
            {Math.min((pageIndex + 1) * pageSize, users.length)} of{" "}
            {users.length} results
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => previousPage()}
              disabled={!canPreviousPage}
              variant="outline"
              size="sm"
            >
              Previous
            </Button>
            {Array.from(Array(pageCount).keys()).map((number) => (
              <Button
                key={number}
                onClick={() => gotoPage(number)}
                variant={pageIndex === number ? "default" : "outline"}
                size="sm"
                className={
                  pageIndex === number
                    ? "bg-yellow-500 hover:bg-yellow-400"
                    : ""
                }
              >
                {number + 1}
              </Button>
            ))}
            <Button
              onClick={() => nextPage()}
              disabled={!canNextPage}
              variant="outline"
              size="sm"
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
