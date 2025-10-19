import React, { useState } from 'react';
import { X, Book, User, FileText, Link as LinkIcon, Image, HelpCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { BookUploadData, initialBookUploadData } from '../types/book';

interface UploadBookDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (data: BookUploadData) => Promise<void>;
}

export function UploadBookDialog({ isOpen, onClose, onUpload }: UploadBookDialogProps) {
  const [formData, setFormData] = useState<BookUploadData>(initialBookUploadData);
  const [uploading, setUploading] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const convertToDirectLink = (url: string): string => {
    try {
      const fileIdMatch = url.match(/[-\w]{25,}/);
      if (fileIdMatch) {
        const fileId = fileIdMatch[0];
        return `https://drive.google.com/uc?export=view&id=${fileId}`;
      }
      return url;
    } catch (error) {
      return url;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.bookName || !formData.author || !formData.coverPhotoUrl || !formData.pdfUrl) {
      alert('Please fill all required fields');
      return;
    }

    setUploading(true);
    try {
      const processedData = {
        ...formData,
        coverPhotoUrl: convertToDirectLink(formData.coverPhotoUrl),
        pdfUrl: convertToDirectLink(formData.pdfUrl),
      };
      await onUpload(processedData);
      setFormData(initialBookUploadData);
      onClose();
    } catch (error) {
      console.error('Error uploading book:', error);
      alert('Failed to upload book. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    if (!uploading) {
      setFormData(initialBookUploadData);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-card rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-border">
        <div className="sticky top-0 bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 backdrop-blur-sm px-4 md:px-6 py-4 flex items-center justify-between rounded-t-xl border-b border-border">
          <div className="flex items-center gap-3">
            <div className="bg-primary/20 p-2 rounded-lg">
              <Book className="w-5 h-5 md:w-6 md:h-6 text-primary" />
            </div>
            <h2 className="text-lg md:text-xl font-semibold text-foreground">Upload New Book</h2>
          </div>
          <button
            onClick={handleClose}
            disabled={uploading}
            className="text-foreground hover:text-primary transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-5">
          {showHelp && (
            <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <HelpCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <h3 className="font-semibold text-foreground">How to get Google Drive links:</h3>
                  <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                    <li>Upload your PDF and cover image to Google Drive</li>
                    <li>Right-click the file and select "Get link"</li>
                    <li>Change permissions to "Anyone with the link"</li>
                    <li>Copy the link and paste it here</li>
                  </ol>
                  <p className="text-xs text-muted-foreground italic mt-2">
                    Note: Links will be automatically converted to direct view/download links
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setShowHelp(!showHelp)}
              className="text-xs text-primary hover:text-primary/80 flex items-center gap-1"
            >
              <HelpCircle className="w-3 h-3" />
              {showHelp ? 'Hide Help' : 'Need help with Google Drive links?'}
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                <Book className="inline w-4 h-4 mr-2" />
                Book Name *
              </label>
              <Input
                type="text"
                name="bookName"
                value={formData.bookName}
                onChange={handleInputChange}
                placeholder="Enter book name"
                required
                disabled={uploading}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                <User className="inline w-4 h-4 mr-2" />
                Author Name *
              </label>
              <Input
                type="text"
                name="author"
                value={formData.author}
                onChange={handleInputChange}
                placeholder="Enter author name"
                required
                disabled={uploading}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                <FileText className="inline w-4 h-4 mr-2" />
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter book description"
                disabled={uploading}
                rows={3}
                className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                <Image className="inline w-4 h-4 mr-2" />
                Cover Photo URL * (Google Drive Link)
              </label>
              <Input
                type="url"
                name="coverPhotoUrl"
                value={formData.coverPhotoUrl}
                onChange={handleInputChange}
                placeholder="https://drive.google.com/file/d/..."
                required
                disabled={uploading}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                <LinkIcon className="inline w-4 h-4 mr-2" />
                PDF File URL * (Google Drive Link)
              </label>
              <Input
                type="url"
                name="pdfUrl"
                value={formData.pdfUrl}
                onChange={handleInputChange}
                placeholder="https://drive.google.com/file/d/..."
                required
                disabled={uploading}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                <FileText className="inline w-4 h-4 mr-2" />
                File Size (in MB, optional)
              </label>
              <Input
                type="number"
                name="fileSize"
                value={formData.fileSize || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, fileSize: parseInt(e.target.value) * 1024 * 1024 || 0 }))}
                placeholder="e.g., 5"
                disabled={uploading}
                className="w-full"
                min="0"
                step="0.1"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={uploading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={uploading}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {uploading ? 'Uploading...' : 'Upload Book'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
