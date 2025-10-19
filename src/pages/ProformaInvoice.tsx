import React, { useState, useEffect, useRef, useCallback } from 'react';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import { FileText, Printer, FolderOpen, Clock, Search, Trash2, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { ProformaInvoiceForm } from '../components/ProformaInvoiceForm';
import { InvoiceItemsTable } from '../components/InvoiceItemsTable';
import { PrintableInvoice } from '../components/PrintableInvoice';
import { SaveRecipeDialog } from '../components/SaveRecipeDialog';
import { ViewRecipesDialog } from '../components/ViewRecipesDialog';
import { AlertDialog } from '../components/AlertDialog';
import { SaveOptionsDialog } from '../components/SaveOptionsDialog';
import { PasswordInputDialog } from '../components/PasswordInputDialog';
import { useToast } from '../components/ui/ToastProvider';
import { useReactToPrint } from 'react-to-print';
import { ProformaInvoiceData, InvoiceItem, initialInvoiceData } from '../types/invoice';
import type { Recipe } from '../types';
import { db, auth } from '../lib/firebaseConfig';
import { collection, addDoc, updateDoc, doc, deleteDoc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { onAuthStateChanged, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';

const generateInvoiceId = () => {
  const year = new Date().getFullYear().toString().slice(-2);
  const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
  const randomId = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `PI${year}${month}${randomId}`;
};

// Helper function to format date
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).toUpperCase();
};

interface ProformaInvoiceProps {
  user: any; // Firebase User object
}

export function ProformaInvoice({ user }: ProformaInvoiceProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<'form' | 'history'>('form');
  const [isSaveRecipeOpen, setIsSaveRecipeOpen] = useState(false);
  const [isSaveOptionsOpen, setIsSaveOptionsOpen] = useState(false);
  const [isViewRecipesOpen, setIsViewRecipesOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [alertDialog, setAlertDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type?: 'info' | 'success' | 'warning' | 'error' | 'confirm';
    onConfirm?: () => void;
    onCancel?: () => void;
    confirmText?: string;
    cancelText?: string;
    isAuthenticating?: boolean; // Added for AlertDialog loading state
  } | null>(null);
  const [loadedRecipeId, setLoadedRecipeId] = useState<string | null>(null);
  const [loadedRecipeSource, setLoadedRecipeSource] = useState<'invoiceHistory' | 'invoiceSaved' | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // State for password authorization
  const [isPasswordInputOpen, setIsPasswordInputOpen] = useState(false);
  const [isAuthenticatingPassword, setIsAuthenticatingPassword] = useState(false);
  const [passwordAuthError, setPasswordAuthError] = useState<string | null>(null);
  const [recipeToDelete, setRecipeToDelete] = useState<{ id: string; name: string; collectionType: 'history' | 'saved_invoices' } | null>(null);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false); // New state for AlertDialog loading

  const { showToast } = useToast();

  const [history, setHistory] = useState<Recipe[]>([]);
  const [savedInvoices, setSavedInvoices] = useState<Recipe[]>([]);

  const [formData, setFormData] = useState<ProformaInvoiceData>({
    ...initialInvoiceData,
    invoiceNumber: generateInvoiceId()
  });

  // Fetch user-specific invoice history from Firebase
  useEffect(() => {
    if (!user) {
      console.log("No user found, clearing invoice history");
      setHistory([]);
      return;
    }

    console.log("Setting up invoice history listener for user:", user.uid);
    const historyCollectionRef = collection(db, "users", user.uid, "invoiceHistory");
    const q = query(historyCollectionRef, orderBy("timestamp", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedHistory: Recipe[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Recipe[];
      console.log("Fetched invoice history:", fetchedHistory.length);
      setHistory(fetchedHistory);
    }, (error) => {
      console.error("Error fetching invoice history for user", user.uid, ":", error);
      showToast({
        message: "Error fetching invoice history from cloud. Please try again.",
        type: 'error',
      });
    });

    return () => unsubscribe();
  }, [user, showToast]);

  // Fetch user-specific saved invoices from Firebase
  useEffect(() => {
    if (!user) {
      console.log("No user found, clearing saved invoices");
      setSavedInvoices([]);
      return;
    }

    console.log("Setting up saved invoices listener for user:", user.uid);
    const savedInvoicesCollectionRef = collection(db, "users", user.uid, "invoiceSaved");
    const q = query(savedInvoicesCollectionRef, orderBy("timestamp", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedSavedInvoices: Recipe[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Recipe[];
      console.log("Fetched saved invoices:", fetchedSavedInvoices.length);
      setSavedInvoices(fetchedSavedInvoices);
    }, (error) => {
      console.error("Error fetching saved invoices for user", user.uid, ":", error);
      showToast({
        message: "Error fetching saved invoices from cloud. Please try again.",
        type: 'error',
      });
    });

    return () => unsubscribe();
  }, [user, showToast]);

  // Calculate totals when items change
  useEffect(() => {
    const subtotal = formData.items.reduce((sum, item) => sum + (item.amount || 0), 0);
    const totalAmount = subtotal - (formData.discount || 0) + (formData.deliveryCharges || 0);
    
    setFormData(prev => ({
      ...prev,
      subtotal,
      totalAmount,
      amountInWords: numberToWords(totalAmount)
    }));
  }, [formData.items, formData.discount, formData.deliveryCharges]);

  const numberToWords = (num: number): string => {
    if (num === 0) return 'Zero';
    
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    
    const convertHundreds = (n: number): string => {
      let result = '';
      if (n >= 100) {
        result += ones[Math.floor(n / 100)] + ' Hundred ';
        n %= 100;
      }
      if (n >= 20) {
        result += tens[Math.floor(n / 10)] + ' ';
        n %= 10;
      } else if (n >= 10) {
        result += teens[n - 10] + ' ';
        return result;
      }
      if (n > 0) {
        result += ones[n] + ' ';
      }
      return result;
    };
    
    let result = '';
    if (num >= 10000000) {
      result += convertHundreds(Math.floor(num / 10000000)) + 'Crore ';
      num %= 10000000;
    }
    if (num >= 100000) {
      result += convertHundreds(Math.floor(num / 100000)) + 'Lakh ';
      num %= 100000;
    }
    if (num >= 1000) {
      result += convertHundreds(Math.floor(num / 1000)) + 'Thousand ';
      num %= 1000;
    }
    if (num > 0) {
      result += convertHundreds(num);
    }
    
    return result.trim() + ' Only';
  };

  // Function to auto-save on print (to history)
  const handleAutoSaveOnPrint = async () => {
    if (!user) {
      showToast({
        message: "Please log in to save invoices.",
        type: 'error',
      });
      return false;
    }

    // Only update if the loaded invoice is from invoiceHistory collection AND has unsaved changes
    const shouldUpdateExistingHistory = loadedRecipeId && loadedRecipeSource === 'invoiceHistory' && hasUnsavedChanges;

    // Always save to history if there are unsaved changes, or if it's a new form (no loadedRecipeId)
    if (hasUnsavedChanges || !loadedRecipeId) {
      setIsSaving(true);

      const autoSaveName = `Printed Draft - ${formData.invoiceNumber} (${formatDate(formData.invoiceDate)})`;
      const formDataForSave = { ...formData, customerName: autoSaveName };

      const invoiceDataToSave = {
        name: autoSaveName,
        timestamp: new Date().toISOString(),
        formData: formDataForSave,
        chemicalItems: formData.items
      };

      try {
        let currentDocId = loadedRecipeId; // Initialize with existing ID if available
        if (shouldUpdateExistingHistory) {
          // Update existing invoice in history
          await updateDoc(doc(db, "users", user.uid, "invoiceHistory", loadedRecipeId), invoiceDataToSave);
          showToast({
            message: `Printed draft updated to history!`,
            type: 'info',
          });
        } else {
          // Save as a new invoice to history
          const docRef = await addDoc(collection(db, "users", user.uid, "invoiceHistory"), invoiceDataToSave);
          currentDocId = docRef.id;
          showToast({
            message: `Printed draft saved to history!`,
            type: 'info',
          });
        }
        
        // Update the local state to reflect the saved state
        setLoadedRecipeId(currentDocId!);
        setLoadedRecipeSource('invoiceHistory');
        setHasUnsavedChanges(false);
        setFormData(formDataForSave); // Update form data with the auto-save name for 'customerName'
        return true;
      } catch (error) {
        console.error("Failed to auto-save invoice on print:", error);
        showToast({
          message: `Error auto-saving printed draft: ${error instanceof Error ? error.message : 'Unknown error'}`,
          type: 'error',
        });
        return false;
      } finally {
        setIsSaving(false);
      }
    }
    return true; // No save needed, proceed to print
  };

  // New handler for the "View/Print" button
  const handlePrintButtonClick = async () => {
    const savedSuccessfully = await handleAutoSaveOnPrint();
    if (savedSuccessfully) {
      handlePrint();
    }
  };

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `ProformaInvoice_${formData.invoiceNumber}`,
    onAfterPrint: () => {
      console.log('Print completed.');
    },
  });

  const handleEditFromHistory = (recipe: Recipe) => {
    setFormData(recipe.formData as ProformaInvoiceData);
    setLoadedRecipeId(recipe.id);
    setLoadedRecipeSource('invoiceHistory');
    setHasUnsavedChanges(false);
    setActiveTab('form');
    showToast({
      message: `Invoice "${recipe.name}" loaded for editing!`,
      type: 'info',
    });
  };

  const handlePrintFromHistory = (recipe: Recipe) => {
    const currentFormData = formData;
    
    setFormData(recipe.formData as ProformaInvoiceData);
    
    setTimeout(() => {
      handlePrint(); // Use the internal print handler
      setFormData(currentFormData);
    }, 100);
  };

  const handleDeleteFromHistory = (recipeId: string, recipeName: string, collectionPath: string) => {
    if (!user || !user.email) {
      setAlertDialog({
        isOpen: true,
        title: "Authentication Required",
        message: "Please log in with an email and password to delete invoices.",
        type: 'warning',
      });
      return;
    }
    // collectionPath will be 'history' or 'saved_invoices' directly
    const collectionType = collectionPath as 'history' | 'saved_invoices';
    setRecipeToDelete({ id: recipeId, name: recipeName, collectionType: collectionType });
    setIsPasswordInputOpen(true);
    setPasswordAuthError(null);
  };

  const handleDeleteInvoice = async (invoiceId: string, invoiceName: string, collectionType: 'history' | 'saved_invoices') => {
    if (!user) {
      showToast({
        message: "Please log in to delete invoices.",
        type: 'error',
      });
      return;
    }

    try {
      console.log("Starting deletion process for invoice:", invoiceId);
      const actualCollectionName = collectionType === 'history' ? 'invoiceHistory' : 'invoiceSaved';
      await deleteDoc(doc(db, "users", user.uid, actualCollectionName, invoiceId));
      console.log("Delete operation completed successfully");
      showToast({
        message: `Invoice "${invoiceName}" deleted successfully!`,
        type: 'success',
      });
    } catch (error) {
      console.error("Failed to delete invoice:", error);
      if (error instanceof Error && error.message.includes('network')) {
        showToast({
          message: `Network error occurred, but invoice may have been deleted. Please refresh to verify.`,
          type: 'warning',
        });
      } else {
        showToast({
          message: "Error deleting invoice. Please try again.",
          type: 'error',
        });
      }
      throw error; // Re-throw to allow retry mechanism to catch it
    }
  };

  const handleDeleteInvoiceWithRetry = async (invoiceId: string, invoiceName: string, collectionType: 'history' | 'saved_invoices', retryCount = 0) => {
    const maxRetries = 2;
    
    try {
      await handleDeleteInvoice(invoiceId, invoiceName, collectionType);
    } catch (error) {
      if (retryCount < maxRetries && error instanceof Error && 
          (error.message.includes('network') || error.message.includes('QUIC'))) {
        console.log(`Retrying deletion (attempt ${retryCount + 1}/${maxRetries})`);
        setTimeout(() => {
          handleDeleteInvoiceWithRetry(invoiceId, invoiceName, collectionType, retryCount + 1);
        }, 1000 * (retryCount + 1));
      } else {
        throw error;
      }
    }
  };

  const handlePasswordAuthorizationWithRetry = async (password: string) => {
    if (!user || !user.email || !recipeToDelete) {
      console.error("Missing user, email, or invoice to delete:", { user: !!user, email: user?.email, recipeToDelete });
      return;
    }

    setIsAuthenticatingPassword(true);
    setPasswordAuthError(null);

    try {
      console.log("Attempting to reauthenticate user:", user.uid);
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential);
      console.log("Reauthentication successful");
      
      setIsPasswordInputOpen(false);
      setAlertDialog({
        isOpen: true,
        title: "Confirm Deletion",
        message: `Password authorized. Are you sure you want to delete the invoice "${recipeToDelete.name}"? This action cannot be undone.`,
        type: 'confirm',
        onConfirm: async () => {
          setIsConfirmingDelete(true); // Start loading animation for AlertDialog
          try {
            console.log("Attempting to delete invoice:", recipeToDelete.id, "from collection:", recipeToDelete.collectionType, "for user:", user.uid);
            
            await handleDeleteInvoiceWithRetry(recipeToDelete.id, recipeToDelete.name, recipeToDelete.collectionType);
            
            setRecipeToDelete(null);
            setAlertDialog(null); // Dismiss AlertDialog after successful deletion
          } catch (error) {
            console.error("Failed to delete invoice from Firestore after reauth:", error);
            showToast({
              message: `Error deleting invoice: ${error instanceof Error ? error.message : 'Unknown error'}`,
              type: 'error',
            });
          } finally {
            setIsConfirmingDelete(false); // Stop loading animation
          }
        },
        onCancel: () => {
          setAlertDialog(null);
          setRecipeToDelete(null);
        },
        confirmText: "Delete",
        cancelText: "Cancel",
        isAuthenticating: isConfirmingDelete, // Pass loading state to AlertDialog
      });

    } catch (error: any) {
      console.error("Password reauthentication failed:", error);
      let errorMessage = "Password authorization failed. Please try again.";
      if (error.code === 'auth/wrong-password') {
        errorMessage = "Incorrect password. Please try again.";
      } else if (error.code === 'auth/user-mismatch') {
        errorMessage = "User mismatch. Please log in again.";
      } else if (error.code === 'auth/invalid-credential') {
        errorMessage = "Invalid credentials. Please check your email and password.";
      } else if (error.code === 'auth/requires-recent-login') {
        errorMessage = "This action requires a recent login. Please log in again.";
      }
      setPasswordAuthError(errorMessage);
    } finally {
      setIsAuthenticatingPassword(false);
    }
  };

  const handlePasswordAuthorization = handlePasswordAuthorizationWithRetry;

  const handleSaveRecipe = async (recipeName: string) => {
    if (!user) {
      setAlertDialog({
        isOpen: true,
        title: "Authentication Required",
        message: "Please ensure you are authenticated to save invoices. Try refreshing the page.",
        type: 'warning',
      });
      return;
    }

    setIsSaving(true);

    const recipeDataToSave = {
      name: recipeName,
      timestamp: new Date().toISOString(),
      formData: { ...formData, customerName: recipeName },
      chemicalItems: formData.items
    };

    try {
      const docRef = await addDoc(collection(db, "users", user.uid, "invoiceSaved"), recipeDataToSave);
      setLoadedRecipeId(docRef.id);
      setLoadedRecipeSource('invoiceSaved');
      setHasUnsavedChanges(false);
      showToast({
        message: `Invoice "${recipeName}" saved successfully to cloud!`,
        type: 'success',
      });
    } catch (error) {
      console.error("Failed to save invoice to Firebase:", error);
      showToast({
        message: "Error saving invoice to cloud. Check console for details.",
        type: 'error',
      });
    } finally {
      setIsSaving(false);
      setIsSaveRecipeOpen(false);
    }
  };

  const handleLoadRecipe = (recipe: Recipe) => {
    setFormData({
      ...(recipe.formData as ProformaInvoiceData),
      invoiceNumber: generateInvoiceId(),
      invoiceDate: new Date().toISOString().split('T')[0],
    });
    setLoadedRecipeId(recipe.id);
    setLoadedRecipeSource('invoiceSaved');
    setHasUnsavedChanges(false);
    showToast({
      message: `Invoice "${recipe.name}" loaded successfully!`,
      type: 'success',
    });
  };

  const handleSaveClick = () => {
    if (!user) {
      setAlertDialog({
        isOpen: true,
        title: "Authentication Required",
        message: "Please log in to save invoices.",
        type: 'warning',
      });
      return;
    }
    if (loadedRecipeId && hasUnsavedChanges) {
      setIsSaveOptionsOpen(true);
    } else {
      setIsSaveRecipeOpen(true);
    }
  };

  const handleSaveAsNew = () => {
    setLoadedRecipeId(null);
    setLoadedRecipeSource(null);
    setIsSaveOptionsOpen(false);
    setIsSaveRecipeOpen(true);
  };

  const handleUpdateExisting = async () => {
    if (!loadedRecipeId || !user) return;
    
    setIsSaving(true);
    try {
      await updateDoc(doc(db, "users", user.uid, "invoiceSaved", loadedRecipeId), {
        name: formData.customerName,
        timestamp: new Date().toISOString(),
        formData,
        chemicalItems: formData.items
      });
      
      setHasUnsavedChanges(false);
      showToast({
        message: "Invoice updated successfully!",
        type: 'success',
      });
    } catch (error) {
      console.error("Failed to update invoice:", error);
      showToast({
        message: "Error updating invoice. Check console for details.",
        type: 'error',
      });
    } finally {
      setIsSaving(false);
      setIsSaveOptionsOpen(false);
    }
  };

  const handleClear = () => {
    setFormData({
      ...initialInvoiceData,
      invoiceNumber: generateInvoiceId()
    });
    setLoadedRecipeId(null);
    setLoadedRecipeSource(null);
    setHasUnsavedChanges(false);
  };

  const handleItemsChange = useCallback((newItems: InvoiceItem[]) => {
    setFormData(prev => ({ ...prev, items: newItems }));
    if (loadedRecipeId) {
      setHasUnsavedChanges(true);
    }
  }, [loadedRecipeId]);

  // Track form changes
  useEffect(() => {
    if (loadedRecipeId) {
      setHasUnsavedChanges(true);
    }
  }, [formData, loadedRecipeId]);

  const handleReorderItems = useCallback((startIndex: number, endIndex: number) => {
    setFormData(prev => {
      const result = Array.from(prev.items);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return { ...prev, items: result };
    });
  }, []);

  const handleOnDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    if (result.source.index === result.destination.index) return;
    handleReorderItems(result.source.index, result.destination.index);
  };

  const filteredHistory = history.filter(item => {
    const searchLower = searchTerm.toLowerCase();
    const invoiceData = item.formData as ProformaInvoiceData;
    return (
      invoiceData.invoiceNumber.toLowerCase().includes(searchLower) ||
      invoiceData.customerName.toLowerCase().includes(searchLower) ||
      invoiceData.customerId?.toLowerCase().includes(searchLower) ||
      formatDate(invoiceData.invoiceDate).toLowerCase().includes(searchLower) ||
      invoiceData.totalAmount.toFixed(2).includes(searchLower)
    );
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section - Outside Container */}
      <div className="bg-card text-card-foreground border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div>
              <h2 className="text-3xl font-bold text-foreground">Proforma Invoice</h2>
              <p className="text-muted-foreground mt-1">Create and manage professional invoices.</p>
            </div>
            {activeTab === 'form' && (
              <div className="flex items-center space-x-6">
                <div className="flex items-center">
                  <span className="text-sm font-medium text-muted-foreground">Invoice No:</span>
                  <span className="ml-2 text-lg font-mono font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                    {formData.invoiceNumber}
                  </span>
                </div>
              </div>
            )}
          </div>
          
          {/* Tabs */}
          <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit mt-4">
            <button
              onClick={() => setActiveTab('form')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${
                activeTab === 'form'
                  ? 'bg-card shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <FileText className="h-4 w-4" />
              Proforma Invoice
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
              History ({history.length})
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-card text-card-foreground rounded-lg shadow-sm p-6 border border-border">
          {activeTab === 'form' ? (
            <>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Proforma Invoice</h2>
                  <p className="text-muted-foreground">Create and manage professional invoices.</p>
                </div>
                <div className="flex space-x-4 p-1 bg-muted rounded-lg">
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="radio"
                      className="sr-only"
                      name="documentMode"
                      value="draft"
                      checked={formData.documentMode === 'draft'}
                      onChange={(e) => setFormData({ ...formData, documentMode: e.target.value as 'draft' | 'final' })}
                    />
                    <span className={`px-4 py-1 text-sm rounded-md transition ${formData.documentMode === 'draft' ? 'bg-card shadow-sm text-foreground font-semibold' : 'text-muted-foreground'}`}>
                      Draft
                    </span>
                  </label>
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="radio"
                      className="sr-only"
                      name="documentMode"
                      value="final"
                      checked={formData.documentMode === 'final'}
                      onChange={(e) => setFormData({ ...formData, documentMode: e.target.value as 'draft' | 'final' })}
                    />
                    <span className={`px-4 py-1 text-sm rounded-md transition ${formData.documentMode === 'final' ? 'bg-card shadow-sm text-foreground font-semibold' : 'text-muted-foreground'}`}>
                      Final
                    </span>
                  </label>
                </div>
              </div>

              <ProformaInvoiceForm data={formData} onChange={setFormData} />

              <DragDropContext onDragEnd={handleOnDragEnd}>
                <InvoiceItemsTable
                  items={formData.items}
                  onItemsChange={handleItemsChange}
                />
              </DragDropContext>

              <div className="mt-8 flex flex-wrap justify-end gap-3">
                <Button variant="outline" onClick={handleClear}>Clear Form</Button>
                <Button onClick={handleSaveClick} className="bg-[#1A3636] hover:bg-green-900 text-white">
                  {loadedRecipeId && hasUnsavedChanges ? 'Save Changes' : 'Save Invoice'}
                </Button>
                <Button onClick={() => setIsViewRecipesOpen(true)} className="bg-[#1A3636] hover:bg-green-900 text-white flex items-center">
                  <FolderOpen className="h-5 w-5 mr-2" />
                  View Invoices
                </Button>
                <Button onClick={handlePrintButtonClick} className="bg-[#FF9900] hover:bg-orange-500 text-white flex items-center">
                  <Printer className="h-5 w-5 mr-2" />
                  View/Print
                </Button>
              </div>
            </>
          ) : (
            /* History Tab - Redesigned */
            <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-foreground">Invoice History</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Search by Invoice No, Customer, Date, Amount..."
                  className="pl-10 pr-4 py-2 border border-input rounded-lg w-80 bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary focus:ring-offset-background"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              {history.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground text-lg">
                  <Clock className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <p className="font-medium">
                    {searchTerm ? 'No invoices found matching your search criteria.' : 'No history yet'}
                  </p>
                  <p className="text-sm mt-1">
                    Create and print invoices to see them here.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {/* Table Header */}
                  <div className="grid grid-cols-6 border border-border rounded-lg overflow-hidden bg-muted/50 shadow-sm">
                    <div className="p-3 text-center text-sm font-medium text-foreground uppercase border-r border-border">Invoice No</div>
                    <div className="p-3 text-center text-sm font-medium text-foreground uppercase border-r border-border">Date</div>
                    <div className="p-3 text-center text-sm font-medium text-foreground uppercase border-r border-border">Customer ID</div>
                    <div className="p-3 text-center text-sm font-medium text-foreground uppercase border-r border-border">Customer Name</div>
                    <div className="p-3 text-center text-sm font-medium text-foreground uppercase border-r border-border">Total Amount</div>
                    <div className="p-3 text-center text-sm font-medium text-foreground uppercase">Actions</div>
                  </div>

                  {/* Table Rows */}
                  {filteredHistory.map((item) => {
                    const invoiceData = item.formData as ProformaInvoiceData;
                    return (
                      <div
                        key={item.id}
                        className="grid grid-cols-6 border border-border rounded-lg overflow-hidden bg-card shadow-sm hover:shadow-md hover:bg-muted/30 transition-all duration-200 ease-in-out"
                      >
                        <div className="p-3 text-center text-sm font-mono border-r border-border text-card-foreground">{invoiceData.invoiceNumber}</div>
                        <div className="p-3 text-center text-sm border-r border-border text-card-foreground">{formatDate(invoiceData.invoiceDate)}</div>
                        <div className="p-3 text-center text-sm border-r border-border text-card-foreground">{invoiceData.customerId || 'N/A'}</div>
                        <div className="p-3 text-center text-sm border-r border-border text-card-foreground">{invoiceData.customerName || 'N/A'}</div>
                        <div className="p-3 text-center text-sm border-r border-border text-card-foreground font-medium">₹{invoiceData.totalAmount.toFixed(2)}</div>
                        <div className="p-3 flex items-center justify-around gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditFromHistory(item)}
                            className="text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                            title="Edit Invoice"
                          >
                            <FileText className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handlePrintFromHistory(item)}
                            className="text-green-600 hover:bg-green-50 hover:text-green-700"
                            title="Print Invoice"
                          >
                            <Printer className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteFromHistory(item.id, item.name || invoiceData.customerName, 'history')}
                            className="text-red-600 hover:bg-red-50 hover:text-red-700"
                            title="Delete Invoice"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            </>
          )}
        </div>
      </div>

      <div style={{ display: 'none' }}>
        <PrintableInvoice ref={printRef} data={formData} />
      </div>

      <SaveRecipeDialog
        isOpen={isSaveRecipeOpen}
        onClose={() => setIsSaveRecipeOpen(false)}
        onSave={handleSaveRecipe}
        isSaving={isSaving}
      />

      <SaveOptionsDialog
        isOpen={isSaveOptionsOpen}
        onClose={() => setIsSaveOptionsOpen(false)}
        onSaveAsNew={handleSaveAsNew}
        onUpdateExisting={handleUpdateExisting}
        isSaving={isSaving}
        recipeName={formData.customerName}
      />

      <ViewRecipesDialog
        isOpen={isViewRecipesOpen}
        onClose={() => setIsViewRecipesOpen(false)}
        onRetrieve={handleLoadRecipe}
        onDelete={handleDeleteFromHistory}
        user={user}
        collectionPath="invoiceSaved"
        itemType="invoice"
      />

      {alertDialog && (
        <AlertDialog
          isOpen={alertDialog.isOpen}
          onClose={() => setAlertDialog(null)}
          title={alertDialog.title}
          message={alertDialog.message}
          type={alertDialog.type}
          onConfirm={alertDialog.onConfirm}
          onCancel={alertDialog.onCancel}
          confirmText={alertDialog.confirmText}
          cancelText={alertDialog.cancelText}
          isAuthenticating={alertDialog.isAuthenticating} // Pass the new prop
        />
      )}

      {isPasswordInputOpen && (
        <PasswordInputDialog
          isOpen={isPasswordInputOpen}
          onClose={() => {
            setIsPasswordInputOpen(false);
            setRecipeToDelete(null);
            setPasswordAuthError(null);
          }}
          onConfirm={handlePasswordAuthorization}
          title="Authorize Deletion"
          message="Please enter your password to authorize the deletion of this invoice."
          isAuthenticating={isAuthenticatingPassword}
          error={passwordAuthError}
        />
      )}
    </div>
  );
}