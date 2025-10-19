import React from 'react';
import { motion } from 'framer-motion';
import { Save, Plus, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';
import { Button } from './ui/button';

interface SaveOptionsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveAsNew: () => void;
  onUpdateExisting: () => void;
  isSaving: boolean;
  recipeName: string;
}

export const SaveOptionsDialog: React.FC<SaveOptionsDialogProps> = ({
  isOpen,
  onClose,
  onSaveAsNew,
  onUpdateExisting,
  isSaving,
  recipeName
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Save className="h-5 w-5 text-primary" />
            Save Recipe Changes
          </DialogTitle>
          <DialogDescription>
            You have unsaved changes to the recipe "{recipeName}". How would you like to save them?
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-6">
          <motion.div
            className="grid grid-cols-1 gap-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Button
              onClick={onUpdateExisting}
              disabled={isSaving}
              className="h-16 flex flex-col items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isSaving ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Save className="h-5 w-5" />
              )}
              <div className="text-center">
                <div className="font-semibold">Update Existing Recipe</div>
                <div className="text-xs opacity-90">Overwrite the current recipe with changes</div>
              </div>
            </Button>
            
            <Button
              onClick={onSaveAsNew}
              disabled={isSaving}
              variant="outline"
              className="h-16 flex flex-col items-center justify-center gap-2 border-2 hover:bg-muted"
            >
              <Plus className="h-5 w-5" />
              <div className="text-center">
                <div className="font-semibold">Save as New Recipe</div>
                <div className="text-xs text-muted-foreground">Create a new recipe with these changes</div>
              </div>
            </Button>
          </motion.div>
        </div>
        
        <div className="flex justify-end">
          <Button variant="ghost" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
