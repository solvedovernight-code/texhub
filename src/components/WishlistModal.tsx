import React from 'react';
import { X, Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useNotification } from '../context/NotificationContext';

interface WishlistModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WishlistModal({ isOpen, onClose }: WishlistModalProps) {
  const { state, removeFromWishlist } = useWishlist();
  const { dispatch: cartDispatch } = useCart();
  const { addNotification } = useNotification();

  // No need to return null here, as the animation will handle visibility
  // if (!isOpen) return null;

  const handleRemoveFromWishlist = async (productId: string) => {
    await removeFromWishlist(productId);
    addNotification({
      type: 'info',
      title: 'Removed from Wishlist',
      message: 'Item has been removed from your wishlist.'
    });
  };

  const moveToCart = async (item: any) => {
    // Add to cart with default size and color
    cartDispatch({
      type: 'ADD_ITEM',
      payload: {
        product: item.product,
        size: item.product.sizes[0],
        color: item.product.colors[0]
      }
    });

    // Remove from wishlist
    await removeFromWishlist(item.product.id);

    addNotification({
      type: 'success',
      title: 'Added to Cart',
      message: `${item.product.name} has been moved to your cart.`
    });
  };

  return (
    <div className={`fixed inset-0 z-50 overflow-hidden transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className={`absolute right-0 top-0 h-full w-full max-w-lg bg-white shadow-2xl transform transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="border-b border-gray-200 p-6 bg-gradient-to-r from-pink-50 to-red-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Heart className="h-5 w-5 text-white fill-current" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">My Wishlist</h2>
                  <p className="text-sm text-gray-500">{state.items.length} items</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/80 rounded-full transition-all duration-200 hover:scale-110"
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Wishlist Items */}
          <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
            {state.isLoading ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-gradient-to-r from-pink-200 to-red-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
                </div>
                <p className="text-gray-500">Loading your wishlist...</p>
              </div>
            ) : state.items.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gradient-to-r from-pink-200 to-red-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Heart className="h-12 w-12 text-pink-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Your wishlist is empty</h3>
                <p className="text-gray-500 mb-6">
                  Save items you love to view them later
                </p>
                <button
                  onClick={onClose}
                  className="bg-gradient-to-r from-pink-500 to-red-500 text-white px-8 py-3 rounded-xl font-semibold hover:from-pink-600 hover:to-red-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {state.items.map((item) => (
                  <div key={item.product.id} className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded-xl overflow-hidden">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                      </div>
                    
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate mb-1">{item.product.name}</h3>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full mb-2 inline-block">{item.product.category}</span>
                        <p className="text-lg font-bold text-gray-900 mb-3">
                          ${item.product.price.toFixed(2)}
                        </p>
                      
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => moveToCart(item)}
                            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-md"
                          >
                            <ShoppingBag className="h-3 w-3" />
                            Add to Cart
                          </button>
                        
                          <button
                            onClick={() => handleRemoveFromWishlist(item.product.id)}
                            className="flex items-center gap-2 text-red-600 hover:text-red-800 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 hover:bg-red-50"
                          >
                            <Trash2 className="h-3 w-3" />
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {state.items.length > 0 && (
            <div className="border-t border-gray-200 p-6 bg-white">
              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <p className="text-center text-gray-600 font-medium">
                {state.items.length} item{state.items.length !== 1 ? 's' : ''} in your wishlist
              </p>
              </div>
              <button
                onClick={onClose}
                className="w-full border-2 border-gray-300 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-300"
              >
                Continue Shopping
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
