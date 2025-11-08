import { useEffect, useRef, useState } from "react";
import type { EBook } from "../services/types";
import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.min?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export function EbookTileRow({ ebook }: { ebook: EBook }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const renderCover = async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      try {
        console.log("Loading PDF:", ebook.filePath);
        const pdf = await pdfjsLib.getDocument(ebook.filePath).promise;
        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 1 });

        const ctx = canvas.getContext("2d")!;
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        ctx.translate(0, canvas.height);
        ctx.scale(1, -1);
        await page.render({
          canvasContext: ctx,
          viewport,
          transform: [1, 0, 0, -1, 0, viewport.height],
          canvas
        }).promise;

        setLoading(false);
      } catch (err: any) {
        console.error("PDF render error:", err);
        // setError("Failed to load cover");
        setLoading(false);
      }
    };

    renderCover();
  }, [ebook.filePath]);

  const truncateText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  return (
    <div className="flex flex-row items-center gap-4 w-full bg-white p-3 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
      {/* PDF Cover */}
      <div
        className="bg-gray-200 flex items-center justify-center rounded-lg drop-shadow overflow-hidden relative group"
        style={{
          width: "120px",
          aspectRatio: "1/1.4",
          flexShrink: 0,
        }}
      >
        <canvas
          ref={canvasRef}
          className="w-full h-full transition-transform duration-300 ease-in-out group-hover:scale-110"
          style={{ display: loading ? "none" : "block" }}
        />
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-gray-500 text-sm">Loading...</span>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-gray-500 text-sm">{error}</span>
          </div>
        )}
      </div>

      {/* Book Info */}
      <div className="flex flex-col justify-between h-full text-left">
        <span className="text-base font-semibold text-gray-800">
          {truncateText(ebook.title, 80)}
        </span>
        <span className="text-sm text-gray-600 mt-1">
          Current Page: <span className="font-medium text-gray-800">18</span>
        </span>
        <span className="text-sm text-gray-600">
          Last Read: <span className="font-medium text-gray-800">Oct 28, 2025</span>
        </span>
      </div>
    </div>
  );
}
