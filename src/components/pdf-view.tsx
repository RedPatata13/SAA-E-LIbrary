import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Document, Page, pdfjs } from "react-pdf";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import VirtualizedPDFThumbnails from "./virtualizedPdfThumbnail";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import type { EBook } from "../services/types";

import pdfWorker from "pdfjs-dist/build/pdf.worker.min?url";
pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;
import * as pdfjsLib from "pdfjs-dist";

const ZOOM_OPTIONS = [
  { label: "Fit Width", value: "auto" },
  { label: "50%", value: 0.5 },
  { label: "75%", value: 0.75 },
  { label: "100%", value: 1.0 },
  { label: "125%", value: 1.25 },
  { label: "150%", value: 1.5 },
  { label: "200%", value: 2.0 },
];
const MIN_SCALE = 0.5;
const MAX_SCALE = 3.0;
const SCALE_STEP = 0.25;

// Debounce function to limit API calls
function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
}

interface PDFViewerPageProps {
  books: EBook[];
}

export default function PDFViewerPage({ books }: PDFViewerPageProps) {
  const { bookId } = useParams<{ bookId: string }>();
  const navigate = useNavigate();
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [inputValue, setInputValue] = useState("1");
  const [previousPage, setPreviousPage] = useState(1);
  const [containerWidth, setContainerWidth] = useState(0);
  const [pdfDocProxy, setPdfDocProxy] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [pageDimension, setPageDimension] = useState<{ width: number; height: number } | null>(null);
  const [scale, setScale] = useState<number | "auto">("auto");
  const [currentUser, setCurrentUser] = useState<any>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const viewerContainerRef = useRef<HTMLDivElement>(null);

  // Get the current book
  const book = useMemo(() => {
    return books.find(b => b.id === bookId);
  }, [books, bookId]);

  // Generate PDF data URL from base64
  const pdfData = useMemo(() => {
    if (!book?.base64Data) return null;
    return `data:application/pdf;base64,${book.base64Data}`;
  }, [book?.base64Data]);

  // --- Utility Functions for Zoom ---
  const calculateInitialScale = useCallback(
    (pageDimensions: { width: number; height: number }, containerW: number) => {
      const availableWidth = containerW - 40;
      const fitScale = availableWidth / pageDimensions.width;
      return Math.min(fitScale, 1.5);
    },
    []
  );

  // Get current user on component mount
  useEffect(() => {
    const getUser = async () => {
      try {
        const user = await window.dbAPI.getCurrentUser();
        setCurrentUser(user);
      } catch (error) {
        console.error("Error getting current user:", error);
      }
    };
    getUser();
  }, []);

  // Load PDF document and restore reading progress
  useEffect(() => {
    const loadPDF = async () => {
      if (!pdfData) return;

      try {
        const loadingTask = pdfjsLib.getDocument(pdfData);
        const pdf = await loadingTask.promise;
        setPdfDocProxy(pdf);
        setNumPages(pdf.numPages);

        const firstPage = await pdf.getPage(1);
        const viewport = firstPage.getViewport({ scale: 1.0 });
        setPageDimension({ width: viewport.width, height: viewport.height });

        // Try to restore reading progress after PDF is loaded
        if (currentUser && bookId) {
          try {
            const readingStatus = await window.dbAPI.getReadingStatus(bookId, currentUser.id);
            if (readingStatus && readingStatus.lastPageRead) {
              const savedPage = Math.min(readingStatus.lastPageRead, pdf.numPages);
              setPageNumber(savedPage);
              setInputValue(savedPage.toString());
              setPreviousPage(savedPage);
              
              toast.success(`Resumed from page ${savedPage}`);
            }
          } catch (error) {
            console.error("Error loading reading progress:", error);
            // Silent fail - just start from page 1
          }
        }
      } catch (error) {
        console.error("Error loading PDF:", error);
        toast.error("Failed to load PDF document");
      }
    };
    loadPDF();
  }, [pdfData, currentUser, bookId]);

  // Handle resizing for responsive scale
  useEffect(() => {
    const updateWidth = () => {
      if (viewerContainerRef.current) {
        const newWidth = viewerContainerRef.current.clientWidth;
        setContainerWidth(newWidth);
        if (scale === "auto" && pageDimension) {
          setScale(calculateInitialScale(pageDimension, newWidth));
        }
      }
    };
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, [scale, pageDimension, calculateInitialScale]);

  const onDocumentLoadSuccess = ({ numPages: totalPages }: { numPages: number }) => {
    setNumPages(totalPages);
  };

  // Debounced function to update reading status
  const updateReadingStatus = useCallback(
    debounce(async (bookId: string, userId: string, page: number) => {
      try {
        await window.dbAPI.updateReadingStatus(bookId, userId, page);
        console.log(`Reading progress saved: page ${page}`);
      } catch (error) {
        console.error("Error updating reading status:", error);
      }
    }, 1000), // Wait 1 second after last page change before saving
    []
  );

  const handleBackNavigation = () => {
    navigate(-1);
  };

  const handleNext = () => {
    if (numPages && pageNumber < numPages) {
      const newPage = pageNumber + 1;
      setPreviousPage(pageNumber);
      setPageNumber(newPage);
      setInputValue(newPage.toString());
      
      // Update reading progress
      if (currentUser && bookId) {
        updateReadingStatus(bookId, currentUser.id, newPage);
      }
    }
  };

  const handleBack = () => {
    if (pageNumber > 1) {
      const newPage = pageNumber - 1;
      setPreviousPage(pageNumber);
      setPageNumber(newPage);
      setInputValue(newPage.toString());
      
      // Update reading progress
      if (currentUser && bookId) {
        updateReadingStatus(bookId, currentUser.id, newPage);
      }
    }
  };

  const handlePageClick = (num: number) => {
    setPreviousPage(pageNumber);
    setPageNumber(num);
    setInputValue(num.toString());
    
    // Update reading progress
    if (currentUser && bookId) {
      updateReadingStatus(bookId, currentUser.id, num);
    }
  };

  // --- Page Input Handling ---
  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const [toastShown, setToastShown] = useState(false);

  const commitPageInput = () => {
    const val = parseInt(inputValue);
    if (!isNaN(val) && numPages && val >= 1 && val <= numPages) {
      setPreviousPage(pageNumber);
      setPageNumber(val);
      setToastShown(false);
      
      // Update reading progress
      if (currentUser && bookId) {
        updateReadingStatus(bookId, currentUser.id, val);
      }
    } else {
      if (!toastShown) {
        toast("Invalid page number");
        setToastShown(true);
      }
      setInputValue(previousPage.toString() || "1");
      setPageNumber(previousPage || 1);
    }
  };

  // --- Zoom ---
  const handleZoomChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === "auto") setScale("auto");
    else setScale(parseFloat(value));
  };

  const zoomIn = () => {
    setScale((prevScale) => {
      const currentScale =
        typeof prevScale === "number"
          ? prevScale
          : pageDimension && containerWidth
          ? calculateInitialScale(pageDimension, containerWidth)
          : 1.0;
      return Math.min(currentScale + SCALE_STEP, MAX_SCALE);
    });
  };

  const zoomOut = () => {
    setScale((prevScale) => {
      const currentScale =
        typeof prevScale === "number"
          ? prevScale
          : pageDimension && containerWidth
          ? calculateInitialScale(pageDimension, containerWidth)
          : 1.0;
      return Math.max(currentScale - SCALE_STEP, MIN_SCALE);
    });
  };

  const finalScale = useMemo(() => {
    if (typeof scale === "number") return scale;
    return pageDimension && containerWidth ? calculateInitialScale(pageDimension, containerWidth) : 1.0;
  }, [scale, pageDimension, containerWidth, calculateInitialScale]);

  const visibleRange = useMemo(() => {
    const start = Math.max(0, pageNumber - 10);
    const end = Math.min(numPages || 50, pageNumber + 30);
    return { start, end };
  }, [pageNumber, numPages]);

  const currentZoomDisplay = useMemo(() => {
    const fixedScale = typeof scale === "number" ? parseFloat(scale.toFixed(2)) : null;
    const option = ZOOM_OPTIONS.find((opt) => typeof opt.value === "number" && opt.value === fixedScale);
    return option ? option.value.toString() : scale === "auto" ? "auto" : fixedScale ? fixedScale.toString() : "1.0";
  }, [scale]);

  // Save reading progress when component unmounts
  useEffect(() => {
    return () => {
      // Cancel any pending debounced calls and save immediately
      if (currentUser && bookId) {
        updateReadingStatus(bookId, currentUser.id, pageNumber);
      }
    };
  }, [currentUser, bookId, pageNumber, updateReadingStatus]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === "ArrowLeft") {
        handleBack();
      }

      if (e.ctrlKey) {
        if (e.key === "=" || e.key === "+") {
          e.preventDefault();
          zoomIn();
        } else if (e.key === "-") {
          e.preventDefault();
          zoomOut();
        } else if (e.key === "0") {
          e.preventDefault();
          setScale("auto");
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [pageNumber, numPages, zoomIn, zoomOut, setScale]);

  // Show loading state if book not found
  if (!book) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Book Not Found</h2>
          <p className="text-muted-foreground">The requested PDF could not be loaded.</p>
        </div>
      </div>
    );
  }

  // Show loading state if no PDF data
  if (!pdfData) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">No PDF Data</h2>
          <p className="text-muted-foreground">This book doesn't have PDF content available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen pb-20 bg-background">
      {/* Thumbnails */}
      <div className="w-64 flex flex-col p-4 border-r border-border bg-muted/50">
        <div className="mb-3">
          <h3 className="text-lg font-semibold text-foreground">Thumbnails</h3>
          <p className="text-sm text-muted-foreground truncate" title={book.title}>
            {book.title}
          </p>
          {book.author && (
            <p className="text-xs text-muted-foreground">by {book.author}</p>
          )}
        </div>
        <div ref={containerRef} className="overflow-y-auto overflow-x-hidden flex-1 border border-border rounded-md bg-card p-2 h-[calc(100vh-68px)]">
          {pdfDocProxy ? (
            <VirtualizedPDFThumbnails
              pdfDoc={pdfDocProxy}
              visibleRange={visibleRange}
              containerRef={containerRef}
              onPageClick={handlePageClick}
              currentPageNumber={pageNumber}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-sm text-muted-foreground">Loading thumbnails...</div>
            </div>
          )}
        </div>
      </div>

      {/* Main Viewer */}
      <div className="flex-1 flex flex-col">
        {/* Controls */}
        <div className="flex items-center justify-center gap-4 p-3 border-b border-border bg-card shadow-sm">
          {/* Back Button */}
          <Button variant="outline" size="icon" onClick={handleBackNavigation} className="h-9 w-9 mr-2">
            <ArrowLeft className="h-4 w-4" />
          </Button>

          <Button variant="outline" size="icon" onClick={handleBack} disabled={pageNumber <= 1} className="h-9 w-9">
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-2">
            <Input
              type="text"
              value={inputValue}
              onChange={handlePageInputChange}
              onBlur={commitPageInput}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  commitPageInput();
                  (e.target as HTMLInputElement).blur();
                }
              }}
              className="w-16 text-center"
            />
            <span className="text-sm text-muted-foreground whitespace-nowrap">of {numPages || "..."}</span>
          </div>

          <Button variant="outline" size="icon" onClick={handleNext} disabled={!numPages || pageNumber >= (numPages || 1)} className="h-9 w-9">
            <ChevronRight className="h-4 w-4" />
          </Button>

          <div className="h-6 w-[1px] bg-border mx-2" />

          <Button variant="outline" size="icon" onClick={zoomOut} disabled={typeof finalScale === "number" && finalScale <= MIN_SCALE} className="h-9 w-9">
            <ZoomOut className="h-4 w-4" />
          </Button>

          <select
            value={currentZoomDisplay}
            onChange={handleZoomChange}
            className="h-9 px-3 py-1 text-sm border border-input bg-background rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
          >
            {ZOOM_OPTIONS.map((option) => (
              <option key={option.label} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <Button variant="outline" size="icon" onClick={zoomIn} disabled={typeof finalScale === "number" && finalScale >= MAX_SCALE} className="h-9 w-9">
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>

        {/* PDF Viewer */}
        <div ref={viewerContainerRef} className="flex-1 flex justify-center overflow-auto bg-muted/30">
          <div className="flex justify-center w-full p-4">
            <Document
              file={pdfData}
              onLoadSuccess={onDocumentLoadSuccess}
              loading={
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-foreground mb-2">Loading PDF...</div>
                    <div className="text-sm text-muted-foreground">{book.title}</div>
                  </div>
                </div>
              }
              error={
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-foreground mb-2">Failed to load PDF</div>
                    <div className="text-sm text-muted-foreground">Please try again later</div>
                  </div>
                </div>
              }
            >
              <Page
                pageNumber={pageNumber}
                scale={finalScale}
                width={null}
                className="shadow-lg rounded-lg bg-background"
                renderTextLayer
                renderAnnotationLayer
                renderMode="canvas"
                loading={
                  <div className="flex items-center justify-center h-64">
                    <div className="text-sm text-muted-foreground">Loading page {pageNumber}...</div>
                  </div>
                }
              />
            </Document>
          </div>
        </div>
      </div>
    </div>
  );
}