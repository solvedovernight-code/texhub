import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Search, FolderOpen, Loader2, FileText, Beaker, Clock, Trash2, Download, X, AlertTriangle } from 'lucide-react';
import { db } from '../lib/firebaseConfig';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { getAuth, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import type { Recipe, DyeingFormData, ChemicalItem } from '../types';
import { ProformaInvoiceData } from '../types/invoice';
import { useToast } from './ui/ToastProvider';
import { PasswordInputDialog } from './PasswordInputDialog';
import { AlertDialog } from './AlertDialog';

interface ViewRecipesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onRetrieve: (recipe: Recipe) => void;
  onDelete: (recipeId: string, recipeName: string, collectionPath: string) => void; // collectionPath will now be 'invoiceHistory' or 'invoiceSaved'
  user: any; // Firebase User object
  collectionPath: string; // e.g., "invoiceHistory", "invoiceSaved", "history", "saved_recipes"
  itemType: 'recipe' | 'invoice'; // To differentiate display logic
}

const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).toUpperCase();
  } catch (error) {
    console.error("Error formatting date:", dateString, error);
    return 'Invalid Date';
  }
};

export function ViewRecipesDialog({ isOpen, onClose, onRetrieve, onDelete, user, collectionPath, itemType }: ViewRecipesDialogProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [userRecipes, setUserRecipes] = useState<Recipe[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string; collectionPath: string } | null>(null); // <-- Added collectionPath
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const { showToast } = useToast();


  useEffect(() => {
    if (!isOpen || !user) {
      setUserRecipes([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    // collectionPath will now be 'invoiceHistory', 'invoiceSaved', 'history', or 'saved_recipes' directly
    const userSpecificCollectionRef = collection(db, "users", user.uid, collectionPath); 
    const q = query(userSpecificCollectionRef, orderBy("timestamp", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedRecipes: Recipe[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id, // Ensure this is always the Firestore document ID
          name: data.name,
          timestamp: data.timestamp,
          formData: data.formData,
          chemicalItems: data.chemicalItems,
        } as Recipe;
      });
      setUserRecipes(fetchedRecipes);
      setLoading(false);
    }, (error) => {
      console.error(`Error fetching ${collectionPath}:`, error);
      showToast({
        message: `Error fetching ${collectionPath} from cloud.`,
        type: 'error',
      });
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isOpen, user, collectionPath, showToast]);

  const filteredRecipes = userRecipes.filter(recipe => {
    const searchLower = searchTerm.toLowerCase();
    if (itemType === 'recipe') {
      const formData = recipe.formData as DyeingFormData;
      return (
        formData.reqId?.toLowerCase().includes(searchLower) ||
        formData.project?.toLowerCase().includes(searchLower) ||
        formData.fabricType?.toLowerCase().includes(searchLower) ||
        formData.color?.toLowerCase().includes(searchLower) ||
        formatDate(formData.reqDate).toLowerCase().includes(searchLower) ||
        formData.batchNo?.toLowerCase().includes(searchLower) ||
        formData.buyer?.toLowerCase().includes(searchLower)
      );
    } else if (itemType === 'invoice') {
      const formData = recipe.formData as ProformaInvoiceData;
      return (
        formData.invoiceNumber?.toLowerCase().includes(searchLower) ||
        formData.customerName?.toLowerCase().includes(searchLower) ||
        formData.customerId?.toLowerCase().includes(searchLower) ||
        formatDate(formData.invoiceDate).toLowerCase().includes(searchLower) ||
        formData.totalAmount?.toString().toLowerCase().includes(searchLower)
      );
    }
    return false;
  });

  const handleRetrieveClick = (recipe: Recipe) => {
    onRetrieve(recipe);
    showToast({
      message: `${recipe.name || (itemType === 'recipe' ? (recipe.formData as DyeingFormData).project : (recipe.formData as ProformaInvoiceData).customerName) || 'Item'} retrieved successfully!`,
      type: 'success',
    });
    onClose();
  };

  const handleDeleteClick = (recipeId: string, recipeName: string) => {
    setDeleteConfirm({ id: recipeId, name: recipeName, collectionPath: collectionPath }); // <-- Stored collectionPath
  };

  const handleConfirmDelete = () => {
    if (!deleteConfirm) return;
    
    if (!user || !user.email) {
      showToast({
        message: "Please log in with an email and password to delete items.",
        type: 'error',
      });
      // Removed: setDeleteConfirm(null);
      return;
    }
    
    // Removed: setDeleteConfirm(null);
    setIsPasswordDialogOpen(true);
    setAuthError(null);
  };

  const handlePasswordConfirm = async (password: string) => {
    if (!user || !deleteConfirm) {
      console.error("Missing user or deleteConfirm:", { user: !!user, deleteConfirm });
      return;
    }

    setIsAuthenticating(true);
    setAuthError(null);

    try {
      if (!user.email) {
        console.error("Authentication Error: User email not available for reauthentication.");
        throw new Error("User email not available for reauthentication.");
      }

      console.log("Attempting to reauthenticate user:", user.uid);
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential);
      console.log("Reauthentication successful in ViewRecipesDialog");

      // Call parent's onDelete function with retry mechanism
      console.log("Calling parent onDelete function for:", deleteConfirm.id);
      try {
        await onDelete(deleteConfirm.id, deleteConfirm.name, deleteConfirm.collectionPath); // <-- Passed collectionPath
      } catch (deleteError) {
        console.error("Delete operation failed:", deleteError);
        // If it's a network error, show a warning instead of error
        if (deleteError instanceof Error && 
            (deleteError.message.includes('network') || deleteError.message.includes('QUIC'))) {
          showToast({
            message: `Network error occurred, but item may have been deleted. Please refresh to verify.`,
            type: 'warning',
          });
        } else {
          throw deleteError; // Re-throw non-network errors
        }
      }
      setIsPasswordDialogOpen(false);
      setDeleteConfirm(null); // Clear deleteConfirm here after successful deletion
    } catch (error: any) {
      console.error("Authentication or Deletion Error in ViewRecipesDialog:", error);

      let errorMessage = "Authentication failed. Please try again.";
      if (error.code === 'auth/wrong-password') {
        errorMessage = "Incorrect password. Please try again.";
      } else if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-email') {
        errorMessage = "User not found or invalid email. Please log in again.";
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = "Too many failed attempts. Please try again later.";
      } else if (error.message === "User email not available for reauthentication.") {
        errorMessage = "Cannot reauthenticate: User email is missing.";
      } else if (error.message === "No active user session. Please log in again.") {
        errorMessage = "No active user session. Please log in again.";
      }
      setAuthError(errorMessage);
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="z-50 max-w-6xl h-[90vh] flex flex-col rounded-xl shadow-2xl bg-white dark:bg-background p-0">
        {/* Custom Header Section */}
        <div className="relative w-full bg-gradient-to-r from-[#FF6B00] to-[#FFD700] py-5 px-8 sm:px-16 lg:px-24 text-center shadow-lg rounded-t-xl"
             style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}>
          <DialogClose className="absolute right-6 top-6 rounded-full p-2 bg-white/50 text-gray-700 hover:bg-white/70 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white">
            <X className="h-6 w-6" />
            <span className="sr-only">Close</span>
          </DialogClose>

          <div className="flex flex-col items-center justify-center text-white">
            {itemType === 'recipe' ? (
              <FileText className="h-20 w-20 text-[#3B5998] mb-4" />
            ) : (
              <FolderOpen className="h-20 w-20 text-[#3B5998] mb-4" />
            )}
            <DialogTitle className="text-5xl font-extrabold text-[#3B5998] drop-shadow-md">
              View Saved {itemType === 'recipe' ? 'Recipes' : 'Invoices'}
            </DialogTitle>
            <DialogDescription className="text-xl mt-3 mb-6 max-w-2xl mx-auto font-light">
              Browse and load your previously saved {itemType === 'recipe' ? 'dyeing recipes' : 'proforma invoices'} with ease.
            </DialogDescription>
          </div>
        </div>

        {/* Search Input - positioned to overlap the header, appearing 'out of section' */}
        <div className="relative mx-auto w-[90%] sm:w-[70%] lg:w-[50%] -mt-10 z-20">
          <div className="relative">
            <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 h-7 w-7" />
            <Input
              type="text"
              placeholder={`Enter text to search`}
              className="pl-[68px] pr-[36px] h-[50px] border border-gray-300 rounded-full w-full bg-white text-gray-800 placeholder:text-gray-400 focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/50 focus:ring-offset-white transition-all duration-200 text-xl shadow-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 bg-white dark:bg-surface pt-8 pb-8 px-12 sm:px-12 lg:px-12 overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-text-secondary">
              <Loader2 className="h-20 w-20 animate-spin text-primary mb-6" />
              <p className="text-2xl font-semibold">Loading {itemType === 'recipe' ? 'recipes' : 'invoices'}...</p>
              <p className="text-lg mt-2">Please wait a moment.</p>
            </div>
          ) : filteredRecipes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-text-secondary text-xl w-full h-full">
              <Clock className="h-24 w-24 mx-auto text-text-secondary mb-6 opacity-70" />
              <p className="font-bold text-2xl text-gray-700 dark:text-text-secondary text-center">
                {searchTerm ? `No ${itemType === 'recipe' ? 'recipes' : 'invoices'} found matching your search.` : `No saved ${itemType === 'recipe' ? 'recipes' : 'invoices'} yet.`}
              </p>
              <p className="text-lg mt-3 text-gray-600 dark:text-text-secondary text-center">
                {itemType === 'recipe' ? 'Start by saving your dyeing recipes to see them here.' : 'Create and save your proforma invoices to populate this list.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-9">
              {filteredRecipes.map((recipe) => (
                <div
                  key={recipe.id}
                  className="relative group bg-white dark:bg-surface rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-border transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-xl"
                >
                  {/* Card Content */}
                  <div className="flex h-full">
                    {/* Left Blue Section */}
                    <div className="w-1/3 bg-[#3B5998] flex items-center justify-center p-3">
                      <div className="relative w-16 h-16 rounded-full bg-[#80D8DA] flex items-center justify-center shadow-inner">
                        {itemType === 'recipe' ? (
                          <Beaker className="h-8 w-8 text-[#3B5998]" />
                        ) : (
                          <FileText className="h-8 w-8 text-[#3B5998]" />
                        )}
                      </div>
                    </div>

                    {/* Right White Section */}
                    <div className="w-2/3 p-4 text-gray-800 dark:text-text flex flex-col justify-center">
                      <p className="font-bold text-lg text-[#3B5998] mb-2 leading-tight">
                        {itemType === 'recipe' ? (recipe.formData as DyeingFormData).project || recipe.name : (recipe.formData as ProformaInvoiceData).customerName || recipe.name}
                      </p>
                      <div className="text-sm space-y-0.5">
                        {itemType === 'recipe' ? (
                          <>
                            <p><span className="font-semibold">Req. No</span> : {(recipe.formData as DyeingFormData).reqId}</p>
                            <p><span className="font-semibold">Batch No</span> : {(recipe.formData as DyeingFormData).batchNo || 'N/A'}</p>
                            <p><span className="font-semibold">Buyer</span> : {(recipe.formData as DyeingFormData).buyer || 'N/A'}</p>
                            <p><span className="font-semibold">Color</span> : {(recipe.formData as DyeingFormData).color || 'N/A'}</p>
                            <p><span className="font-semibold">Date</span> : {formatDate((recipe.formData as DyeingFormData).reqDate)}</p>
                          </>
                        ) : (
                          <>
                            <p><span className="font-semibold">Invoice No</span> : {(recipe.formData as ProformaInvoiceData).invoiceNumber}</p>
                            <p><span className="font-semibold">Customer ID</span> : {(recipe.formData as ProformaInvoiceData).customerId || 'N/A'}</p>
                            <p><span className="font-semibold">Customer Name</span> : {(recipe.formData as ProformaInvoiceData).customerName || 'N/A'}</p>
                            <p><span className="font-semibold">Total Amount</span> : ₹{(recipe.formData as ProformaInvoiceData).totalAmount?.toFixed(2) || '0.00'}</p>
                            <p><span className="font-semibold">Date</span> : {formatDate((recipe.formData as ProformaInvoiceData).invoiceDate)}</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Hover Overlay with Buttons */}
                  <div className="absolute inset-0 bg-black/60 dark:bg-black/70 flex flex-col items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Button
                      variant="default"
                      size="lg"
                      className="w-3/4 bg-green-600 hover:bg-green-700 text-white text-lg font-semibold py-3 rounded-lg shadow-md flex items-center justify-center"
                      onClick={(e) => { e.stopPropagation(); handleRetrieveClick(recipe); }}
                    >
                      <Download className="h-5 w-5 mr-2" />
                      Retrieve
                    </Button>
                    <Button
                      variant="destructive"
                      size="lg"
                      className="w-3/4 bg-red-600 hover:bg-red-700 text-white text-lg font-semibold py-3 rounded-lg shadow-md flex items-center justify-center"
                      onClick={(e) => { e.stopPropagation(); handleDeleteClick(recipe.id, recipe.name || (itemType === 'recipe' ? (recipe.formData as DyeingFormData).project : (recipe.formData as ProformaInvoiceData).customerName) || 'Untitled'); }}
                    >
                      <Trash2 className="h-5 w-5 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <AlertDialog
          isOpen={true}
          onClose={() => setDeleteConfirm(null)}
          title="Confirm Deletion"
          message={`Are you sure you want to delete "${deleteConfirm.name}"? This action cannot be undone and requires password confirmation.`}
          type="confirm"
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteConfirm(null)}
          confirmText="Continue"
          cancelText="Cancel"
        />
      )}

      {/* Password Input Dialog for Deletion */}
      <PasswordInputDialog
        isOpen={isPasswordDialogOpen}
        onClose={() => {
          setIsPasswordDialogOpen(false);
          setDeleteConfirm(null);
          setAuthError(null);
        }}
        onConfirm={handlePasswordConfirm}
        title="Confirm Deletion"
        message={`Please enter your password to confirm deletion of "${deleteConfirm?.name || 'this item'}". This action cannot be undone.`}
        isAuthenticating={isAuthenticating}
        error={authError}
      />
    </Dialog>
  );
}
