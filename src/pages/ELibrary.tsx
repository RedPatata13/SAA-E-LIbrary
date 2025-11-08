import { useState, useEffect } from 'react';
import type { EBook } from '../services/types';
import { EbookTileSimple } from '../components/ebook-simple';
import { AppPagination } from '../components/app-pagination';
import { Link } from 'react-router-dom';
import { useAuth } from '../services/use-auth';
import { Button } from '../components/ui/button';
import { RefreshCw, Plus } from 'lucide-react';
import { EbookSheet } from '../components/book-upload-sheet';
import { toast } from 'sonner';

interface ELibraryProps {
  books: EBook[];
  refreshBooks: () => void;
}

export default function ELibrary({ books, refreshBooks }: ELibraryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [localBooks, setLocalBooks] = useState<EBook[]>(books); // Controlled copy
  const [isEbookSheetOpen, setIsEbookSheetOpen] = useState(false);
  const { user } = useAuth();
  const pageSize = 20;

  useEffect(() => {
    setLocalBooks(books);
  }, [books]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // reset pagination
  };

  const handleSearchClear = () => {
    setSearchTerm('');
  };

  const handleRefresh = () => {
    refreshBooks();
    setLocalBooks(books); // instant update
    setSearchTerm('');
    setCurrentPage(1);
  };

  const canAddBook = () => {
    return (user != null && user.isVerified);
  };

  const handleAddBook = () => {
    setIsEbookSheetOpen(true);
  };

  const handleEbookUploadSuccess = (ebook: EBook) => {
    console.log("Ebook uploaded successfully:", ebook);
    toast("E-Book Successfully uploaded");
    refreshBooks(); // Refresh the book list to show the new book
    setIsEbookSheetOpen(false);
  };

  // Only filter books when rendering, no state update
  const filteredBooks = searchTerm
    ? localBooks.filter(
        (book) =>
          book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          book.author?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : localBooks;

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedBooks = filteredBooks.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredBooks.length / pageSize);

  return (
    <div style={{ padding: 20 }} className='flex-col justify-between'>
      {/* Header with Search Bar */} 
      <div className="mb-8 flex items-center gap-2">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search books by title or author..."
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
          title="Refresh Books"
        >
          <RefreshCw className="w-5 h-5" />
        </Button>

        {canAddBook() && (
          <Button
            variant="outline"
            size="icon"
            onClick={handleAddBook}
            className="shrink-0"
            title="Add Book"
          >
            <Plus className="w-5 h-5" />
          </Button>
        )}
      </div>

      {/* Books Grid */}
      {paginatedBooks.length > 0 ? (
        <>
          <div className="flex gap-16 flex-wrap justify-start">
            {paginatedBooks.map((b, i) => (
              <Link
                key={b.id || b.filePath || i}
                to={`/book/${b.id}`}
              >
                <EbookTileSimple ebook={b} />
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="w-full flex justify-center items-center mt-8">
              <AppPagination 
                totalCount={filteredBooks.length} 
                pageSize={pageSize} 
                currentPage={currentPage} 
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            {localBooks.length === 0 ? 'No books available' : 'No books found'}
          </h3>
          <p className="text-gray-500 max-w-md">
            {localBooks.length === 0 
              ? 'The library is currently empty. Please check back later.'
              : `No books match your search for "${searchTerm}". Try different keywords.`}
          </p>
          {searchTerm && localBooks.length > 0 && (
            <button
              onClick={handleSearchClear}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Clear Search
            </button>
          )}
        </div>
      )}

      {/* Ebook Upload Dialog */}
      <EbookSheet 
        open={isEbookSheetOpen}
        onClose={() => setIsEbookSheetOpen(false)}
        onUploadSuccess={handleEbookUploadSuccess}
      />
    </div>
  );
}