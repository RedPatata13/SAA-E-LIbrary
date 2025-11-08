import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import type { EBook } from "../services/types";

// react-pdf requires you to set the worker source manually
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.min?url";
pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export function EbookTileSimple({ ebook }: { ebook: EBook }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const truncateText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const pdfData = ebook.base64Data
    ? `data:application/pdf;base64,${ebook.base64Data}`
    : null;

  return (
    <div className="flex flex-col items-center gap-2 w-[200px]">
      <div
        className="w-full bg-gray-200 flex items-center justify-center rounded-lg drop-shadow-lg overflow-hidden relative group"
        style={{ aspectRatio: "1/1.26" }}
      >
        {pdfData ? (
          <Document
            file={pdfData}
            loading={
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-gray-500 text-sm">Loading...</span>
              </div>
            }
            onLoadSuccess={() => setLoading(false)}
            onLoadError={(err) => {
              console.error("Error loading PDF:", err);
              setError("Failed to load PDF");
              setLoading(false);
            }}
          >
            {/* Only render the first page */}
            <Page
              pageNumber={1}
              width={200}
              renderAnnotationLayer={false}
              renderTextLayer={false}
              className="transition-transform duration-300 ease-in-out group-hover:scale-110"
            />
          </Document>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-gray-500 text-sm">No PDF Data</span>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-gray-500 text-sm">{error}</span>
          </div>
        )}
      </div>

      <span className="text-center text-sm font-medium w-full max-w-[40ch]">
        {truncateText(ebook.title, 100)}
      </span>
    </div>
  );
}
