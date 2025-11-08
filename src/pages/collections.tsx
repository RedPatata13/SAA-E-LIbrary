import { useState, useEffect } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "../components/ui/button";
import { AppPagination } from "../components/app-pagination";
import type { History } from "../services/types";
import { toast } from "sonner";

interface HistoryPageProps {
  histories: History[];
  refreshHistories: () => void;
}

export default function HistoryPage({ histories, refreshHistories }: HistoryPageProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [localHistories, setLocalHistories] = useState<History[]>(histories);
  const user = window.dbAPI.getCurrentUser();
  const pageSize = 10;

  useEffect(() => {
    setLocalHistories(histories);
  }, [histories]);

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
    refreshHistories();
    toast("History refreshed");
    setSearchTerm("");
    setCurrentPage(1);
  };

  const filteredHistories = searchTerm
    ? localHistories.filter(
        (h) =>
          h.bookId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          h.userId.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : localHistories;

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedHistories = filteredHistories.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredHistories.length / pageSize);

  return (
    <div style={{ padding: 20 }} className="flex-col justify-between">
      <div className="mb-8 flex items-center gap-2">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search history by book or user ID..."
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
          title="Refresh History"
        >
          <RefreshCw className="w-5 h-5" />
        </Button>
      </div>

      {paginatedHistories.length > 0 ? (
        <>
          <div className="flex flex-wrap gap-6">
            {paginatedHistories.map((h) => (
              <div
                key={h.id}
                className="p-4 border rounded-lg shadow-sm w-64 bg-white hover:shadow-md transition-shadow"
              >
                <h3 className="font-semibold text-lg">Book ID: {h.bookId}</h3>
                <p className="text-sm text-gray-500">User ID: {h.userId}</p>
                <p className="text-sm mt-1">Last Page: {h.lastPage}</p>
                <p className="text-sm mt-1 text-gray-600">
                  Started: {new Date(h.createdAt).toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">
                  Last Updated: {new Date(h.updatedAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="w-full flex justify-center items-center mt-8">
              <AppPagination
                totalCount={filteredHistories.length}
                pageSize={pageSize}
                currentPage={currentPage}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="text-6xl mb-4">📖</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            {localHistories.length === 0 ? "No recorded history" : "No entries found"}
          </h3>
          <p className="text-gray-500 max-w-md">
            {localHistories.length === 0
              ? "You haven’t started reading any books yet."
              : `No history matches your search for "${searchTerm}". Try different keywords.`}
          </p>
          {searchTerm && localHistories.length > 0 && (
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
