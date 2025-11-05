import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { collection, doc, setDoc, deleteDoc, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';
import { WishlistItem, Product } from '../types';

interface WishlistState {
  items: WishlistItem[];
  isLoading: boolean;
}

type WishlistAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ITEMS'; payload: WishlistItem[] }
  | { type: 'ADD_ITEM'; payload: WishlistItem }
  | { type: 'REMOVE_ITEM'; payload: string };

const WishlistContext = createContext<{
  state: WishlistState;
  dispatch: React.Dispatch<WishlistAction>;
  addToWishlist: (product: Product) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
} | null>(null);

function wishlistReducer(state: WishlistState, action: WishlistAction): WishlistState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ITEMS':
      return { ...state, items: action.payload, isLoading: false };
    case 'ADD_ITEM':
      return { ...state, items: [...state.items, action.payload] };
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter(item => item.product.id !== action.payload) };
    default:
      return state;
  }
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(wishlistReducer, {
    items: [],
    isLoading: false
  });

  const { state: authState } = useAuth();

  useEffect(() => {
    if (!authState.isAuthenticated || !authState.user) {
      dispatch({ type: 'SET_ITEMS', payload: [] });
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: true });

    const wishlistQuery = query(
      collection(db, 'wishlists'),
      where('userId', '==', authState.user.id)
    );

    const unsubscribe = onSnapshot(wishlistQuery, (snapshot) => {
      const wishlistItems: WishlistItem[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        wishlistItems.push({
          product: data.product,
          addedAt: data.addedAt.toDate()
        });
      });
      dispatch({ type: 'SET_ITEMS', payload: wishlistItems });
    });

    return () => unsubscribe();
  }, [authState.isAuthenticated, authState.user]);

  const addToWishlist = async (product: Product) => {
    if (!authState.user) return;

    try {
      const wishlistItem: WishlistItem = {
        product,
        addedAt: new Date()
      };

      await setDoc(doc(db, 'wishlists', `${authState.user.id}_${product.id}`), {
        userId: authState.user.id,
        product,
        addedAt: new Date()
      });

      dispatch({ type: 'ADD_ITEM', payload: wishlistItem });
    } catch (error) {
      console.error('Error adding to wishlist:', error);
    }
  };

  const removeFromWishlist = async (productId: string) => {
    if (!authState.user) return;

    try {
      await deleteDoc(doc(db, 'wishlists', `${authState.user.id}_${productId}`));
      dispatch({ type: 'REMOVE_ITEM', payload: productId });
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    }
  };

  const isInWishlist = (productId: string) => {
    return state.items.some(item => item.product.id === productId);
  };

  return (
    <WishlistContext.Provider value={{ 
      state, 
      dispatch, 
      addToWishlist, 
      removeFromWishlist, 
      isInWishlist 
    }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
