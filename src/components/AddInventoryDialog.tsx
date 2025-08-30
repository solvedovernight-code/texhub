import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, Save, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { InventoryItem, INVENTORY_CATEGORIES, STOCK_UNITS, initialInventoryItem, generateSKU } from '../types/inventory';
import * as Select from '@radix-ui/react-select';

interface AddInventoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Partial<InventoryItem>) => void;
  editingItem?: InventoryItem | null;
}

export const AddInventoryDialog: React.FC<AddInventoryDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  editingItem
}) => {
  const [formData, setFormData] = useState<Partial<InventoryItem>>(initialInventoryItem);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editingItem) {
      setFormData(editingItem);
    } else {
      setFormData(initialInventoryItem);
    }
    setErrors({});
  }, [editingItem, isOpen]);

  const handleInputChange = (field: keyof InventoryItem, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Auto-generate SKU when name or category changes
    if ((field === 'name' || field === 'category') && !editingItem) {
      const name = field === 'name' ? value as string : formData.name || '';
      const category = field === 'category' ? value as string : formData.category || 'chemical';
      if (name && category) {
        setFormData(prev => ({ ...prev, sku: generateSKU(category, name) }));
      }
    }
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name?.trim()) newErrors.name = 'Name is required';
    if (!formData.sku?.trim()) newErrors.sku = 'SKU is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.unit) newErrors.unit = 'Unit is required';
    if (formData.currentStock === undefined || formData.currentStock < 0) newErrors.currentStock = 'Current stock must be 0 or greater';
    if (formData.minStock === undefined || formData.minStock < 0) newErrors.minStock = 'Minimum stock must be 0 or greater';
    if (formData.maxStock === undefined || formData.maxStock < 0) newErrors.maxStock = 'Maximum stock must be 0 or greater';
    if (formData.unitPrice === undefined || formData.unitPrice < 0) newErrors.unitPrice = 'Unit price must be 0 or greater';
    
    if (formData.maxStock !== undefined && formData.minStock !== undefined && formData.maxStock < formData.minStock) {
      newErrors.maxStock = 'Maximum stock must be greater than minimum stock';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave(formData);
      onClose();
    }
  };

  const inputClasses = "mt-1 block w-full rounded-lg border border-border shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 bg-background text-foreground py-2 px-3";
  const labelClasses = "block text-sm font-medium text-foreground mb-1";
  const errorClasses = "text-red-500 text-xs mt-1";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            {editingItem ? 'Edit Inventory Item' : 'Add New Inventory Item'}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 py-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClasses}>Item Name *</label>
              <Input
                value={formData.name || ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="e.g., Reactive Red 195"
                className={inputClasses}
              />
              {errors.name && <p className={errorClasses}>{errors.name}</p>}
            </div>
            
            <div>
              <label className={labelClasses}>SKU *</label>
              <Input
                value={formData.sku || ''}
                onChange={(e) => handleInputChange('sku', e.target.value)}
                placeholder="e.g., DYE-RED1-A123"
                className={inputClasses}
              />
              {errors.sku && <p className={errorClasses}>{errors.sku}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClasses}>Category *</label>
              <Select.Root value={formData.category || ''} onValueChange={(value) => handleInputChange('category', value)}>
                <Select.Trigger className="flex items-center justify-between w-full rounded-lg border border-border shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 bg-background text-foreground py-2 px-3">
                  <Select.Value placeholder="Select Category" />
                  <Select.Icon>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </Select.Icon>
                </Select.Trigger>
                <Select.Portal>
                  <Select.Content className="overflow-hidden rounded-lg bg-card border border-border shadow-lg z-50">
                    <Select.Viewport className="p-1">
                      {INVENTORY_CATEGORIES.map(category => (
                        <Select.Item key={category.value} value={category.value} className="relative flex items-center rounded-md py-2 pl-3 pr-9 text-foreground text-sm outline-none data-[highlighted]:bg-primary/20">
                          <Select.ItemText>{category.label}</Select.ItemText>
                        </Select.Item>
                      ))}
                    </Select.Viewport>
                  </Select.Content>
                </Select.Portal>
              </Select.Root>
              {errors.category && <p className={errorClasses}>{errors.category}</p>}
            </div>

            <div>
              <label className={labelClasses}>Unit *</label>
              <Select.Root value={formData.unit || ''} onValueChange={(value) => handleInputChange('unit', value)}>
                <Select.Trigger className="flex items-center justify-between w-full rounded-lg border border-border shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 bg-background text-foreground py-2 px-3">
                  <Select.Value placeholder="Select Unit" />
                  <Select.Icon>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </Select.Icon>
                </Select.Trigger>
                <Select.Portal>
                  <Select.Content className="overflow-hidden rounded-lg bg-card border border-border shadow-lg z-50">
                    <Select.Viewport className="p-1">
                      {STOCK_UNITS.map(unit => (
                        <Select.Item key={unit} value={unit} className="relative flex items-center rounded-md py-2 pl-3 pr-9 text-foreground text-sm outline-none data-[highlighted]:bg-primary/20">
                          <Select.ItemText>{unit}</Select.ItemText>
                        </Select.Item>
                      ))}
                    </Select.Viewport>
                  </Select.Content>
                </Select.Portal>
              </Select.Root>
              {errors.unit && <p className={errorClasses}>{errors.unit}</p>}
            </div>
          </div>

          <div>
            <label className={labelClasses}>Description</label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Item description..."
              className={`${inputClasses} min-h-[80px]`}
              rows={3}
            />
          </div>

          {/* Stock Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={labelClasses}>Current Stock *</label>
              <Input
                type="number"
                value={formData.currentStock || ''}
                onChange={(e) => handleInputChange('currentStock', parseFloat(e.target.value) || 0)}
                placeholder="0"
                min="0"
                step="any"
                className={inputClasses}
              />
              {errors.currentStock && <p className={errorClasses}>{errors.currentStock}</p>}
            </div>

            <div>
              <label className={labelClasses}>Minimum Stock *</label>
              <Input
                type="number"
                value={formData.minStock || ''}
                onChange={(e) => handleInputChange('minStock', parseFloat(e.target.value) || 0)}
                placeholder="0"
                min="0"
                step="any"
                className={inputClasses}
              />
              {errors.minStock && <p className={errorClasses}>{errors.minStock}</p>}
            </div>

            <div>
              <label className={labelClasses}>Maximum Stock *</label>
              <Input
                type="number"
                value={formData.maxStock || ''}
                onChange={(e) => handleInputChange('maxStock', parseFloat(e.target.value) || 0)}
                placeholder="0"
                min="0"
                step="any"
                className={inputClasses}
              />
              {errors.maxStock && <p className={errorClasses}>{errors.maxStock}</p>}
            </div>
          </div>

          {/* Pricing and Supplier */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClasses}>Unit Price *</label>
              <Input
                type="number"
                value={formData.unitPrice || ''}
                onChange={(e) => handleInputChange('unitPrice', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                min="0"
                step="any"
                className={inputClasses}
              />
              {errors.unitPrice && <p className={errorClasses}>{errors.unitPrice}</p>}
            </div>

            <div>
              <label className={labelClasses}>Supplier</label>
              <Input
                value={formData.supplier || ''}
                onChange={(e) => handleInputChange('supplier', e.target.value)}
                placeholder="Supplier name"
                className={inputClasses}
              />
            </div>
          </div>

          {/* Additional Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClasses}>Location</label>
              <Input
                value={formData.location || ''}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="Storage location"
                className={inputClasses}
              />
            </div>

            <div>
              <label className={labelClasses}>Batch Number</label>
              <Input
                value={formData.batchNumber || ''}
                onChange={(e) => handleInputChange('batchNumber', e.target.value)}
                placeholder="Batch number"
                className={inputClasses}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClasses}>Expiry Date</label>
              <Input
                type="date"
                value={formData.expiryDate || ''}
                onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                className={inputClasses}
              />
            </div>

            <div>
              <label className={labelClasses}>Notes</label>
              <Input
                value={formData.notes || ''}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Additional notes"
                className={inputClasses}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Save className="h-4 w-4 mr-2" />
            {editingItem ? 'Update Item' : 'Add Item'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
