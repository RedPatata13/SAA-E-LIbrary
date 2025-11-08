import { useState, useEffect, useRef, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

// Type definitions
interface VirtualizedPDFThumbnailsProps {
  pdfDoc: pdfjsLib.PDFDocumentProxy;
  visibleRange: { start: number; end: number };
  containerRef: React.RefObject<HTMLDivElement | null>;
  onPageClick?: (pageNumber: number) => void;
  currentPageNumber: number;
}

interface ThumbnailProps {
  pageNumber: number;
  pdfDoc: pdfjsLib.PDFDocumentProxy;
  isVisible: boolean;
  observer: IntersectionObserver | null;
  onPageClick?: (pageNumber: number) => void; 
  isActive: boolean;
}

function VirtualizedPDFThumbnails({ 
  pdfDoc, 
  visibleRange, 
  containerRef,
  onPageClick,
  currentPageNumber
}: VirtualizedPDFThumbnailsProps) {
  const [visiblePages, setVisiblePages] = useState<Set<number>>(new Set());
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        setVisiblePages(prevVisiblePages => {
          const newVisiblePages = new Set(prevVisiblePages); 
          entries.forEach(entry => {
            const pageNum = parseInt((entry.target as HTMLElement).dataset.pageNumber || '0');
            if (entry.isIntersecting) {
              newVisiblePages.add(pageNum);
            } else {
              newVisiblePages.delete(pageNum);
            }
          });
          if (newVisiblePages.size !== prevVisiblePages.size || ![...newVisiblePages].every(p => prevVisiblePages.has(p))) {
            return newVisiblePages;
          }
          return prevVisiblePages;
        });
      },
      { root: containerRef.current, rootMargin: '500px' }
    );

    return () => observerRef.current?.disconnect();
  }, [containerRef]); 

  return (
    <div className="thumbnails-container grid grid-cols-1 gap-4 border-solid place-items-center p-4 max-w-50 min-w-50 overflow-x-hidden">
      {Array.from({ length: pdfDoc.numPages }, (_, i) => i + 1)
        .slice(visibleRange.start, visibleRange.end)
        .map(pageNumber => (
          <div key={pageNumber} className="flex flex-col gap-1 items-center justify-center w-fit">
            <Thumbnail
              pageNumber={pageNumber}
              pdfDoc={pdfDoc}
              isVisible={visiblePages.has(pageNumber)}
              observer={observerRef.current}
              onPageClick={onPageClick} // ✅ Pass handler down
              isActive={pageNumber === currentPageNumber}
            />
            <p>{pageNumber}</p>
          </div>
        ))}
    </div>
  );
}

const Thumbnail = ({ 
  pageNumber, 
  pdfDoc, 
  isVisible, 
  observer,
  onPageClick,
  isActive
}: ThumbnailProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRendered, setIsRendered] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (wrapper && observer) {
      observer.observe(wrapper);
      return () => observer.unobserve(wrapper);
    }
  }, [observer]);

  const renderThumbnail = useCallback(async () => {
    try {
      const page = await pdfDoc.getPage(pageNumber);
      const canvas = canvasRef.current;
      if (!canvas) return;

      const context = canvas.getContext('2d');
      if (!context) return;
      
      const viewport = page.getViewport({ scale: 0.3 }); // Small scale for thumbnails
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await page.render({
        canvasContext: context,
        viewport: viewport,
        canvas
      }).promise;
      
      setIsRendered(true);
    } catch (error) {
      console.error(`Error rendering page ${pageNumber}:`, error);
    }
  }, [pageNumber, pdfDoc]);

  useEffect(() => {
    if (isVisible && !isRendered) {
      renderThumbnail();
    }
  }, [isVisible, isRendered, renderThumbnail]);

  // ✅ Add click handler
  const handleClick = () => {
    if (onPageClick) {
      onPageClick(pageNumber);
    }
  };

  const activeClass = isActive 
    ? "border-blue-500 border-4 shadow-lg scale-[1.02]" // Example active styles
    : "border-gray-300 border-1"; // Example normal styles

  return (
    <div
      ref={wrapperRef}
      // 💡 Conditional class inclusion using a template literal
      className={`thumbnail-wrapper cursor-pointer hover:opacity-80 transition ${activeClass}`} 
      data-page-number={pageNumber}
      onClick={handleClick}
    >
      <canvas ref={canvasRef} />
      {!isRendered && <div className="thumbnail-placeholder">Loading Page {pageNumber}...</div>}
    </div>
  );
};

export default VirtualizedPDFThumbnails;
