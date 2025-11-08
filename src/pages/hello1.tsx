import { useState, useRef, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import './hello.css';
// import VirtualizedPDFThumbnails from './VirtualizedPDFThumbnails';
import VirtualizedPDFThumbnails from '../components/virtualizedPdfThumbnail';

// pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
import pdfWorker from "pdfjs-dist/build/pdf.worker.min?url";
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

function PDFThumbnailViewer() {
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 30 });
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadPDF = useCallback(async (source: string | ArrayBuffer) => {
    setIsLoading(true);
    try {
      const loadingTask = pdfjsLib.getDocument(source);
      const pdf = await loadingTask.promise;
      setPdfDoc(pdf);
      setVisibleRange({ start: 0, end: 30 }); // Reset visible range
    } catch (error) {
      console.error('Error loading PDF:', error);
      alert('Failed to load PDF');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      const fileUrl = URL.createObjectURL(file);
      loadPDF(fileUrl);
    }
  };

  const handleThumbnailClick = (pageNumber: number) => {
    console.log('Thumbnail clicked:', pageNumber);
    // You can implement navigation to the specific page here
  };

  // Virtual scroll handler
  const handleScroll = useCallback(() => {
    if (!containerRef.current || !pdfDoc) return;

    const container = containerRef.current;
    const scrollTop = container.scrollTop;
    const scrollHeight = container.scrollHeight;
    const clientHeight = container.clientHeight;

    // Dynamic range adjustment based on scroll position
    const itemsPerPage = 20;
    const currentPage = Math.floor(scrollTop / (container.scrollHeight / (pdfDoc.numPages / itemsPerPage)));
    
    setVisibleRange({
      start: Math.max(0, currentPage * itemsPerPage - itemsPerPage),
      end: Math.min(pdfDoc.numPages, (currentPage + 2) * itemsPerPage)
    });
  }, [pdfDoc]);

  return (
    <div className="pdf-thumbnail-viewer">
      <div className="header">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept=".pdf"
          style={{ display: 'none' }}
        />
        <button 
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
        >
          {isLoading ? 'Loading...' : 'Upload PDF'}
        </button>
        
        {pdfDoc && (
          <div className="pdf-info">
            <h3>PDF Document</h3>
            <p>Pages: {pdfDoc.numPages}</p>
          </div>
        )}
      </div>

      {pdfDoc ? (
        <div 
          ref={containerRef}
          className="thumbnails-scroll-container"
          onScroll={handleScroll}
          style={{ 
            
            height: '600px',
            overflowY: 'auto',
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            backgroundColor: '#000'
          }}
        >
          <VirtualizedPDFThumbnails
            pdfDoc={pdfDoc}
            visibleRange={visibleRange}
            containerRef={containerRef}
          />
        </div>
      ) : (
        <div className="placeholder">
          {isLoading ? 'Loading PDF...' : 'Upload a PDF to view thumbnails'}
        </div>
      )}

      {pdfDoc && (
        <div className="footer">
          <p>
            Showing pages {visibleRange.start + 1}-{Math.min(visibleRange.end, pdfDoc.numPages)} of {pdfDoc.numPages}
          </p>
        </div>
      )}
    </div>
  );
}

export default PDFThumbnailViewer;