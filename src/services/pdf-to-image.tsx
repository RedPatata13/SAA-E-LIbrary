import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
// import { File } from "lucide-react";
import type { EBook } from "./types";

// Optional: Set workerSrc for react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export function PDFasImage({ ebook } : { ebook : EBook}) {
  const [numPages, setNumPages] = useState<number | null>(null);

  const onDocumentSuccess = (pdf: any) => {
    setNumPages(pdf.numPages);
  };
  console.log('.' + ebook.filePath);
  return (
    <Document file={ebook.filePath} onLoadSuccess={onDocumentSuccess}>
      <Page pageNumber={1} width={600} height={200}/>
    </Document>
  );
}
