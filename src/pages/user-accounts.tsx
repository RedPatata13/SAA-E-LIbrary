import { useState, useEffect } from "react";
import { RefreshCw, Plus } from "lucide-react";
import { Button } from "../components/ui/button";
import { AppPagination } from "../components/app-pagination";
import { useAuth } from "../services/use-auth";
import { toast } from "sonner";
import type { User } from "../services/types";
import { AddAccountsAdmin } from "../components/add-account-admin";

interface UserAccountPage {
  accounts: User[];
  refreshAccounts: () => void;
}

export default function UserAccountsPage({ accounts, refreshAccounts }: UserAccountPage) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [localAccounts, setLocalAccounts] = useState<User[]>(accounts);
  const { user } = useAuth();
  const [showSignupOverlay, setShowSignupOverlay] = useState(false);
  const pageSize = 10;

  // ADD THIS: Fetch accounts directly
  const fetchAccountsDirectly = async () => {
    try {
      if (window.dbAPI && window.dbAPI.getUsers) {
        const usersData = await window.dbAPI.getUsers();
        setLocalAccounts(usersData);
      }
    } catch (error) {
      console.error('Error fetching accounts:', error);
    }
  };

  // ADD THIS: Load accounts on component mount
  useEffect(() => {
    fetchAccountsDirectly();
  }, []);

  // ADD THIS: Update refresh function to fetch directly
  const handleRefreshDirect = () => {
    fetchAccountsDirectly();
    toast("Accounts refreshed");
    setSearchTerm("");
    setCurrentPage(1);
  };

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
  setShowSignupOverlay(true);
  };

  const handleCloseSignup = () => {
  setShowSignupOverlay(false);
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
            className="w-full px-4 py-2 border border-gray-300 dark:border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-background text-gray-900 dark:text-foreground placeholder-gray-500 dark:placeholder-muted-foreground"
          />
          {searchTerm && (
            <button
              onClick={handleSearchClear}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-muted-foreground"
            >
              ✕
            </button>
          )}
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={handleRefreshDirect}
          className="shrink-0 border-gray-300 dark:border-border text-gray-700 dark:text-foreground hover:bg-gray-50 dark:hover:bg-accent"
          title="Refresh Accounts"
        >
          <RefreshCw className="w-5 h-5" />
        </Button>

        {canAddAccount() && (
          <Button
            variant="outline"
            size="icon"
            onClick={handleAddAccount}
            className="shrink-0 border-gray-300 dark:border-border text-gray-700 dark:text-foreground hover:bg-gray-50 dark:hover:bg-accent"
            title="Add Account"
          >
            <Plus className="w-5 h-5" />
          </Button>
        )}
      </div>

        {/* Accounts List - Table View */}
        {paginatedAccounts.length > 0 ? (
          <>
            {/* Table Header */}
            <div className="bg-gray-50 dark:bg-card border border-gray-200 dark:border-border rounded-t-lg p-4 grid grid-cols-12 gap-4 font-semibold text-gray-700 dark:text-foreground">
              <div className="col-span-4">UID</div>
              <div className="col-span-6">USERNAME</div>
              <div className="col-span-2">VERIFIED</div>
            </div>

            {/* Table Body */}
            <div className="border border-gray-200 dark:border-border border-t-0 rounded-b-lg">
              {paginatedAccounts.map((acc, index) => (
                <div
                  key={acc.uid}
                  className={`p-4 grid grid-cols-12 gap-4 items-center ${
                    index % 2 === 0 
                      ? 'bg-white dark:bg-background' 
                      : 'bg-gray-50 dark:bg-card'
                  } ${
                    index === paginatedAccounts.length - 1 
                      ? '' 
                      : 'border-b border-gray-200 dark:border-border'
                  }`}
                >
                  {/* UID */}
                  <div className="col-span-4">
                    <span className="font-mono text-sm text-gray-600 dark:text-muted-foreground">{acc.uid}</span>
                  </div>

                  {/* USERNAME */}
                  <div className="col-span-6">
                    <span className="font-medium text-gray-800 dark:text-foreground">{acc.username}</span>
                  </div>

                  {/* VERIFIED */}
                  <div className="col-span-2">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        acc.isVerified
                          ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300'
                          : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300'
                      }`}
                    >
                      {acc.isVerified ? 'Yes' : 'No'}
                    </span>
                  </div>
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
          <h3 className="text-xl font-semibold text-gray-700 dark:text-foreground mb-2">
            {localAccounts.length === 0 ? "No accounts available" : "No accounts found"}
          </h3>
          <p className="text-gray-500 dark:text-muted-foreground max-w-md">
            {localAccounts.length === 0
              ? "No registered users yet. Please check back later."
              : `No accounts match your search for "${searchTerm}". Try different keywords.`}
          </p>
          {searchTerm && localAccounts.length > 0 && (
            <button
              onClick={handleSearchClear}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors dark:bg-blue-600 dark:hover:bg-blue-700"
            >
              Clear Search
            </button>
          )}
        </div>
      )}

      {/* Add Account Overlay - UPDATE THIS: Use direct refresh */}
      {showSignupOverlay && (
        <AddAccountsAdmin 
          onClose={handleCloseSignup}
          onAccountAdded={() => {
            fetchAccountsDirectly(); // ← Changed to direct refresh
            setShowSignupOverlay(false);
          }}
        />
      )}
    </div>
  );
}