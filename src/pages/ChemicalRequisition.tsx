import React, { useState, useEffect } from 'react';
import { ChemicalItemsTable } from '../components/ChemicalItemsTable';
import { ChemicalItem } from '../types/chemical';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import { Button } from '../components/ui/button';
import { Download, Printer, Save, Share2 } from 'lucide-react';
import { generatePdf } from '../utils/pdfGenerator';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebaseConfig'; // Standardized Firebase import
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { toast } from 'sonner';
import { useNavigate, useParams } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

const ChemicalRequisition: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [totalWater, setTotalWater] = useState<number | null>(null);
  const [fabricWeight, setFabricWeight] = useState<number | null>(null);
  const [items, setItems] = useState<ChemicalItem[]>([]);
  const [reportName, setReportName] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [isNewReport, setIsNewReport] = useState(true);

  useEffect(() => {
    if (id && currentUser) {
      const fetchReport = async () => {
        try {
          const docRef = doc(db, `users/${currentUser.uid}/chemicalReports`, id);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const data = docSnap.data();
            setTotalWater(data.totalWater ?? null);
            setFabricWeight(data.fabricWeight ?? null);
            setItems(data.items || []);
            setReportName(data.reportName || `Chemical Requisition - ${new Date().toLocaleDateString()}`);
            setIsNewReport(false);
          } else {
            toast.error("Report not found.");
            navigate('/chemical-requisition'); // Redirect to new report if not found
          }
        } catch (error) {
          console.error("Error fetching report:", error);
          toast.error("Failed to load report.");
        }
      };
      fetchReport();
    } else {
      // Initialize for a new report
      setTotalWater(null);
      setFabricWeight(null);
      setItems([]);
      setReportName(`Chemical Requisition - ${new Date().toLocaleDateString()}`);
      setIsNewReport(true);
    }
  }, [id, currentUser, navigate]);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) {
      return;
    }

    const reorderedItems = Array.from(items);
    const [movedItem] = reorderedItems.splice(result.source.index, 1);
    reorderedItems.splice(result.destination.index, 0, movedItem);

    setItems(reorderedItems);
  };

  const handleSaveReport = async () => {
    if (!currentUser) {
      toast.error("You must be logged in to save reports.");
      return;
    }

    setIsSaving(true);
    try {
      const reportId = id || uuidv4();
      const reportData = {
        totalWater,
        fabricWeight,
        items,
        reportName,
        createdAt: id ? (await getDoc(doc(db, `users/${currentUser.uid}/chemicalReports`, id))).data()?.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: currentUser.uid,
      };
      await setDoc(doc(db, `users/${currentUser.uid}/chemicalReports`, reportId), reportData);
      toast.success("Report saved successfully!");
      setIsNewReport(false);
      if (!id) {
        navigate(`/chemical-requisition/${reportId}`);
      }
    } catch (error) {
      console.error("Error saving report:", error);
      toast.error("Failed to save report.");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrintReport = () => {
    generatePdf(reportName, totalWater, fabricWeight, items);
  };

  const handleShareReport = () => {
    if (!id) {
      toast.error("Please save the report before sharing.");
      return;
    }
    const shareUrl = `${window.location.origin}/chemical-requisition/${id}`;
    navigator.clipboard.writeText(shareUrl)
      .then(() => toast.success("Report link copied to clipboard!"))
      .catch(() => toast.error("Failed to copy link."));
  };

  const totalCost = items.reduce((sum, item) => sum + item.costing, 0);

  return (
    <div className="container mx-auto p-6 bg-surface rounded-lg shadow-lg my-8">
      <h1 className="text-3xl font-bold text-foreground mb-6 text-center">Chemical Requisition (Sample/Bulk)</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <label htmlFor="reportName" className="block text-sm font-medium text-text-secondary mb-1">Report Name</label>
          <input
            type="text"
            id="reportName"
            value={reportName}
            onChange={(e) => setReportName(e.target.value)}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-foreground shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20"
            placeholder="e.g., Lab Trial 123"
          />
        </div>
        <div>
          <label htmlFor="totalWater" className="block text-sm font-medium text-text-secondary mb-1">Total Water (Liters)</label>
          <input
            type="number"
            id="totalWater"
            value={totalWater ?? ''}
            onChange={(e) => setTotalWater(e.target.value === '' ? null : Number(e.target.value))}
            className="w-full rounded-md border border-border bg-background px-3 py-0 text-xs text-foreground shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20"
            placeholder="e.g., 100"
            min="0"
            step="any"
          />
        </div>
        <div>
          <label htmlFor="fabricWeight" className="block text-sm font-medium text-text-secondary mb-1">Fabric Weight (KG)</label>
          <input
            type="number"
            id="fabricWeight"
            value={fabricWeight ?? ''}
            onChange={(e) => setFabricWeight(e.target.value === '' ? null : Number(e.target.value))}
            className="w-full rounded-md border border-border bg-background px-3 py-0 text-xs text-foreground shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20"
            placeholder="e.g., 5"
            min="0"
            step="any"
          />
        </div>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <ChemicalItemsTable
          items={items}
          totalWater={totalWater}
          fabricWeight={fabricWeight}
          onItemsChange={setItems}
        />
      </DragDropContext>

      <div className="mt-8 flex justify-between items-center border-t border-border pt-4">
        <div className="text-lg font-semibold text-foreground">
          Total Estimated Cost: <span className="text-primary">${totalCost.toFixed(2)}</span>
        </div>
        <div className="flex space-x-3">
          <Button onClick={handleSaveReport} disabled={isSaving} className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            {isSaving ? 'Saving...' : (isNewReport ? 'Save Report' : 'Update Report')}
          </Button>
          <Button onClick={handlePrintReport} variant="outline" className="flex items-center gap-2">
            <Printer className="h-4 w-4" />
            Print
          </Button>
          <Button onClick={handleShareReport} variant="outline" className="flex items-center gap-2" disabled={isNewReport}>
            <Share2 className="h-4 w-4" />
            Share
          </Button>
          <Button onClick={() => navigate('/chemical-requisition')} variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            New Report
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChemicalRequisition;
