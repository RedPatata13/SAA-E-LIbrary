import { useParams } from "react-router-dom";
import PdfViewer from "./pdf-view";
import { routes } from "../routes"; // { guide: "url", intro: "url", etc. }

export default function PdfViewerWrapper() {
  const { name } = useParams();
  const pdfUrl = routes[name ?? "unknown"];

  return pdfUrl ? <PdfViewer pdfUrl={pdfUrl} /> : <div>PDF not found</div>;
}
