import React, { useState } from "react";
import { createPortal } from "react-dom";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import type { EBook } from "../services/types";

const MAX_FILE_SIZE = 1024 * 1024 * 1024; // 1 GB

interface EbookSheetProps {
  open: boolean;
  onClose: () => void;
  onUploadSuccess?: (book: EBook) => void;
}

export const EbookSheet: React.FC<EbookSheetProps> = ({ 
  open, 
  onClose, 
  onUploadSuccess 
}) => {
  const [bookName, setBookName] = useState("");
  const [publisher, setPublisher] = useState("");
  const [author, setAuthor] = useState("");
  const [doi, setDoi] = useState("");
  const [file, setFile] = useState<{ name: string; size: number; path: string } | null>(null);
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = async () => {
    try {
      const result = await window.dbAPI.showFileDialog();
      if (!result.canceled && result.filePaths.length > 0) {
        const filePath = result.filePaths[0];
        
        // Get file info to validate
        const fileName = filePath.split(/[\\/]/).pop() || "unknown";
        
        // For validation, we'd need to get the file size from main process
        // For now, we'll assume it's valid and let the main process handle validation
        setFile({
          name: fileName,
          path: filePath,
          size: 0 // Will be handled in main process
        });
        setError("");
      }
    } catch (error) {
      setError("Failed to select file");
      console.error("File selection error: ", error);
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    setError("");

    // For drag and drop, we can't access the file path due to browser security
    // So we'll disable drag and drop and only use the file dialog
    setError("Please use the file selection button to choose PDF files.");
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  };

  const handleUpload = async () => {
    // Reset previous errors
    setError("");

    // Validation
    if (!file) {
      setError("Please select a PDF file.");
      return;
    }

    if (!bookName.trim()) {
      setError("Book title is required.");
      return;
    }

    if (!author.trim()) {
      setError("Author is required.");
      return;
    }

    setIsUploading(true);

    try {
      const ebookDTO = {
        title: bookName.trim(),
        author: author.trim(),
        publisher: publisher.trim(),
        doi: doi.trim() || undefined,
        filePath: file.path,
        fileName: file.name,
        fileSize: file.size
      };

      const result = await window.dbAPI.uploadEbook(ebookDTO);
      
      if (result.success) {
        resetForm();
        onUploadSuccess?.(result.ebook);
        onClose();
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("Upload failed. Please try again.");
      console.error("Upload error:", err);
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setBookName("");
    setPublisher("");
    setAuthor("");
    setDoi("");
    setFile(null);
    setError("");
    setIsDragging(false);
    setIsUploading(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return createPortal(
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md p-6">
        <DialogHeader>
          <DialogTitle>Add New Ebook</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {/* Book Title */}
          <div className="grid gap-2">
            <Label htmlFor="bookName" className="text-sm font-medium">
              Book Title *
            </Label>
            <Input
              id="bookName"
              placeholder="Enter book title"
              value={bookName}
              onChange={(e) => setBookName(e.target.value)}
              required
            />
          </div>

          {/* Author */}
          <div className="grid gap-2">
            <Label htmlFor="author" className="text-sm font-medium">
              Author *
            </Label>
            <Input
              id="author"
              placeholder="Enter author name"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              required
            />
          </div>

          {/* Publisher */}
          <div className="grid gap-2">
            <Label htmlFor="publisher" className="text-sm font-medium">
              Publisher
            </Label>
            <Input
              id="publisher"
              placeholder="Enter publisher name"
              value={publisher}
              onChange={(e) => setPublisher(e.target.value)}
            />
          </div>

          {/* DOI */}
          <div className="grid gap-2">
            <Label htmlFor="doi" className="text-sm font-medium">
              DOI (Optional)
            </Label>
            <Input
              id="doi"
              placeholder="Enter DOI"
              value={doi}
              onChange={(e) => setDoi(e.target.value)}
            />
          </div>

          {/* File Upload */}
          <div className="grid gap-2">
            <Label htmlFor="file-upload" className="text-sm font-medium">
              PDF File *
            </Label>
            
            {/* File selection button */}
            <Button
              type="button"
              variant="outline"
              onClick={handleFileSelect}
              className="w-full justify-start"
            >
              Select PDF File
            </Button>
            
            {/* Selected file display */}
            {file && (
              <div className="border border-green-200 bg-green-50 rounded-lg p-3">
                <div className="text-green-600 font-medium">
                  ✓ File Selected
                </div>
                <div className="text-sm text-muted-foreground truncate">
                  {file.name}
                </div>
                <div className="text-xs text-muted-foreground">
                  Path: {file.path}
                </div>
              </div>
            )}
            
            {/* Drop zone (disabled with message) */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`
                border-2 border-dashed rounded-lg p-6 text-center
                transition-colors duration-200 ease-in-out
                ${isDragging 
                  ? 'border-primary bg-primary/5' 
                  : 'border-muted-foreground/25 bg-muted/20'
                }
              `}
            >
              <div className="space-y-2">
                <div className="font-medium text-muted-foreground">
                  Drag and drop disabled for security
                </div>
                <div className="text-sm text-muted-foreground">
                  Please use the "Select PDF File" button above
                </div>
                <div className="text-xs text-muted-foreground">
                  Maximum file size: 1GB
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
              {error}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4">
          <Button 
            variant="outline" 
            onClick={handleClose}
            type="button"
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleUpload}
            disabled={!file || !bookName.trim() || !author.trim() || isUploading}
            type="button"
          >
            {isUploading ? "Uploading..." : "Upload Ebook"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>,
    document.body
  );
};