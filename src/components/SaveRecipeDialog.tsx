import React, { useState } from 'react';
import { Loader2, Save, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from './ui/dialog';
import { Button } from './ui/button';

interface SaveRecipeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (recipeName: string) => Promise<void>;
  isSaving: boolean;
}

export const SaveRecipeDialog: React.FC<SaveRecipeDialogProps> = ({ isOpen, onClose, onSave, isSaving }) => {
  const [recipeName, setRecipeName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSaveClick = async () => {
    if (recipeName.trim()) {
      setError(null);
      await onSave(recipeName.trim());
      setRecipeName('');
    } else {
      setError('Please enter a recipe name.');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={!isSaving ? onClose : undefined}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <motion.div
              animate={{ rotate: isSaving ? 360 : 0 }}
              transition={{ duration: 2, repeat: isSaving ? Infinity : 0, ease: "linear" }}
            >
              <Sparkles className="h-5 w-5 text-primary" />
            </motion.div>
            Save Recipe Template
          </DialogTitle>
          <DialogDescription>
            Give your recipe a memorable name to easily find it later.
          </DialogDescription>
        </DialogHeader>
        
        <motion.div 
          className="grid gap-6 py-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="space-y-2">
            <label htmlFor="recipeName" className="text-sm font-medium text-foreground">
              Recipe Name
            </label>
            <input
              id="recipeName"
              value={recipeName}
              onChange={(e) => {
                setRecipeName(e.target.value);
                if (error) setError(null);
              }}
              className="w-full border border-border bg-background text-foreground rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
              placeholder="e.g., Basic Cotton Dyeing"
              disabled={isSaving}
            />
            {error && (
              <motion.p 
                className="text-destructive text-sm"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
              >
                {error}
              </motion.p>
            )}
          </div>
        </motion.div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSaveClick} disabled={isSaving} className="bg-primary hover:bg-primary/90">
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {!isSaving && <Save className="mr-2 h-4 w-4" />}
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
