import React from 'react';
import { Heart, Star, ShoppingBag, Eye, TrendingUp } from 'lucide-react';
import { Product } from '../types';
import { useWishlist } from '../context/WishlistContext';
import { useNotification } from '../context/NotificationContext';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: Product;
  onProductClick: (product: Product) => void;
}

export default function ProductCard({ product, onProductClick }: ProductCardProps) {
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { addNotification } = useNotification();
  const { dispatch } = useCart();
  const inWishlist = isInWishlist(product.id);

  const handleWishlistClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (inWishlist) {
      await removeFromWishlist(product.id);
      addNotification({
        type: 'info',
        title: 'Removed from Wishlist',
        message: `${product.name} has been removed from your wishlist.`
      });
    } else {
      await addToWishlist(product);
      addNotification({
        type: 'success',
        title: 'Added to Wishlist',
        message: `${product.name} has been added to your wishlist.`
      });
    }
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    dispatch({
      type: 'ADD_ITEM',
      payload: {
        product,
        size: product.sizes[0],
        color: product.colors[0]
      }
    });

    addNotification({
      type: 'success',
      title: 'Added to Cart',
      message: `${product.name} has been added to your cart.`
    });
  };

  const discountPercentage = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div 
      className="group cursor-pointer bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-gray-200 transition-all duration-500 transform hover:-translate-y-3 hover:shadow-2xl"
      onClick={() => onProductClick(product)}
    >
      {/* Image Container */}
      <div className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 aspect-[4/5] rounded-t-2xl">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
        
        {/* Status Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {product.isNew && (
            <span className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-3 py-1.5 text-xs font-bold rounded-full shadow-lg backdrop-blur-sm">
              NEW
            </span>
          )}
          {product.isSale && (
            <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1.5 text-xs font-bold rounded-full shadow-lg backdrop-blur-sm">
              -{discountPercentage}%
            </span>
          )}
          {product.rating >= 4.5 && (
            <span className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-3 py-1.5 text-xs font-bold rounded-full shadow-lg backdrop-blur-sm flex items-center gap-1">
              <Star className="h-3 w-3 fill-current" />
              TOP
            </span>
          )}
        </div>
        
        {/* Action Buttons */}
        <div className="absolute top-4 right-4 flex flex-col gap-3">
          <button 
            onClick={handleWishlistClick}
            className={`p-3 bg-white/95 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 hover:bg-white hover:scale-110 transform shadow-lg ${
              inWishlist ? 'opacity-100 bg-red-50' : ''
            }`}
          >
            <Heart className={`h-4 w-4 ${inWishlist ? 'text-red-500 fill-current' : 'text-gray-600'}`} />
          </button>
          
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onProductClick(product);
            }}
            className="p-3 bg-white/95 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 hover:bg-white hover:scale-110 transform shadow-lg"
          >
            <Eye className="h-4 w-4 text-gray-600" />
          </button>
        </div>

        {/* Quick Add Button Overlay */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end justify-center pb-6">
          <button
            onClick={handleQuickAdd}
            className="bg-white text-gray-900 px-6 py-3 rounded-full font-semibold transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 flex items-center gap-2 shadow-xl hover:shadow-2xl hover:scale-105"
          >
            <ShoppingBag className="h-4 w-4" />
            Quick Add
          </button>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-6 space-y-4">
        {/* Category & Trending */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            {product.category}
          </span>
          {product.rating >= 4.5 && (
            <div className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
              <TrendingUp className="h-3 w-3" />
              Trending
            </div>
          )}
        </div>

        {/* Product Name */}
        <h3 className="font-bold text-gray-900 group-hover:text-gray-700 transition-colors duration-500 text-lg leading-tight h-14 flex items-start overflow-hidden">
          <span className="line-clamp-2">
          {product.name}
          </span>
        </h3>
        
        {/* Rating */}
        <div className="flex items-center gap-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                className={`h-4 w-4 ${i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-200'}`} 
              />
            ))}
          </div>
          <span className="text-sm font-semibold text-gray-700">{product.rating}</span>
          <span className="text-sm text-gray-400">({product.reviews})</span>
        </div>
        
        {/* Price */}
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold text-gray-900">
            ${product.price.toFixed(2)}
          </span>
          {product.originalPrice && (
            <>
              <span className="text-base text-gray-400 line-through">
                ${product.originalPrice.toFixed(2)}
              </span>
              <span className="bg-red-100 text-red-600 px-2 py-1 rounded-lg text-xs font-bold">
                Save ${(product.originalPrice - product.price).toFixed(2)}
              </span>
            </>
          )}
        </div>
        
        {/* Colors Preview */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-medium">Colors:</span>
            {product.colors.slice(0, 3).map((color, index) => (
              <div
                key={index}
                className="w-4 h-4 rounded-full border-2 border-gray-200 shadow-sm hover:scale-125 transition-transform duration-200"
                style={{ backgroundColor: color.toLowerCase() === 'white' ? '#ffffff' : color.toLowerCase() }}
              />
            ))}
            {product.colors.length > 3 && (
              <span className="text-xs text-gray-400 font-medium">+{product.colors.length - 3}</span>
            )}
          </div>
          
          <div className="flex items-center gap-1 text-xs text-green-600 font-medium">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            In Stock
          </div>
        </div>
        
        {/* Add to Cart Button */}
        <button 
          onClick={handleQuickAdd}
          className="w-full bg-gray-900 text-white py-3 rounded-xl font-semibold hover:bg-gray-800 transition-all duration-300 flex items-center justify-center gap-2 group/btn"
        >
          Add to Cart
          <ShoppingBag className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform duration-300" />
        </button>
      </div>
    </div>
  );
}
