import { useState, useEffect } from "react";
import { useAuth } from "../services/use-auth";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Document, Page, pdfjs } from "react-pdf";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Edit2, Trash2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import type { EBook } from "../services/types";

import pdfjsWorker from "pdfjs-dist/build/pdf.worker.min?url";
pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export default function BookPage({ books }: { books: EBook[] }) {
  const { bookId } = useParams<{ bookId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const initialBook = books.find((b) => b.id === bookId);
  const [book, setBook] = useState<EBook | null>(initialBook || null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState(book?.title || "");
  const [author, setAuthor] = useState(book?.author || "");
  const [doi, setDoi] = useState(book?.doi || "");

  useEffect(() => {
    if (book) {
      setTitle(book.title);
      setAuthor(book.author || "");
      setDoi(book.doi || "");
    }
  }, [book]);

  if (!book) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex items-center gap-4 mb-6">
          <Link to={`/Library`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold">Book not found</h1>
        </div>
      </div>
    );
  }

  const pdfData = book.base64Data
    ? `data:application/pdf;base64,${book.base64Data}`
    : null;

  const handleBack = () => navigate("/Library");

  const handleSave = async () => {
    try {
      const result = await window.dbAPI.updateEbook({
        id: book.id,
        title: title.trim(),
        author: author.trim(),
        doi: doi.trim(),
      });

      if (result.success) {
        toast("E-Book updated successfully");
        setBook({
          ...book,
          title: title.trim(),
          author: author.trim(),
          doi: doi.trim(),
        });
        setIsEditing(false);
      } else {
        toast(result.message || "Failed to update ebook");
      }
    } catch (err) {
      console.error("Update error:", err);
      toast("An error occurred while updating the ebook.");
    }
  };

  const handleDelete = async () => {
    const confirmDelete = confirm(`Are you sure you want to delete "${book.title}"?`);
    if (!confirmDelete) return;

    try {
      const result = await window.dbAPI.removeEbook(book.id);
      if (result.success) {
        toast("E-Book removed successfully");
        navigate("/Library");
      } else {
        toast(result.message || "Failed to remove ebook.");
      }
    } catch (err) {
      console.error("Delete error:", err);
      toast("An error occurred while deleting the ebook.");
    }
  };

  return (
    <div className="container mx-auto p-4 w-full">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Book Details</h1>
      </div>

      <Card className="max-w-4xl mx-auto">
        <CardContent className="p-6">
          {user?.isVerified && (
            <div className="flex justify-end mb-4 gap-2">
              {!isEditing ? (
                <>
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button variant="destructive" size="sm" onClick={handleDelete}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="default" size="sm" onClick={handleSave}>
                    Save
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                </>
              )}
            </div>
          )}

          <div className="flex flex-col md:flex-row gap-6">
            {/* PDF Preview */}
            <div className="flex-shrink-0">
              <div
                className="w-full max-w-[200px] bg-gray-200 flex items-center justify-center rounded-lg drop-shadow-lg overflow-hidden relative group"
                style={{ aspectRatio: "1/1.26" }}
              >
                {pdfData ? (
                  <Document
                    file={pdfData}
                    loading={<span className="text-gray-500 text-sm">Loading...</span>}
                    onLoadSuccess={() => setLoading(false)}
                    onLoadError={(err) => {
                      console.error("Error loading PDF:", err);
                      setError("Failed to load PDF");
                      setLoading(false);
                    }}
                  >
                    <Page
                      pageNumber={1}
                      width={200}
                      renderAnnotationLayer={false}
                      renderTextLayer={false}
                      className="transition-transform duration-300 ease-in-out group-hover:scale-110"
                    />
                  </Document>
                ) : (
                  <span className="text-gray-500 text-sm">No PDF Data</span>
                )}
                {error && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-gray-500 text-sm">{error}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Book Info */}
            <div className="flex-1 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">ID</label>
                <p className="text-sm mt-1">{book.id}</p>
              </div>

              <div>
                <label className="text-sm font-medium">Title</label>
                <div className="mt-1">
                  {isEditing ? (
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  ) : (
                    <p className="text-lg font-semibold">{book.title}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Author</label>
                <div className="mt-1">
                  {isEditing ? (
                    <input
                      type="text"
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  ) : (
                    <p>{book.author || "Unknown Author"}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">DOI</label>
                <div className="mt-1">
                  {isEditing ? (
                    <input
                      type="text"
                      value={doi}
                      onChange={(e) => setDoi(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  ) : (
                    <p>{book.doi || "Not Set"}</p>
                  )}
                </div>
              </div>

              {pdfData && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => navigate(`/read/${bookId}`)}
                >
                  Read Book
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
