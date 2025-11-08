import { useEffect, useRef, useState, useMemo } from "react";

import { Button } from "./ui/button";
import { Input } from "./ui/input";
import VirtualizedPDFThumbnails from "./virtualizedPdfThumbnail";
import "./PDFViewingPageFinal.css";

// Set the worker source for pdfjs-dist once
import * as pdfjsLib from "pdfjs-dist";
pdfjsLib.GlobalWorkerOptions.workerSrc = `pdfjs-dist/build/pdf.worker.mjs`;

export default function PDFViewerPage() {
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // --- Fix 2: Thumbnail container ref for VirtualizedPDFThumbnails ---
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerContainerRef = useRef<HTMLDivElement>(null); // New ref for the main viewer scroll container

  // Load PDF
  useEffect(() => {
    const loadPDF = async () => {
      const loadingTask = pdfjsLib.getDocument(
        "/mock/Aurelien-Geron-Hands-On-Machine-Learning-with-Scikit-Learn-Keras-and-Tensorflow_-Concepts-Tools-and-Techniques-to-Build-Intelligent-Systems-OReilly-Media-2019 (1).pdf"
      );
      try {
        const pdf = await loadingTask.promise;
        setPdfDoc(pdf);
      } catch (error) {
        console.error("Error loading PDF:", error);
      }
    };
    loadPDF();
  }, []);

  // --- Fix 1: Re-implement robust rendering logic with scaling ---
  useEffect(() => {
  const renderPage = async () => {
    if (!pdfDoc || !canvasRef.current || !viewerContainerRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const page = await pdfDoc.getPage(pageNumber);
    const container = viewerContainerRef.current;
    
    // Calculate desired display size
    const desiredWidth = container.clientWidth - 40;
    const baseViewport = page.getViewport({ scale: 1 });
    const scale = desiredWidth / baseViewport.width;
    const scaledViewport = page.getViewport({ scale });

    // Get device pixel ratio
    const devicePixelRatio = window.devicePixelRatio || 1;
    
    // Set canvas CSS size (what users see)
    canvas.style.width = `${scaledViewport.width}px`;
    canvas.style.height = `${scaledViewport.height}px`;

    // Set canvas internal resolution (actual pixels)
    canvas.width = Math.floor(scaledViewport.width * devicePixelRatio);
    canvas.height = Math.floor(scaledViewport.height * devicePixelRatio);

    // Scale the context to account for the higher resolution
    ctx.scale(devicePixelRatio, devicePixelRatio);

    // Render with crisp text
    const renderContext = {
      canvasContext: ctx,
      viewport: scaledViewport,
      // Optional: Enable text layer for sharper text (if you add text layer)
      enableTextLayer: true, // Set to true if you implement text selection
      canvas
    };

    await page.render(renderContext).promise;
  };

  renderPage();
}, [pdfDoc, pageNumber]);

  const handleNext = () => {
    if (pdfDoc && pageNumber < pdfDoc.numPages) setPageNumber((p) => p + 1);
  };

  const handleBack = () => {
    if (pageNumber > 1) setPageNumber((p) => p - 1);
  };

  const handlePageClick = (num: number) => {
    setPageNumber(num);
  };

  return (
    <div className="flex h-screen pb-20">
      {/* 📖 Left Sidebar for Thumbnails */}
      <div className="w-64 flex flex-col p-4 border-r border-gray-200 bg-gray-50/50">
        <h3 className="text-lg font-semibold mb-3">Thumbnails</h3>
        {/* FIX 2: Added h-[calc(100vh-68px)] to ensure the container takes the available height */}
        <div 
          ref={containerRef}
          className="overflow-y-auto overflow-x-hidden flex-1 border rounded-md bg-white p-2 h-[calc(100vh-68px)]"
        >
          {pdfDoc && (
            <VirtualizedPDFThumbnails
              pdfDoc={pdfDoc}
              visibleRange={{ start: 0, end: 20 }}
              containerRef={containerRef}
              onPageClick={handlePageClick}
              // currentPage={pageNumber}
            />
          )}
        </div>
      </div>

      {/* 📑 Main Viewer Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Controls */}
        <div className="flex items-center justify-center gap-4 p-3 border-b border-gray-200 bg-white shadow-sm">
          <Button variant="outline" onClick={handleBack} disabled={pageNumber <= 1}>
            ⬅️ Back
          </Button>
          
          <div className="flex items-center gap-1">
            <Input
              type="number"
              min={1}
              max={pdfDoc?.numPages || 1}
              value={pageNumber}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                if (!isNaN(val) && pdfDoc) {
                  const newPage = Math.min(Math.max(val, 1), pdfDoc.numPages);
                  setPageNumber(newPage);
                } else if (val === 0) {
                  setPageNumber(1);
                }
              }}
              className="w-16 text-center"
            />
            <span className="text-gray-600">
              of {pdfDoc?.numPages || '...'}
            </span>
          </div>

          <Button
            variant="outline"
            onClick={handleNext}
            disabled={!pdfDoc || pageNumber >= (pdfDoc?.numPages || 1)}
          >
            Next ➡️
          </Button>
        </div>

        {/* Canvas Viewer */}
        <div 
          ref={viewerContainerRef} // Attached the new ref here
          className="flex-1 flex justify-center overflow-auto bg-gray-100"
        >
          {/* Center the canvas without applying full-width styling that interferes with its calculated size */}
          <div className="flex justify-center w-full p-4"> 
            <canvas
              ref={canvasRef}
              // Removed max-w-full and max-h-full to let the calculated width/height dictate the size
              className="border border-gray-300 rounded-lg shadow-xl bg-white"
              style={{
                // Helps with rendering crispness at fractional scales
                imageRendering: "auto", 
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}