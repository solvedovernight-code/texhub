import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Clock, User, Settings, BarChart3, AlertTriangle, Beaker, Calendar, Timer, Award } from 'lucide-react';
import { ProductionEntry } from '../types/production';

interface ProductionDataEntryProps {
  productionType: 'knitting' | 'dyeing' | 'garments';
  onSave: (data: Omit<ProductionEntry, 'id' | 'userId' | 'timestamp'>) => void;
  editingEntry?: ProductionEntry | null;
  onCancel: () => void;
}

export const ProductionDataEntry: React.FC<ProductionDataEntryProps> = ({
  productionType,
  onSave,
  editingEntry,
  onCancel
}) => {
  const getInitialFormData = () => {
    const baseData = {
      date: new Date().toISOString().split('T')[0],
      shift: 'morning' as const,
      operator: '',
      supervisor: '',
      machineNo: '',
      startTime: '',
      endTime: '',
      totalHours: 0,
      notes: ''
    };

    if (productionType === 'knitting') {
      return {
        ...baseData,
        type: 'knitting' as const,
        fabricType: '',
        yarnType: '',
        yarnLot: '',
        gauge: '',
        gsm: 0,
        width: 0,
        targetProduction: 0,
        actualProduction: 0,
        efficiency: 0,
        defects: { holes: 0, dropStitches: 0, yarnBreaks: 0, other: 0 },
        qualityGrade: 'A' as const,
        rpm: 0,
        needleBreaks: 0
      };
    } else if (productionType === 'dyeing') {
      return {
        ...baseData,
        type: 'dyeing' as const,
        fabricType: '',
        color: '',
        dyeType: '',
        batchWeight: 0,
        liquorRatio: 0,
        temperature: 0,
        pH: 0,
        processTime: 0,
        targetProduction: 0,
        actualProduction: 0,
        efficiency: 0,
        qualityGrade: 'A' as const,
        chemicalConsumption: { dyes: 0, salt: 0, soda: 0, auxiliaries: 0 },
        qualityResults: {
          colorMatch: 'excellent' as const,
          fastness: 'excellent' as const,
          uniformity: 'excellent' as const
        },
        waterConsumption: 0,
        energyConsumption: 0,
        wasteGenerated: 0
      };
    } else {
      return {
        ...baseData,
        type: 'garments' as const,
        style: '',
        size: '',
        color: '',
        targetQuantity: 0,
        completedQuantity: 0,
        efficiency: 0,
        defects: { stitchingDefects: 0, measurementDefects: 0, fabricDefects: 0, other: 0 },
        operations: { cutting: 0, sewing: 0, finishing: 0, packing: 0 },
        qualityGrade: 'A' as const,
        rework: 0
      };
    }
  };

  const [formData, setFormData] = useState<any>(getInitialFormData);

  useEffect(() => {
    if (editingEntry) {
      setFormData(editingEntry);
    } else {
      setFormData(getInitialFormData());
    }
  }, [editingEntry, productionType]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Auto-calculate efficiency for knitting
      if (productionType === 'knitting' && (field === 'actualProduction' || field === 'targetProduction')) {
        const actual = field === 'actualProduction' ? value : updated.actualProduction || 0;
        const target = field === 'targetProduction' ? value : updated.targetProduction || 0;
        updated.efficiency = target > 0 ? Math.round((actual / target) * 100) : 0;
      }

      // Auto-calculate efficiency for dyeing
      if (productionType === 'dyeing' && (field === 'actualProduction' || field === 'targetProduction')) {
        const actual = field === 'actualProduction' ? value : updated.actualProduction || 0;
        const target = field === 'targetProduction' ? value : updated.targetProduction || 0;
        updated.efficiency = target > 0 ? Math.round((actual / target) * 100) : 0;
      }

      // Auto-calculate efficiency for garments
      if (productionType === 'garments' && (field === 'completedQuantity' || field === 'targetQuantity')) {
        const completed = field === 'completedQuantity' ? value : updated.completedQuantity || 0;
        const target = field === 'targetQuantity' ? value : updated.targetQuantity || 0;
        updated.efficiency = target > 0 ? Math.round((completed / target) * 100) : 0;
      }
      
      return updated;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { id, userId, timestamp, ...dataToSave } = formData;
    onSave(dataToSave);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-card rounded-lg shadow-lg border border-border">
      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Basic Information Section */}
        <div className="bg-primary/10 p-6 rounded-lg border border-primary/20">
          <div className="flex items-center mb-4">
            <Clock className="w-5 h-5 text-primary mr-2" />
            <h3 className="text-lg font-semibold text-foreground">Basic Information</h3>
          </div>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Date</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <input
                  type="date"
                  value={formData.date || ''}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-border shadow-sm focus:border-primary focus:ring-4 focus:ring-primary/20 bg-background text-foreground transition-all duration-300 hover:border-primary/50 hover:shadow-md font-medium text-sm"
                  required
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Shift</label>
              <select
                value={formData.shift || 'morning'}
                onChange={(e) => handleInputChange('shift', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
              >
                <option value="morning">Morning (6 AM - 2 PM)</option>
                <option value="afternoon">Afternoon (2 PM - 10 PM)</option>
                <option value="night">Night (10 PM - 6 AM)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Operator</label>
              <input
                type="text"
                value={formData.operator || ''}
                onChange={(e) => handleInputChange('operator', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                placeholder="Operator name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Supervisor</label>
              <input
                type="text"
                value={formData.supervisor || ''}
                onChange={(e) => handleInputChange('supervisor', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                placeholder="Supervisor name"
                required
              />
            </div>
          </div>
        </div>

        {/* Machine & Timing Section */}
        <div className="bg-secondary/10 p-6 rounded-lg border border-secondary/20">
          <div className="flex items-center mb-4">
            <Settings className="w-5 h-5 text-secondary mr-2" />
            <h3 className="text-lg font-semibold text-foreground">Machine & Timing</h3>
          </div>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Machine No</label>
              <input
                type="text"
                value={formData.machineNo || ''}
                onChange={(e) => handleInputChange('machineNo', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-secondary bg-background text-foreground"
                placeholder="Machine number"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Start Time</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
                  <Clock className="h-5 w-5 text-secondary" />
                </div>
                <input
                  type="time"
                  value={formData.startTime || ''}
                  onChange={(e) => handleInputChange('startTime', e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-border shadow-sm focus:border-secondary focus:ring-4 focus:ring-secondary/20 bg-background text-foreground transition-all duration-300 hover:border-secondary/50 hover:shadow-md font-medium text-sm"
                  required
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="w-2 h-2 bg-secondary rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">End Time</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
                  <Timer className="h-5 w-5 text-accent" />
                </div>
                <input
                  type="time"
                  value={formData.endTime || ''}
                  onChange={(e) => handleInputChange('endTime', e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-border shadow-sm focus:border-accent focus:ring-4 focus:ring-accent/20 bg-background text-foreground transition-all duration-300 hover:border-accent/50 hover:shadow-md font-medium text-sm"
                  required
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Total Hours</label>
              <input
                type="number"
                value={formData.totalHours || ''}
                onChange={(e) => handleInputChange('totalHours', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-secondary bg-background text-foreground"
                placeholder="0.0"
                step="0.1"
                min="0"
              />
            </div>
          </div>
        </div>

        {/* Production Details Section */}
        <div className="bg-accent/10 p-6 rounded-lg border border-accent/20">
          <div className="flex items-center mb-4">
            <User className="w-5 h-5 text-accent mr-2" />
            <h3 className="text-lg font-semibold text-foreground">Production Details</h3>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {productionType === 'knitting' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Fabric Type</label>
                  <input
                    type="text"
                    value={formData.fabricType || ''}
                    onChange={(e) => handleInputChange('fabricType', e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent bg-background text-foreground"
                    placeholder="Fabric type"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Yarn Type</label>
                  <input
                    type="text"
                    value={formData.yarnType || ''}
                    onChange={(e) => handleInputChange('yarnType', e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent bg-background text-foreground"
                    placeholder="Yarn type"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Needle Count</label>
                  <input
                    type="number"
                    value={formData.needleCount || ''}
                    onChange={(e) => handleInputChange('needleCount', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent bg-background text-foreground"
                    placeholder="0"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">GSM</label>
                  <input
                    type="number"
                    value={formData.gsm || ''}
                    onChange={(e) => handleInputChange('gsm', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent bg-background text-foreground"
                    placeholder="0.0"
                    step="0.1"
                    min="0"
                  />
                </div>
              </>
            )}
            
            {productionType === 'dyeing' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Batch No</label>
                  <input
                    type="text"
                    value={formData.batchNo || ''}
                    onChange={(e) => handleInputChange('batchNo', e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent bg-background text-foreground"
                    placeholder="Batch number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Color</label>
                  <input
                    type="text"
                    value={formData.color || ''}
                    onChange={(e) => handleInputChange('color', e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent bg-background text-foreground"
                    placeholder="Color name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Batch Weight (kg)</label>
                  <input
                    type="number"
                    value={formData.batchWeight || ''}
                    onChange={(e) => handleInputChange('batchWeight', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent bg-background text-foreground"
                    placeholder="0.0"
                    step="0.1"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Liquor Ratio</label>
                  <input
                    type="number"
                    value={formData.liquorRatio || ''}
                    onChange={(e) => handleInputChange('liquorRatio', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent bg-background text-foreground"
                    placeholder="1:10"
                    step="0.1"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Temperature (°C)</label>
                  <input
                    type="number"
                    value={formData.temperature || ''}
                    onChange={(e) => handleInputChange('temperature', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent bg-background text-foreground"
                    placeholder="0.0"
                    step="0.1"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">pH Level</label>
                  <input
                    type="number"
                    value={formData.phLevel || ''}
                    onChange={(e) => handleInputChange('phLevel', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent bg-background text-foreground"
                    placeholder="0.0"
                    step="0.1"
                    min="0"
                    max="14"
                  />
                </div>
              </>
            )}
            
            {productionType === 'garments' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Style</label>
                  <input
                    type="text"
                    value={formData.style || ''}
                    onChange={(e) => handleInputChange('style', e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent bg-background text-foreground"
                    placeholder="T-Shirt, Polo, etc."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Size</label>
                  <input
                    type="text"
                    value={formData.size || ''}
                    onChange={(e) => handleInputChange('size', e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent bg-background text-foreground"
                    placeholder="S, M, L, XL"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Color</label>
                  <input
                    type="text"
                    value={formData.color || ''}
                    onChange={(e) => handleInputChange('color', e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent bg-background text-foreground"
                    placeholder="Color name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Buyer/Brand</label>
                  <input
                    type="text"
                    value={formData.buyer || ''}
                    onChange={(e) => handleInputChange('buyer', e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent bg-background text-foreground"
                    placeholder="Buyer name"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Production Metrics Section */}
        <div className="bg-destructive/10 p-6 rounded-lg border border-destructive/20">
          <div className="flex items-center mb-4">
            <BarChart3 className="w-5 h-5 text-destructive mr-2" />
            <h3 className="text-lg font-semibold text-foreground">Production Metrics</h3>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {productionType === 'knitting' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Target Production (kg)</label>
                  <input
                    type="number"
                    value={formData.targetProduction || ''}
                    onChange={(e) => handleInputChange('targetProduction', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-destructive bg-background text-foreground"
                    placeholder="0.0"
                    step="0.1"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Actual Production (kg)</label>
                  <input
                    type="number"
                    value={formData.actualProduction || ''}
                    onChange={(e) => handleInputChange('actualProduction', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-destructive bg-background text-foreground"
                    placeholder="0.0"
                    step="0.1"
                    min="0"
                    required
                  />
                </div>
              </>
            )}

            {productionType === 'dyeing' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Target Production (kg)</label>
                  <input
                    type="number"
                    value={formData.targetProduction || ''}
                    onChange={(e) => handleInputChange('targetProduction', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-destructive bg-background text-foreground"
                    placeholder="0.0"
                    step="0.1"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Actual Production (kg)</label>
                  <input
                    type="number"
                    value={formData.actualProduction || ''}
                    onChange={(e) => handleInputChange('actualProduction', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-destructive bg-background text-foreground"
                    placeholder="0.0"
                    step="0.1"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Efficiency (%)</label>
                  <input
                    type="number"
                    value={formData.efficiency || ''}
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-destructive bg-muted text-foreground"
                    placeholder="0"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Quality Grade</label>
                  <select
                    value={formData.qualityGrade || 'A'}
                    onChange={(e) => handleInputChange('qualityGrade', e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-destructive bg-background text-foreground"
                  >
                    <option value="A">Grade A</option>
                    <option value="B">Grade B</option>
                    <option value="C">Grade C</option>
                    <option value="Reject">Reject</option>
                  </select>
                </div>
              </>
            )}

            {productionType === 'garments' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Target Quantity (pcs)</label>
                  <input
                    type="number"
                    value={formData.targetQuantity || ''}
                    onChange={(e) => handleInputChange('targetQuantity', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-destructive bg-background text-foreground"
                    placeholder="0"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Completed Quantity (pcs)</label>
                  <input
                    type="number"
                    value={formData.completedQuantity || ''}
                    onChange={(e) => handleInputChange('completedQuantity', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-destructive bg-background text-foreground"
                    placeholder="0"
                    min="0"
                    required
                  />
                </div>
              </>
            )}
            {(productionType === 'knitting' || productionType === 'garments') && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Efficiency (%)</label>
                <input
                  type="number"
                  value={formData.efficiency || ''}
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-destructive bg-muted text-foreground"
                  placeholder="0"
                  readOnly
                />
              </div>
            )}

            {(productionType === 'knitting' || productionType === 'garments') && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Quality Grade</label>
                <select
                  value={formData.qualityGrade || 'A'}
                  onChange={(e) => handleInputChange('qualityGrade', e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-destructive bg-background text-foreground"
                >
                  <option value="A">Grade A</option>
                  <option value="B">Grade B</option>
                  <option value="C">Grade C</option>
                  <option value="Reject">Reject</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Defects Section - Knitting */}
        {productionType === 'knitting' && (
          <div className="bg-destructive/5 p-6 rounded-lg border border-destructive/30">
            <div className="flex items-center mb-4">
              <AlertTriangle className="w-5 h-5 text-destructive mr-2" />
              <h3 className="text-lg font-semibold text-foreground">Defects & Quality</h3>
            </div>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Holes</label>
                <input
                  type="number"
                  value={formData.defects?.holes || ''}
                  onChange={(e) => handleInputChange('defects', { ...formData.defects, holes: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-destructive bg-background text-foreground"
                  placeholder="0"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Drop Stitches</label>
                <input
                  type="number"
                  value={formData.defects?.dropStitches || ''}
                  onChange={(e) => handleInputChange('defects', { ...formData.defects, dropStitches: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-destructive bg-background text-foreground"
                  placeholder="0"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Yarn Breaks</label>
                <input
                  type="number"
                  value={formData.defects?.yarnBreaks || ''}
                  onChange={(e) => handleInputChange('defects', { ...formData.defects, yarnBreaks: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-destructive bg-background text-foreground"
                  placeholder="0"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Other Defects</label>
                <input
                  type="number"
                  value={formData.defects?.other || ''}
                  onChange={(e) => handleInputChange('defects', { ...formData.defects, other: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-destructive bg-background text-foreground"
                  placeholder="0"
                  min="0"
                />
              </div>
            </div>
          </div>
        )}

        {/* Defects Section - Garments */}
        {productionType === 'garments' && (
          <div className="bg-destructive/5 p-6 rounded-lg border border-destructive/30">
            <div className="flex items-center mb-4">
              <AlertTriangle className="w-5 h-5 text-destructive mr-2" />
              <h3 className="text-lg font-semibold text-foreground">Defects & Quality</h3>
            </div>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Stitching Defects</label>
                <input
                  type="number"
                  value={formData.defects?.stitchingDefects || ''}
                  onChange={(e) => handleInputChange('defects', { ...formData.defects, stitchingDefects: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-destructive bg-background text-foreground"
                  placeholder="0"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Measurement Defects</label>
                <input
                  type="number"
                  value={formData.defects?.measurementDefects || ''}
                  onChange={(e) => handleInputChange('defects', { ...formData.defects, measurementDefects: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-destructive bg-background text-foreground"
                  placeholder="0"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Fabric Defects</label>
                <input
                  type="number"
                  value={formData.defects?.fabricDefects || ''}
                  onChange={(e) => handleInputChange('defects', { ...formData.defects, fabricDefects: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-destructive bg-background text-foreground"
                  placeholder="0"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Other Defects</label>
                <input
                  type="number"
                  value={formData.defects?.other || ''}
                  onChange={(e) => handleInputChange('defects', { ...formData.defects, other: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-destructive bg-background text-foreground"
                  placeholder="0"
                  min="0"
                />
              </div>
            </div>
          </div>
        )}

        {/* Quality Results Section (Dyeing Only) */}
        {productionType === 'dyeing' && (
          <div className="bg-secondary/10 p-6 rounded-lg border border-secondary/20">
            <div className="flex items-center mb-4">
              <Award className="w-5 h-5 text-secondary mr-2" />
              <h3 className="text-lg font-semibold text-foreground">Quality Results</h3>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Color Match</label>
                <select
                  value={formData.qualityResults?.colorMatch || 'excellent'}
                  onChange={(e) => handleInputChange('qualityResults', { ...formData.qualityResults, colorMatch: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-secondary bg-background text-foreground"
                >
                  <option value="excellent">Excellent</option>
                  <option value="good">Good</option>
                  <option value="acceptable">Acceptable</option>
                  <option value="poor">Poor</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Fastness</label>
                <select
                  value={formData.qualityResults?.fastness || 'excellent'}
                  onChange={(e) => handleInputChange('qualityResults', { ...formData.qualityResults, fastness: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-secondary bg-background text-foreground"
                >
                  <option value="excellent">Excellent</option>
                  <option value="good">Good</option>
                  <option value="acceptable">Acceptable</option>
                  <option value="poor">Poor</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Uniformity</label>
                <select
                  value={formData.qualityResults?.uniformity || 'excellent'}
                  onChange={(e) => handleInputChange('qualityResults', { ...formData.qualityResults, uniformity: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-secondary bg-background text-foreground"
                >
                  <option value="excellent">Excellent</option>
                  <option value="good">Good</option>
                  <option value="acceptable">Acceptable</option>
                  <option value="poor">Poor</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Chemical Consumption Section (Dyeing Only) */}
        {productionType === 'dyeing' && (
          <div className="bg-primary/5 p-6 rounded-lg border border-primary/30">
            <div className="flex items-center mb-4">
              <Beaker className="w-5 h-5 text-primary mr-2" />
              <h3 className="text-lg font-semibold text-foreground">Chemical Consumption</h3>
            </div>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Dyes (kg)</label>
                <input
                  type="number"
                  value={formData.chemicalConsumption?.dyes || ''}
                  onChange={(e) => handleInputChange('chemicalConsumption', { ...formData.chemicalConsumption, dyes: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                  placeholder="0.0"
                  step="0.01"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Salt (kg)</label>
                <input
                  type="number"
                  value={formData.chemicalConsumption?.salt || ''}
                  onChange={(e) => handleInputChange('chemicalConsumption', { ...formData.chemicalConsumption, salt: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                  placeholder="0.0"
                  step="0.01"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Soda (kg)</label>
                <input
                  type="number"
                  value={formData.chemicalConsumption?.soda || ''}
                  onChange={(e) => handleInputChange('chemicalConsumption', { ...formData.chemicalConsumption, soda: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                  placeholder="0.0"
                  step="0.01"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Auxiliaries (kg)</label>
                <input
                  type="number"
                  value={formData.chemicalConsumption?.auxiliaries || ''}
                  onChange={(e) => handleInputChange('chemicalConsumption', { ...formData.chemicalConsumption, auxiliaries: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                  placeholder="0.0"
                  step="0.01"
                  min="0"
                />
              </div>
            </div>
          </div>
        )}

        {/* Additional Notes Section */}
        <div className="bg-muted/30 p-6 rounded-lg border border-border">
          <div className="flex items-center mb-4">
            <User className="w-5 h-5 text-muted-foreground mr-2" />
            <h3 className="text-lg font-semibold text-foreground">Additional Notes</h3>
          </div>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Production Notes</label>
              <textarea
                value={formData.notes || ''}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-muted-foreground bg-background text-foreground"
                placeholder="Additional notes about production..."
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-border">
          <Button
            type="button"
            onClick={onCancel}
            variant="outline"
            className="px-6 py-2"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="px-6 py-2 bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {editingEntry ? 'Update Entry' : 'Save Entry'}
          </Button>
        </div>
      </form>
    </div>
  );
};