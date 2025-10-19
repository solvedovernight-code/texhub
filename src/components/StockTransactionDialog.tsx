import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Save } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { InventoryItem, StockTransaction } from '../types/inventory';
import * as Select from '@radix-ui/react-select';

interface StockTransactionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transaction: Omit<StockTransaction, 'id' | 'timestamp' | 'userId'>) => void;
  item: InventoryItem | null;
}

export const StockTransactionDialog: React.FC<StockTransactionDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  item
}) => {
  const [formData, setFormData] = useState({
    type: 'in' as 'in' | 'out' | 'adjustment',
    quantity: 0,
    reason: '',
    reference: '',
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      setFormData({
        type: 'in',
        quantity: 0,
        reason: '',
        reference: '',
        notes: '',
      });
      setErrors({});
    }
  }, [isOpen]);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.type) newErrors.type = 'Transaction type is required';
    if (formData.quantity <= 0) newErrors.quantity = 'Quantity must be greater than 0';
    if (!formData.reason.trim()) newErrors.reason = 'Reason is required';
    
    // Check if stock out would result in negative stock
    if (formData.type === 'out' && item && formData.quantity > item.currentStock) {
      newErrors.quantity = `Cannot remove more than current stock (${item.currentStock} ${item.unit})`;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!item) return;
    
    if (validateForm()) {
      onSave({
        itemId: item.id,
        type: formData.type,
        quantity: formData.quantity,
        reason: formData.reason,
        reference: formData.reference || undefined,
        notes: formData.notes || undefined,
      });
    }
  };

  const getTransactionTypeOptions = () => [
    { value: 'in', label: 'Stock In', description: 'Add stock to inventory' },
    { value: 'out', label: 'Stock Out', description: 'Remove stock from inventory' },
    { value: 'adjustment', label: 'Stock Adjustment', description: 'Set exact stock level' },
  ];

  const getReasonOptions = () => {
    switch (formData.type) {
      case 'in':
        return ['Purchase', 'Return', 'Transfer In', 'Production', 'Other'];
      case 'out':
        return ['Sale', 'Usage', 'Transfer Out', 'Waste', 'Expired', 'Other'];
      case 'adjustment':
        return ['Physical Count', 'Correction', 'Damage', 'Loss', 'Other'];
      default:
        return ['Other'];
    }
  };

  const inputClasses = "mt-1 block w-full rounded-lg border border-border shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 bg-background text-foreground py-2 px-3";
  const labelClasses = "block text-sm font-medium text-foreground mb-1";
  const errorClasses = "text-red-500 text-xs mt-1";

  if (!item) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-primary" />
            Stock Transaction - {item.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-6">
          {/* Current Stock Info */}
          <div className="bg-muted/30 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Current Stock:</span>
              <span className="font-medium text-foreground">{item.currentStock} {item.unit}</span>
            </div>
            <div className="flex justify-between items-center mt-1">
              <span className="text-sm text-muted-foreground">SKU:</span>
              <span className="font-mono text-sm text-foreground">{item.sku}</span>
            </div>
          </div>

          {/* Transaction Type */}
          <div>
            <label className={labelClasses}>Transaction Type *</label>
            <Select.Root value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
              <Select.Trigger className="flex items-center justify-between w-full rounded-lg border border-border shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 bg-background text-foreground py-2 px-3">
                <Select.Value />
                <Select.Icon>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </Select.Icon>
              </Select.Trigger>
              <Select.Portal>
                <Select.Content className="overflow-hidden rounded-lg bg-card border border-border shadow-lg z-50">
                  <Select.Viewport className="p-1">
                    {getTransactionTypeOptions().map(option => (
                      <Select.Item key={option.value} value={option.value} className="relative flex flex-col items-start rounded-md py-2 pl-3 pr-9 text-foreground text-sm outline-none data-[highlighted]:bg-primary/20">
                        <Select.ItemText>{option.label}</Select.ItemText>
                        <span className="text-xs text-muted-foreground">{option.description}</span>
                      </Select.Item>
                    ))}
                  </Select.Viewport>
                </Select.Content>
              </Select.Portal>
            </Select.Root>
            {errors.type && <p className={errorClasses}>{errors.type}</p>}
          </div>

          {/* Quantity */}
          <div>
            <label className={labelClasses}>
              {formData.type === 'adjustment' ? 'New Stock Level' : 'Quantity'} * ({item.unit})
            </label>
            <Input
              type="number"
              value={formData.quantity || ''}
              onChange={(e) => handleInputChange('quantity', parseFloat(e.target.value) || 0)}
              placeholder="0"
              min="0"
              step="any"
              className={inputClasses}
            />
            {errors.quantity && <p className={errorClasses}>{errors.quantity}</p>}
            
            {formData.type === 'adjustment' && (
              <p className="text-xs text-muted-foreground mt-1">
                This will set the stock level to exactly {formData.quantity} {item.unit}
              </p>
            )}
          </div>

          {/* Reason */}
          <div>
            <label className={labelClasses}>Reason *</label>
            <Select.Root value={formData.reason} onValueChange={(value) => handleInputChange('reason', value)}>
              <Select.Trigger className="flex items-center justify-between w-full rounded-lg border border-border shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 bg-background text-foreground py-2 px-3">
                <Select.Value placeholder="Select reason" />
                <Select.Icon>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </Select.Icon>
              </Select.Trigger>
              <Select.Portal>
                <Select.Content className="overflow-hidden rounded-lg bg-card border border-border shadow-lg z-50">
                  <Select.Viewport className="p-1">
                    {getReasonOptions().map(reason => (
                      <Select.Item key={reason} value={reason} className="relative flex items-center rounded-md py-2 pl-3 pr-9 text-foreground text-sm outline-none data-[highlighted]:bg-primary/20">
                        <Select.ItemText>{reason}</Select.ItemText>
                      </Select.Item>
                    ))}
                  </Select.Viewport>
                </Select.Content>
              </Select.Portal>
            </Select.Root>
            {errors.reason && <p className={errorClasses}>{errors.reason}</p>}
          </div>

          {/* Reference */}
          <div>
            <label className={labelClasses}>Reference</label>
            <Input
              value={formData.reference}
              onChange={(e) => handleInputChange('reference', e.target.value)}
              placeholder="e.g., PO#12345, Invoice#67890"
              className={inputClasses}
            />
          </div>

          {/* Notes */}
          <div>
            <label className={labelClasses}>Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Additional notes..."
              className={`${inputClasses} min-h-[60px]`}
              rows={2}
            />
          </div>

          {/* Preview */}
          {formData.quantity > 0 && (
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>Preview:</strong> {' '}
                {formData.type === 'in' && `Stock will increase from ${item.currentStock} to ${item.currentStock + formData.quantity} ${item.unit}`}
                {formData.type === 'out' && `Stock will decrease from ${item.currentStock} to ${Math.max(0, item.currentStock - formData.quantity)} ${item.unit}`}
                {formData.type === 'adjustment' && `Stock will be set to ${formData.quantity} ${item.unit}`}
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Save className="h-4 w-4 mr-2" />
            Save Transaction
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
