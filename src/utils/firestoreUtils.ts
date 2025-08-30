import { db } from '../lib/firebaseConfig';
import { doc, deleteDoc } from 'firebase/firestore';
import { toast } from 'sonner';

/**
 * Deletes a document from a specified Firestore subcollection for a given user.
 * This function handles the actual database operation and provides user feedback.
 *
 * @param userId The ID of the authenticated user.
 * @param collectionPath The path to the user's subcollection (e.g., 'chemicalReports', 'saved_recipes', 'invoices').
 * @param documentId The ID of the document to delete.
 * @param itemName A user-friendly name for the item being deleted (e.g., 'recipe', 'invoice').
 * @returns A promise that resolves to true if deletion was successful, false otherwise.
 */
export const deleteDocumentFromCollection = async (
  userId: string,
  collectionPath: string,
  documentId: string,
  itemName: string = 'item'
): Promise<boolean> => {
  try {
    if (!userId) {
      toast.error("Authentication required. Please log in to delete items.");
      return false;
    }
    if (!collectionPath || !documentId) {
      toast.error("Invalid deletion parameters. Missing collection path or document ID.");
      return false;
    }

    const docRef = doc(db, `users/${userId}/${collectionPath}`, documentId);
    await deleteDoc(docRef);
    toast.success(`${itemName} "${documentId}" deleted successfully!`);
    return true;
  } catch (error) {
    console.error(`Error deleting ${itemName} (ID: ${documentId}) from ${collectionPath}:`, error);
    toast.error(`Failed to delete ${itemName}. Please check the console for details.`);
    return false;
  }
};
