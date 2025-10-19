import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Loader2, AlertCircle, Download } from 'lucide-react';
import { Button } from './ui/button';

interface PDFViewerProps {
  pdfUrl: string;
  title: string;
  onDownload?: () => void;
}

export function PDFViewer({ pdfUrl, title, onDownload }: PDFViewerProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const convertGoogleDriveUrl = (url: string): string => {
    try {
      const fileIdMatch = url.match(/[-\w]{25,}/);
      if (fileIdMatch) {
        const fileId = fileIdMatch[0];
        return `https://drive.google.com/file/d/${fileId}/preview`;
      }
      return url;
    } catch (error) {
      return url;
    }
  };

  const handleIframeLoad = () => {
    setTimeout(() => {
      setLoading(false);
    }, 500);
  };

  const handleIframeError = () => {
    setLoading(false);
    setError(true);
  };

  return (
    <div className="relative w-full h-full bg-background">
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm"
          >
            <div className="text-center space-y-6 max-w-md mx-auto px-6">
              <motion.div
                animate={{
                  rotate: [0, 360],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="relative w-24 h-24 mx-auto"
              >
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary via-secondary to-accent animate-spin" style={{ animationDuration: '3s' }} />
                <div className="absolute inset-2 rounded-full bg-background flex items-center justify-center">
                  <FileText className="w-10 h-10 text-primary" />
                </div>
              </motion.div>

              <div className="space-y-3">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="h-1.5 bg-gradient-to-r from-primary via-secondary to-accent rounded-full overflow-hidden"
                >
                  <motion.div
                    animate={{
                      x: ["-100%", "200%"],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="h-full w-1/2 bg-white/50 rounded-full"
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    Loading PDF
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Preparing your document...
                  </p>
                </motion.div>

                <motion.div
                  animate={{
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground"
                >
                  <span className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-secondary rounded-full animate-pulse" style={{ animationDelay: '200ms' }} />
                  <span className="w-2 h-2 bg-accent rounded-full animate-pulse" style={{ animationDelay: '400ms' }} />
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute inset-0 flex items-center justify-center bg-background p-8"
        >
          <div className="text-center space-y-4 max-w-md">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="w-20 h-20 mx-auto bg-destructive/10 rounded-full flex items-center justify-center"
            >
              <AlertCircle className="w-10 h-10 text-destructive" />
            </motion.div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-foreground">
                Unable to Load PDF
              </h3>
              <p className="text-sm text-muted-foreground">
                The PDF file could not be loaded. Please try downloading it instead.
              </p>
            </div>
            {onDownload && (
              <Button
                onClick={onDownload}
                className="bg-primary hover:bg-primary/90 text-primary-foreground mt-4"
              >
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
            )}
          </div>
        </motion.div>
      ) : (
        <iframe
          src={convertGoogleDriveUrl(pdfUrl)}
          className="w-full h-full border-0"
          title={title}
          onLoad={handleIframeLoad}
          onError={handleIframeError}
          allow="autoplay"
        />
      )}
    </div>
  );
}
