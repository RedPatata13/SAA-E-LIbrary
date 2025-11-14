import { useEffect, useRef, useState } from "react";

import { Button } from "./ui/button";
import { Input } from "./ui/input";
import VirtualizedPDFThumbnails from "./virtualizedPdfThumbnail";
import "./PDFViewingPageFinal.css";

// Set the worker source for pdfjs-dist once
import * as pdfjsLib from "pdfjs-dist";
pdfjsLib.GlobalWorkerOptions.workerSrc = `pdfjs-dist/build/pdf.worker.mjs`;

// TEMP — replace with real values when integrated
const USER_ID = "1762572617413";
const ACTIVE_BOOK = {
  bookId: "1762936361078wyn7bnsob",
  filePath: "ebooks://testbook_1762936361078wyn7bnsob.pdf",
  title: "testbook",
  author: "author",
  publisher: "test",
};

export default function PDFViewerPage() {
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerContainerRef = useRef<HTMLDivElement>(null);

  // ----------------------------
  // 🟦 LOAD PDF
  // ----------------------------
  useEffect(() => {
    const loadPDF = async () => {
      const loadingTask = pdfjsLib.getDocument(
        ACTIVE_BOOK.filePath.replace("ebooks://", "/mock/")
      );

      try {
        const pdf = await loadingTask.promise;
        setPdfDoc(pdf);

        // Save initial history (best-effort)
        if (window && (window as any).electronAPI && (window as any).electronAPI.updateReadingHistory) {
          (window as any).electronAPI.updateReadingHistory({
            ...ACTIVE_BOOK,
            userId: USER_ID,
            pageNumber: 1,
            totalPages: pdf.numPages,
          }).catch(() => {});
        }
      } catch (error) {
        console.error("Error loading PDF:", error);
      }
    };

    loadPDF();
  }, []);

  // ----------------------------
  // 🟦 RENDER PAGE
  // ----------------------------
  useEffect(() => {
    const renderPage = async () => {
      if (!pdfDoc || !canvasRef.current || !viewerContainerRef.current) return;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const page = await pdfDoc.getPage(pageNumber);
      const container = viewerContainerRef.current;

      const desiredWidth = container.clientWidth - 40;
      const baseViewport = page.getViewport({ scale: 1 });
      const scale = desiredWidth / baseViewport.width;
      const scaledViewport = page.getViewport({ scale });

      const dpr = window.devicePixelRatio || 1;

      // CSS size
      canvas.style.width = `${scaledViewport.width}px`;
      canvas.style.height = `${scaledViewport.height}px`;

      // Actual pixel size
      canvas.width = Math.floor(scaledViewport.width * dpr);
      canvas.height = Math.floor(scaledViewport.height * dpr);

      // Reset transforms and scale for DPR
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);

      // include the canvas DOM element to match pdfjs RenderParameters type
      await page.render({
        canvasContext: ctx,
        viewport: scaledViewport,
        canvas: canvas,
      }).promise;
    };

    renderPage();

    // SAVE history whenever page changes (best-effort, fire-and-forget)
    if (pdfDoc && (window as any).electronAPI && (window as any).electronAPI.updateReadingHistory) {
      (window as any).electronAPI.updateReadingHistory({
        ...ACTIVE_BOOK,
        userId: USER_ID,
        pageNumber,
        totalPages: pdfDoc.numPages,
      }).catch(() => {});
    }
  }, [pdfDoc, pageNumber]);

  // ----------------------------
  // 🟦 UNMOUNT — Save final progress
  // ----------------------------
  useEffect(() => {
    return () => {
      if (!pdfDoc) return;
      if ((window as any).electronAPI && (window as any).electronAPI.updateReadingHistory) {
        (window as any).electronAPI.updateReadingHistory({
          ...ACTIVE_BOOK,
          userId: USER_ID,
          pageNumber,
          totalPages: pdfDoc.numPages,
        }).catch(() => {});
      }
    };
  }, [pdfDoc, pageNumber]);

  const handleNext = () => {
    if (pdfDoc && pageNumber < pdfDoc.numPages) setPageNumber((p) => p + 1);
  };

  const handleBack = () => {
    if (pageNumber > 1) setPageNumber((p) => p - 1);
  };

  const handlePageClick = (num: number) => setPageNumber(num);

  return (
    <div className="flex h-screen pb-20">
      {/* LEFT SIDEBAR */}
      <div className="w-64 flex flex-col p-4 border-r bg-gray-50/50">
        <h3 className="text-lg font-semibold mb-3">Thumbnails</h3>

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
              currentPageNumber={pageNumber} // ← required prop added
            />
          )}
        </div>
      </div>

      {/* MAIN VIEWER */}
      <div className="flex-1 flex flex-col">
        {/* Controls */}
        <div className="flex items-center justify-center gap-4 p-3 border-b bg-white shadow-sm">
          <Button onClick={handleBack} disabled={pageNumber <= 1}>
            ⬅️ Back
          </Button>

          <Input
            type="number"
            value={pageNumber}
            min={1}
            max={pdfDoc?.numPages || 1}
            onChange={(e) => {
              const v = parseInt(e.target.value);
              if (!isNaN(v) && pdfDoc) {
                setPageNumber(Math.min(Math.max(v, 1), pdfDoc.numPages));
              }
            }}
            className="w-16 text-center"
          />

          <span>of {pdfDoc?.numPages || "..."}</span>

          <Button
            onClick={handleNext}
            disabled={!pdfDoc || pageNumber >= pdfDoc.numPages}
          >
            Next ➡️
          </Button>
        </div>

        {/* Canvas */}
        <div
          ref={viewerContainerRef}
          className="flex-1 flex justify-center overflow-auto bg-gray-100"
        >
          <div className="flex justify-center w-full p-4">
            <canvas
              ref={canvasRef}
              className="border rounded-lg shadow-xl bg-white"
              style={{ imageRendering: "auto" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
