import React, { useState } from 'react';
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
import { Input } from './ui/input';
import { Loader2, Lock } from 'lucide-react';

interface PasswordInputDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (password: string) => void;
  title: string;
  message: string;
  isAuthenticating: boolean;
  error: string | null;
}

export function PasswordInputDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  isAuthenticating,
  error,
}: PasswordInputDialogProps) {
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(password);
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
              <div className="p-3 rounded-full bg-primary/10">
                <Lock className="h-6 w-6 text-primary" />
              </div>
            </motion.div>
            <DialogTitle className="text-xl font-bold text-foreground text-center">{title}</DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm leading-relaxed text-center">
              {message}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="p-6 pt-4 space-y-4">
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-foreground">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full"
                disabled={isAuthenticating}
                autoFocus
              />
            </div>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-red-50 border border-red-200 rounded-md"
              >
                <p className="text-red-600 text-sm text-center">{error}</p>
              </motion.div>
            )}
            <DialogFooter className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isAuthenticating}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="destructive"
                disabled={isAuthenticating || !password}
              >
                {isAuthenticating ? (
                  <span className="flex items-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Confirming...
                  </span>
                ) : (
                  'Confirm'
                )}
              </Button>
            </DialogFooter>
          </form>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
