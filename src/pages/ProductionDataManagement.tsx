import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  BarChart3,
  Edit,
  Trash2,
  Layers,
  Droplets,
  Shirt,
  Calendar,
  Clock,
  User,
  Settings as SettingsIcon,
  Loader2,
  Filter,
  Search,
  Download,
  Upload,
  Eye
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { ProductionDataEntry } from '../components/ProductionDataEntry';
import { ProductionReports } from '../components/ProductionReports';
import { AnalyticsDashboard } from '../components/AnalyticsDashboard';
import { AlertDialog } from '../components/AlertDialog';
import { 
  ProductionEntry, 
  PRODUCTION_TYPES,
  initialKnittingEntry,
  initialDyeingEntry,
  initialGarmentsEntry
} from '../types/production';
import { db } from '../lib/firebaseConfig';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  doc,
  where 
} from 'firebase/firestore';
import { useToast } from '../components/ui/ToastProvider';
import * as Select from '@radix-ui/react-select';

interface ProductionDataManagementProps {
  user: any;
}

export function ProductionDataManagement({ user }: ProductionDataManagementProps) {
  const [activeTab, setActiveTab] = useState<'entry' | 'reports' | 'history'>('entry');
  const [productionType, setProductionType] = useState<'knitting' | 'dyeing' | 'garments'>('knitting');
  const [entries, setEntries] = useState<ProductionEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEntryDialogOpen, setIsEntryDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<ProductionEntry | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [shiftFilter, setShiftFilter] = useState<string>('all');

  const { showToast } = useToast();

  // Fetch user-specific production entries from Firebase
  useEffect(() => {
    if (!user) {
      setEntries([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const entriesCollectionRef = collection(db, "users", user.uid, "productionEntries");
    const q = query(entriesCollectionRef, orderBy("timestamp", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allEntries: ProductionEntry[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ProductionEntry[];
      
      // Filter by production type on the client side
      const filteredEntries = allEntries.filter(entry => entry.type === productionType);
      setEntries(filteredEntries);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching production entries:", error);
      showToast({
        message: "Error fetching production entries from cloud. Please try again.",
        type: 'error',
      });
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, productionType, showToast]);

  // Filter entries based on search and filters
  const filteredEntries = entries.filter(entry => {
    const matchesSearch = searchTerm === '' || 
      entry.operator.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.supervisor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.machineNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (productionType === 'knitting' && (entry as any).fabricType?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (productionType === 'dyeing' && ((entry as any).color?.toLowerCase().includes(searchTerm.toLowerCase()) || (entry as any).fabricType?.toLowerCase().includes(searchTerm.toLowerCase()))) ||
      (productionType === 'garments' && ((entry as any).style?.toLowerCase().includes(searchTerm.toLowerCase()) || (entry as any).color?.toLowerCase().includes(searchTerm.toLowerCase())));
    
    const matchesDate = dateFilter === '' || entry.date === dateFilter;
    const matchesShift = shiftFilter === 'all' || entry.shift === shiftFilter;
    
    return matchesSearch && matchesDate && matchesShift;
  });

  const handleSaveEntry = async (entryData: Omit<ProductionEntry, 'id' | 'userId' | 'timestamp'>) => {
    if (!user) {
      showToast({ message: "Please log in to save production entries.", type: 'warning' });
      return;
    }

    try {
      const newEntry = {
        ...entryData,
        userId: user.uid,
        timestamp: new Date().toISOString(),
      };

      if (editingEntry) {
        await updateDoc(doc(db, "users", user.uid, "productionEntries", editingEntry.id), newEntry);
        showToast({ message: "Production entry updated successfully!", type: 'success' });
      } else {
        await addDoc(collection(db, "users", user.uid, "productionEntries"), newEntry);
        showToast({ message: "Production entry saved successfully!", type: 'success' });
      }
      
      setIsEntryDialogOpen(false);
      setEditingEntry(null);
    } catch (error) {
      console.error("Error saving production entry:", error);
      showToast({ message: "Error saving production entry. Check console for details.", type: 'error' });
    }
  };

  const handleEditEntry = (entry: ProductionEntry) => {
    setEditingEntry(entry);
    setIsEntryDialogOpen(true);
    setActiveTab('entry');
  };

  const handleDeleteEntry = async (entryId: string) => {
    if (!user) {
      showToast({ message: "Please log in to delete production entries.", type: 'warning' });
      return;
    }

    try {
      await deleteDoc(doc(db, "users", user.uid, "productionEntries", entryId));
      showToast({ message: "Production entry deleted successfully!", type: 'success' });
    } catch (error) {
      console.error("Error deleting production entry:", error);
      showToast({ message: "Error deleting production entry. Check console for details.", type: 'error' });
    } finally {
      setDeleteConfirm(null);
    }
  };

  const getProductionTypeIcon = (type: string) => {
    switch (type) {
      case 'knitting': return <Layers className="h-5 w-5" />;
      case 'dyeing': return <Droplets className="h-5 w-5" />;
      case 'garments': return <Shirt className="h-5 w-5" />;
      default: return <SettingsIcon className="h-5 w-5" />;
    }
  };

  const getProductionTypeColor = (type: string) => {
    switch (type) {
      case 'knitting': return 'from-blue-500 to-blue-600';
      case 'dyeing': return 'from-purple-500 to-purple-600';
      case 'garments': return 'from-green-500 to-green-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const handleExportToExcel = () => {
    if (filteredEntries.length === 0) {
      showToast({ message: "No data to export", type: 'warning' });
      return;
    }

    const exportData = filteredEntries.map(entry => {
      const baseData = {
        Date: new Date(entry.date).toLocaleDateString(),
        Shift: entry.shift,
        Machine: entry.machineNo,
        Operator: entry.operator,
        Supervisor: entry.supervisor,
        'Start Time': entry.startTime,
        'End Time': entry.endTime,
        'Total Hours': entry.totalHours,
      };

      if (productionType === 'knitting') {
        const knittingEntry = entry as any;
        return {
          ...baseData,
          'Fabric Type': knittingEntry.fabricType,
          'Yarn Type': knittingEntry.yarnType,
          'Yarn Lot': knittingEntry.yarnLot,
          Gauge: knittingEntry.gauge,
          GSM: knittingEntry.gsm,
          Width: knittingEntry.width,
          'Target Production (kg)': knittingEntry.targetProduction,
          'Actual Production (kg)': knittingEntry.actualProduction,
          'Efficiency (%)': knittingEntry.efficiency,
          'Quality Grade': entry.qualityGrade,
          RPM: knittingEntry.rpm,
          'Needle Breaks': knittingEntry.needleBreaks,
          'Defects - Holes': knittingEntry.defects?.holes || 0,
          'Defects - Drop Stitches': knittingEntry.defects?.dropStitches || 0,
          'Defects - Yarn Breaks': knittingEntry.defects?.yarnBreaks || 0,
          'Defects - Other': knittingEntry.defects?.other || 0,
          Notes: entry.notes || '',
        };
      } else if (productionType === 'dyeing') {
        const dyeingEntry = entry as any;
        return {
          ...baseData,
          'Fabric Type': dyeingEntry.fabricType,
          Color: dyeingEntry.color,
          'Dye Type': dyeingEntry.dyeType,
          'Batch Weight (kg)': dyeingEntry.batchWeight,
          'Liquor Ratio': dyeingEntry.liquorRatio,
          'Temperature (°C)': dyeingEntry.temperature,
          'pH Level': dyeingEntry.pH,
          'Process Time (min)': dyeingEntry.processTime,
          'Target Production (kg)': dyeingEntry.targetProduction,
          'Actual Production (kg)': dyeingEntry.actualProduction,
          'Efficiency (%)': dyeingEntry.efficiency,
          'Quality Grade': entry.qualityGrade,
          'Chemical - Dyes (kg)': dyeingEntry.chemicalConsumption?.dyes || 0,
          'Chemical - Salt (kg)': dyeingEntry.chemicalConsumption?.salt || 0,
          'Chemical - Soda (kg)': dyeingEntry.chemicalConsumption?.soda || 0,
          'Chemical - Auxiliaries (kg)': dyeingEntry.chemicalConsumption?.auxiliaries || 0,
          'Color Match': dyeingEntry.qualityResults?.colorMatch || '',
          Fastness: dyeingEntry.qualityResults?.fastness || '',
          Uniformity: dyeingEntry.qualityResults?.uniformity || '',
          'Water Consumption (L)': dyeingEntry.waterConsumption,
          'Energy Consumption (kWh)': dyeingEntry.energyConsumption,
          'Waste Generated (kg)': dyeingEntry.wasteGenerated,
          Notes: entry.notes || '',
        };
      } else {
        const garmentsEntry = entry as any;
        return {
          ...baseData,
          Style: garmentsEntry.style,
          Size: garmentsEntry.size,
          Color: garmentsEntry.color,
          'Target Quantity (pcs)': garmentsEntry.targetQuantity,
          'Completed Quantity (pcs)': garmentsEntry.completedQuantity,
          'Efficiency (%)': garmentsEntry.efficiency,
          'Quality Grade': entry.qualityGrade,
          'Defects - Stitching': garmentsEntry.defects?.stitchingDefects || 0,
          'Defects - Measurement': garmentsEntry.defects?.measurementDefects || 0,
          'Defects - Fabric': garmentsEntry.defects?.fabricDefects || 0,
          'Defects - Other': garmentsEntry.defects?.other || 0,
          'Operations - Cutting': garmentsEntry.operations?.cutting || 0,
          'Operations - Sewing': garmentsEntry.operations?.sewing || 0,
          'Operations - Finishing': garmentsEntry.operations?.finishing || 0,
          'Operations - Packing': garmentsEntry.operations?.packing || 0,
          Rework: garmentsEntry.rework,
          Notes: entry.notes || '',
        };
      }
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `${productionType} Production`);

    const fileName = `${productionType}_production_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);

    showToast({ message: `Data exported to ${fileName}`, type: 'success' });
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportFromExcel = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        if (jsonData.length === 0) {
          showToast({ message: "No data found in the Excel file", type: 'warning' });
          return;
        }

        let successCount = 0;
        let errorCount = 0;

        for (const row of jsonData as any[]) {
          try {
            const baseEntry = {
              date: row['Date'] ? new Date(row['Date']).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
              shift: (row['Shift'] || 'morning').toLowerCase() as 'morning' | 'afternoon' | 'night',
              operator: row['Operator'] || '',
              supervisor: row['Supervisor'] || '',
              machineNo: row['Machine'] || '',
              startTime: row['Start Time'] || '',
              endTime: row['End Time'] || '',
              totalHours: parseFloat(row['Total Hours']) || 0,
              notes: row['Notes'] || '',
              type: productionType,
            };

            let entryData: any = { ...baseEntry };

            if (productionType === 'knitting') {
              entryData = {
                ...entryData,
                fabricType: row['Fabric Type'] || '',
                yarnType: row['Yarn Type'] || '',
                yarnLot: row['Yarn Lot'] || '',
                gauge: row['Gauge'] || '',
                gsm: parseFloat(row['GSM']) || 0,
                width: parseFloat(row['Width']) || 0,
                targetProduction: parseFloat(row['Target Production (kg)']) || 0,
                actualProduction: parseFloat(row['Actual Production (kg)']) || 0,
                efficiency: parseFloat(row['Efficiency (%)']) || 0,
                qualityGrade: row['Quality Grade'] || 'A',
                rpm: parseFloat(row['RPM']) || 0,
                needleBreaks: parseInt(row['Needle Breaks']) || 0,
                defects: {
                  holes: parseInt(row['Defects - Holes']) || 0,
                  dropStitches: parseInt(row['Defects - Drop Stitches']) || 0,
                  yarnBreaks: parseInt(row['Defects - Yarn Breaks']) || 0,
                  other: parseInt(row['Defects - Other']) || 0,
                },
              };
            } else if (productionType === 'dyeing') {
              entryData = {
                ...entryData,
                fabricType: row['Fabric Type'] || '',
                color: row['Color'] || '',
                dyeType: row['Dye Type'] || '',
                batchWeight: parseFloat(row['Batch Weight (kg)']) || 0,
                liquorRatio: parseFloat(row['Liquor Ratio']) || 0,
                temperature: parseFloat(row['Temperature (°C)']) || 0,
                pH: parseFloat(row['pH Level']) || 0,
                processTime: parseFloat(row['Process Time (min)']) || 0,
                targetProduction: parseFloat(row['Target Production (kg)']) || 0,
                actualProduction: parseFloat(row['Actual Production (kg)']) || 0,
                efficiency: parseFloat(row['Efficiency (%)']) || 0,
                qualityGrade: row['Quality Grade'] || 'A',
                chemicalConsumption: {
                  dyes: parseFloat(row['Chemical - Dyes (kg)']) || 0,
                  salt: parseFloat(row['Chemical - Salt (kg)']) || 0,
                  soda: parseFloat(row['Chemical - Soda (kg)']) || 0,
                  auxiliaries: parseFloat(row['Chemical - Auxiliaries (kg)']) || 0,
                },
                qualityResults: {
                  colorMatch: (row['Color Match'] || 'excellent').toLowerCase(),
                  fastness: (row['Fastness'] || 'excellent').toLowerCase(),
                  uniformity: (row['Uniformity'] || 'excellent').toLowerCase(),
                },
                waterConsumption: parseFloat(row['Water Consumption (L)']) || 0,
                energyConsumption: parseFloat(row['Energy Consumption (kWh)']) || 0,
                wasteGenerated: parseFloat(row['Waste Generated (kg)']) || 0,
              };
            } else {
              entryData = {
                ...entryData,
                style: row['Style'] || '',
                size: row['Size'] || '',
                color: row['Color'] || '',
                targetQuantity: parseInt(row['Target Quantity (pcs)']) || 0,
                completedQuantity: parseInt(row['Completed Quantity (pcs)']) || 0,
                efficiency: parseFloat(row['Efficiency (%)']) || 0,
                qualityGrade: row['Quality Grade'] || 'A',
                defects: {
                  stitchingDefects: parseInt(row['Defects - Stitching']) || 0,
                  measurementDefects: parseInt(row['Defects - Measurement']) || 0,
                  fabricDefects: parseInt(row['Defects - Fabric']) || 0,
                  other: parseInt(row['Defects - Other']) || 0,
                },
                operations: {
                  cutting: parseInt(row['Operations - Cutting']) || 0,
                  sewing: parseInt(row['Operations - Sewing']) || 0,
                  finishing: parseInt(row['Operations - Finishing']) || 0,
                  packing: parseInt(row['Operations - Packing']) || 0,
                },
                rework: parseInt(row['Rework']) || 0,
              };
            }

            const newEntry = {
              ...entryData,
              userId: user.uid,
              timestamp: new Date().toISOString(),
            };

            await addDoc(collection(db, "users", user.uid, "productionEntries"), newEntry);
            successCount++;
          } catch (error) {
            console.error("Error importing row:", error);
            errorCount++;
          }
        }

        if (successCount > 0) {
          showToast({ message: `Successfully imported ${successCount} entries${errorCount > 0 ? ` (${errorCount} failed)` : ''}`, type: 'success' });
        } else {
          showToast({ message: "Failed to import data. Please check the file format.", type: 'error' });
        }

        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } catch (error) {
        console.error("Error reading Excel file:", error);
        showToast({ message: "Error reading Excel file. Please check the file format.", type: 'error' });
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card text-card-foreground border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Production Data Management</h1>
              <p className="text-muted-foreground mt-1">Track daily production data across knitting, dyeing, and garments</p>
            </div>
            <div className="flex items-center gap-3">
              <Select.Root value={productionType} onValueChange={(value) => setProductionType(value as any)}>
                <Select.Trigger className="flex items-center justify-between w-64 rounded-lg border border-border shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 bg-background text-foreground py-2 px-3">
                  <div className="flex items-center gap-2">
                    {getProductionTypeIcon(productionType)}
                    <Select.Value />
                  </div>
                  <Select.Icon>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </Select.Icon>
                </Select.Trigger>
                <Select.Portal>
                  <Select.Content className="overflow-hidden rounded-lg bg-card border border-border shadow-lg z-50">
                    <Select.Viewport className="p-1">
                      {PRODUCTION_TYPES.map(type => (
                        <Select.Item key={type.value} value={type.value} className="relative flex items-center rounded-md py-2 pl-3 pr-9 text-foreground text-sm outline-none data-[highlighted]:bg-primary/20">
                          <Select.ItemText>{type.label}</Select.ItemText>
                        </Select.Item>
                      ))}
                    </Select.Viewport>
                  </Select.Content>
                </Select.Portal>
              </Select.Root>
              
              <Button
                onClick={() => {
                  setEditingEntry(null);
                  setIsEntryDialogOpen(true);
                }}
                className="bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Entry
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit mt-4">
            <button
              onClick={() => setActiveTab('entry')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${
                activeTab === 'entry'
                  ? 'bg-card shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Plus className="h-4 w-4" />
              Data Entry
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${
                activeTab === 'reports'
                  ? 'bg-card shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <BarChart3 className="h-4 w-4" />
              Reports & Analytics
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${
                activeTab === 'history'
                  ? 'bg-card shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Clock className="h-4 w-4" />
              History ({entries.length})
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'entry' && (
            <motion.div
              key="entry"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="bg-card rounded-lg shadow-sm border border-border p-8">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className={`p-4 rounded-xl bg-gradient-to-br ${getProductionTypeColor(productionType)}`}>
                      {getProductionTypeIcon(productionType)}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-foreground capitalize">
                        {productionType} Production Entry
                      </h2>
                      <p className="text-muted-foreground">Record daily production data and metrics</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => {
                      setEditingEntry(null);
                      setIsEntryDialogOpen(true);
                    }}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add New Entry
                  </Button>
                </div>
                
                <ProductionDataEntry
                  productionType={productionType}
                  onSave={handleSaveEntry}
                  editingEntry={editingEntry}
                  onCancel={() => {
                    setEditingEntry(null);
                    setIsEntryDialogOpen(false);
                  }}
                />
              </div>
            </motion.div>
          )}

          {activeTab === 'reports' && (
            <motion.div
              key="reports"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <AnalyticsDashboard
                entries={entries}
                productionType={productionType}
              />
              <ProductionReports
                entries={entries}
                productionType={productionType}
              />
            </motion.div>
          )}

          {activeTab === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Filters */}
              <div className="bg-card p-6 rounded-lg border border-border">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      type="text"
                      placeholder="Search by operator, machine, fabric type..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="w-40 rounded-lg border border-border shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 bg-background text-foreground py-2 px-3 text-sm font-medium"
                  />
                  
                  <Select.Root value={shiftFilter} onValueChange={setShiftFilter}>
                    <Select.Trigger className="flex items-center justify-between w-40 rounded-md border border-border shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 bg-background text-foreground py-2 px-3">
                      <Select.Value placeholder="All Shifts" />
                      <Select.Icon>
                        <Filter className="h-4 w-4" />
                      </Select.Icon>
                    </Select.Trigger>
                    <Select.Portal>
                      <Select.Content className="overflow-hidden rounded-lg bg-card border border-border shadow-lg z-50">
                        <Select.Viewport className="p-1">
                          <Select.Item value="all" className="relative flex items-center rounded-md py-2 pl-3 pr-9 text-foreground text-sm outline-none data-[highlighted]:bg-primary/20">
                            <Select.ItemText>All Shifts</Select.ItemText>
                          </Select.Item>
                          <Select.Item value="morning" className="relative flex items-center rounded-md py-2 pl-3 pr-9 text-foreground text-sm outline-none data-[highlighted]:bg-primary/20">
                            <Select.ItemText>Morning</Select.ItemText>
                          </Select.Item>
                          <Select.Item value="afternoon" className="relative flex items-center rounded-md py-2 pl-3 pr-9 text-foreground text-sm outline-none data-[highlighted]:bg-primary/20">
                            <Select.ItemText>Afternoon</Select.ItemText>
                          </Select.Item>
                          <Select.Item value="night" className="relative flex items-center rounded-md py-2 pl-3 pr-9 text-foreground text-sm outline-none data-[highlighted]:bg-primary/20">
                            <Select.ItemText>Night</Select.ItemText>
                          </Select.Item>
                        </Select.Viewport>
                      </Select.Content>
                    </Select.Portal>
                  </Select.Root>
                </div>
              </div>

              {/* History Table */}
              <div className="bg-card p-6 rounded-lg border border-border">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-foreground capitalize">
                      {productionType} Production History
                    </h3>
                    <p className="text-muted-foreground">
                      {filteredEntries.length} entries found
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex items-center gap-2"
                      onClick={handleExportToExcel}
                    >
                      <Download className="h-4 w-4" />
                      Export
                    </Button>
                    <Button
                      variant="outline"
                      className="flex items-center gap-2"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-4 w-4" />
                      Import
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={handleImportFromExcel}
                      className="hidden"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  {loading ? (
                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                      <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                      <p className="text-lg font-medium">Loading production entries...</p>
                    </div>
                  ) : filteredEntries.length === 0 ? (
                    <div className="text-center py-12">
                      <Eye className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                      <p className="text-lg font-medium text-foreground">No entries found</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {searchTerm || dateFilter || shiftFilter !== 'all'
                          ? 'Try adjusting your filters'
                          : 'Start recording production data to see entries here'
                        }
                      </p>
                    </div>
                  ) : (
                    <table className="min-w-full border-collapse border border-border">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="border border-border px-4 py-3 text-center text-sm font-medium text-foreground">Date</th>
                          <th className="border border-border px-4 py-3 text-center text-sm font-medium text-foreground">Shift</th>
                          <th className="border border-border px-4 py-3 text-center text-sm font-medium text-foreground">Machine</th>
                          <th className="border border-border px-4 py-3 text-center text-sm font-medium text-foreground">Operator</th>
                          {productionType === 'knitting' && (
                            <>
                              <th className="border border-border px-4 py-3 text-center text-sm font-medium text-foreground">Fabric Type</th>
                              <th className="border border-border px-4 py-3 text-center text-sm font-medium text-foreground">Production (kg)</th>
                            </>
                          )}
                          {productionType === 'dyeing' && (
                            <>
                              <th className="border border-border px-4 py-3 text-center text-sm font-medium text-foreground">Color</th>
                              <th className="border border-border px-4 py-3 text-center text-sm font-medium text-foreground">Production (kg)</th>
                            </>
                          )}
                          {productionType === 'garments' && (
                            <>
                              <th className="border border-border px-4 py-3 text-center text-sm font-medium text-foreground">Style</th>
                              <th className="border border-border px-4 py-3 text-center text-sm font-medium text-foreground">Completed (pcs)</th>
                            </>
                          )}
                          <th className="border border-border px-4 py-3 text-center text-sm font-medium text-foreground">Efficiency</th>
                          <th className="border border-border px-4 py-3 text-center text-sm font-medium text-foreground">Quality</th>
                          <th className="border border-border px-4 py-3 text-center text-sm font-medium text-foreground">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredEntries.map((entry) => (
                          <tr key={entry.id} className="hover:bg-muted/30 transition-colors">
                            <td className="border border-border px-4 py-3 text-sm text-foreground text-center">
                              {new Date(entry.date).toLocaleDateString()}
                            </td>
                            <td className="border border-border px-4 py-3 text-sm text-foreground capitalize text-center">
                              {entry.shift}
                            </td>
                            <td className="border border-border px-4 py-3 text-sm text-foreground font-mono text-center">
                              {entry.machineNo}
                            </td>
                            <td className="border border-border px-4 py-3 text-sm text-foreground text-center">
                              {entry.operator}
                            </td>
                            {productionType === 'knitting' && (
                              <>
                                <td className="border border-border px-4 py-3 text-sm text-foreground text-center">
                                  {(entry as any).fabricType}
                                </td>
                                <td className="border border-border px-4 py-3 text-sm text-foreground text-center">
                                  {(entry as any).actualProduction || 0}
                                </td>
                              </>
                            )}
                            {productionType === 'dyeing' && (
                              <>
                                <td className="border border-border px-4 py-3 text-sm text-foreground text-center">
                                  {(entry as any).color}
                                </td>
                                <td className="border border-border px-4 py-3 text-sm text-foreground text-center">
                                  {(entry as any).actualProduction || 0}
                                </td>
                              </>
                            )}
                            {productionType === 'garments' && (
                              <>
                                <td className="border border-border px-4 py-3 text-sm text-foreground text-center">
                                  {(entry as any).style}
                                </td>
                                <td className="border border-border px-4 py-3 text-sm text-foreground text-center">
                                  {(entry as any).completedQuantity || 0}
                                </td>
                              </>
                            )}
                            <td className="border border-border px-4 py-3 text-sm text-foreground text-center">
                              {entry.efficiency || 0}%
                            </td>
                            <td className="border border-border px-4 py-3 text-center">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                entry.qualityGrade === 'A' ? 'bg-green-100 text-green-800' :
                                entry.qualityGrade === 'B' ? 'bg-blue-100 text-blue-800' :
                                entry.qualityGrade === 'C' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {entry.qualityGrade}
                              </span>
                            </td>
                            <td className="border border-border px-4 py-3 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditEntry(entry)}
                                  className="text-blue-600 hover:text-blue-700"
                                  title="Edit Entry"
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setDeleteConfirm(entry.id)}
                                  className="text-red-600 hover:text-red-700"
                                  title="Delete Entry"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <AlertDialog
          isOpen={true}
          onClose={() => setDeleteConfirm(null)}
          title="Delete Production Entry"
          message="Are you sure you want to delete this production entry? This action cannot be undone."
          type="confirm"
          onConfirm={() => handleDeleteEntry(deleteConfirm)}
          onCancel={() => setDeleteConfirm(null)}
          confirmText="Delete"
          cancelText="Cancel"
        />
      )}
    </div>
  );
}