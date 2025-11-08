import { useState, useEffect } from "react";
import { RefreshCw, Plus } from "lucide-react";
import { Button } from "../components/ui/button";
import { AppPagination } from "../components/app-pagination";
import { useAuth } from "../services/use-auth";
import { toast } from "sonner";
import type { User } from "../services/types";

interface UserAccountPage {
  accounts: User[];
  refreshAccounts: () => void;
}

export default function UserAccountsPage({ accounts, refreshAccounts }: UserAccountPage) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [localAccounts, setLocalAccounts] = useState<User[]>(accounts);
  const { user } = useAuth();
  const pageSize = 10;

  useEffect(() => {
    setLocalAccounts(accounts);
  }, [accounts]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleSearchClear = () => {
    setSearchTerm("");
  };

  const handleRefresh = () => {
    refreshAccounts();
    toast("Accounts refreshed");
    setSearchTerm("");
    setCurrentPage(1);
  };

  const handleAddAccount = () => {
    // TODO: Open Add Account modal or navigate to account creation page
    toast("Add account clicked");
  };

  const canAddAccount = () => {
    return user != null && user.isVerified;
  };

  // Filtering
  const filteredAccounts = searchTerm
    ? localAccounts.filter(
        (acc) =>
          acc.username.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : localAccounts;

  // Pagination
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedAccounts = filteredAccounts.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredAccounts.length / pageSize);

  return (
    <div style={{ padding: 20 }} className="flex-col justify-between">
      {/* Header Bar */}
      <div className="mb-8 flex items-center gap-2">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search accounts by username or email..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {searchTerm && (
            <button
              onClick={handleSearchClear}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={handleRefresh}
          className="shrink-0"
          title="Refresh Accounts"
        >
          <RefreshCw className="w-5 h-5" />
        </Button>

        {canAddAccount() && (
          <Button
            variant="outline"
            size="icon"
            onClick={handleAddAccount}
            className="shrink-0"
            title="Add Account"
          >
            <Plus className="w-5 h-5" />
          </Button>
        )}
      </div>

      {/* Accounts List */}
      {paginatedAccounts.length > 0 ? (
        <>
          <div className="flex flex-wrap gap-6">
            {paginatedAccounts.map((acc) => (
              <div
                key={acc.uid}
                className="p-4 border rounded-lg shadow-sm w-64 bg-white hover:shadow-md transition-shadow"
              >
                <h3 className="font-semibold text-lg">{acc.username}</h3>
                {/* <p className="text-sm text-gray-500 break-all">{acc.email}</p> */}
                <p className="text-sm mt-1">
                  Verified:{" "}
                  <span className={acc.isVerified ? "text-green-600" : "text-red-600"}>
                    {acc.isVerified ? "Yes" : "No"}
                  </span>
                </p>
                {/* {acc.role && <p className="text-sm text-gray-600">Role: {acc.role}</p>} */}
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="w-full flex justify-center items-center mt-8">
              <AppPagination
                totalCount={filteredAccounts.length}
                pageSize={pageSize}
                currentPage={currentPage}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="text-6xl mb-4">👥</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            {localAccounts.length === 0 ? "No accounts available" : "No accounts found"}
          </h3>
          <p className="text-gray-500 max-w-md">
            {localAccounts.length === 0
              ? "No registered users yet. Please check back later."
              : `No accounts match your search for "${searchTerm}". Try different keywords.`}
          </p>
          {searchTerm && localAccounts.length > 0 && (
            <button
              onClick={handleSearchClear}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Clear Search
            </button>
          )}
        </div>
      )}
    </div>
  );
}
