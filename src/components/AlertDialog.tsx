import React from 'react';
import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Info, CheckCircle, AlertTriangle, XCircle, HelpCircle, Loader2 } from 'lucide-react';

interface AlertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error' | 'confirm';
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  isAuthenticating?: boolean; // Prop for loading state
}

const iconMap = {
  info: <Info className="h-6 w-6 text-blue-500" />,
  success: <CheckCircle className="h-6 w-6 text-success" />,
  warning: <AlertTriangle className="h-6 w-6 text-warning" />,
  error: <XCircle className="h-6 w-6 text-error" />,
  confirm: <HelpCircle className="h-6 w-6 text-primary" />,
};

export function AlertDialog({
  isOpen,
  onClose,
  title,
  message,
  type = 'info',
  onConfirm,
  onCancel,
  confirmText,
  cancelText,
  isAuthenticating = false, // Default to false
}: AlertDialogProps) {
  const getButtonVariant = () => {
    switch (type) {
      case 'error':
        return 'destructive';
      case 'confirm':
        return 'destructive';
      default:
        return 'default';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-card text-card-foreground rounded-lg shadow-xl p-0 max-w-md mx-auto border border-border">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
        >
          <DialogHeader className="text-center space-y-4 p-6 pb-4">
            <motion.div 
              className="flex justify-center mb-2"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
            >
              {isAuthenticating && type === 'confirm' ? <Loader2 className="h-6 w-6 animate-spin text-primary" /> : iconMap[type]}
            </motion.div>
            <DialogTitle className="text-xl font-bold text-foreground text-center">{title}</DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm leading-relaxed text-center">
              {message}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-3 p-6 pt-4 border-t border-border">
            {onCancel && (
              <Button
                variant="outline"
                onClick={onCancel}
                className="text-muted-foreground hover:text-foreground"
                disabled={isAuthenticating}
              >
                {cancelText || 'Cancel'}
              </Button>
            )}
            {onConfirm && (
              <Button
                variant={getButtonVariant()}
                onClick={onConfirm}
                disabled={isAuthenticating}
              >
                {isAuthenticating ? (
                  <span className="flex items-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {type === 'confirm' ? 'Deleting...' : (confirmText || 'Confirming...')}
                  </span>
                ) : (
                  confirmText || 'Confirm'
                )}
              </Button>
            )}
          </DialogFooter>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
