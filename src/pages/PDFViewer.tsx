import { useState, useRef, useCallback, useEffect } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
// import VirtualizedPDFThumbnails from './VirtualizedPDFThumbnails';
import VirtualizedPDFThumbnails from '../components/virtualizedPdfThumbnail';

// PDF.js worker configuration
// pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
import pdfWorker from "pdfjs-dist/build/pdf.worker.min?url";
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

function PDFViewer() {
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 20 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Load PDF document
  const loadPDF = useCallback(async (url: string) => {
    try {
      const loadingTask = pdfjsLib.getDocument(url);
      const pdf = await loadingTask.promise;
      setPdfDoc(pdf);
    } catch (error) {
      console.error('Error loading PDF:', error);
    }
  }, []);

  // Handle scroll to load more thumbnails
  const handleScroll = useCallback(() => {
    if (!containerRef.current || !pdfDoc) return;

    const container = containerRef.current;
    const scrollTop = container.scrollTop;
    const scrollHeight = container.scrollHeight;
    const clientHeight = container.clientHeight;

    // Load more thumbnails when near bottom
    if (scrollTop + clientHeight >= scrollHeight - 100) {
      setVisibleRange(prev => ({
        start: 0,
        end: Math.min(prev.end + 10, pdfDoc.numPages)
      }));
    }
  }, [pdfDoc]);

  // Load a PDF when component mounts
  useEffect(() => {
    loadPDF('./mock/Aurelien-Geron-Hands-On-Machine-Learning-with-Scikit-Learn-Keras-and-Tensorflow_-Concepts-Tools-and-Techniques-to-Build-Intelligent-Systems-OReilly-Media-2019 (1).pdf');
    // Or from a URL:
    // loadPDF('https://example.com/document.pdf');
    // Or from file input:
    // loadPDF(URL.createObjectURL(file));
  }, [loadPDF]);

  if (!pdfDoc) {
    return <div>Loading PDF...</div>;
  }

  return (
    <div className="pdf-viewer-container">
      <div 
        ref={containerRef}
        className="thumbnails-scroll-container"
        onScroll={handleScroll}
        style={{ 
          height: '80vh', 
          overflowY: 'auto',
          border: '1px solid #ccc',
        //   flexShrink: '1'
        display:'inline-block'
        }}
      >
        <VirtualizedPDFThumbnails
          pdfDoc={pdfDoc}
          visibleRange={visibleRange}
          containerRef={containerRef}
        />
      </div>
      
      <div className="controls">
        <button 
          onClick={() => setVisibleRange(prev => ({
            start: 0,
            end: Math.min(prev.end + 10, pdfDoc.numPages)
          }))}
        >
          Load More Thumbnails
        </button>
        
        <span>
          Showing {visibleRange.start}-{visibleRange.end} of {pdfDoc.numPages} pages
        </span>
      </div>
    </div>
  );
}

export default PDFViewer;