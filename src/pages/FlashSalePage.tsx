import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, Star, ShoppingBag, Heart, Zap, Siren as Fire, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ProductModal from '../components/ProductModal';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useNotification } from '../context/NotificationContext';

// Flash Sale Products with special pricing
const flashSaleProducts: Product[] = [
  {
    id: 'flash-1',
    name: "Premium Cotton T-Shirt",
    price: 12.99,
    originalPrice: 25.99,
    image: 'https://raw.githubusercontent.com/Solved-Overnight/arvana-clothing/refs/heads/main/img/collections/man_dropsholder1.jpg',
    images: [
      'https://raw.githubusercontent.com/Solved-Overnight/arvana-clothing/refs/heads/main/img/collections/man_dropsholder1.jpg',
      'https://raw.githubusercontent.com/Solved-Overnight/arvana-clothing/refs/heads/main/img/collections/man_dropsholder2.jpg'
    ],
    category: 'tops',
    description: 'Premium cotton t-shirt with modern fit. Limited time flash sale price!',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Black', 'White', 'Navy'],
    isSale: true,
    rating: 4.8,
    reviews: 156
  },
  {
    id: 'flash-2',
    name: "Designer Denim Jeans",
    price: 29.99,
    originalPrice: 59.99,
    image: 'https://raw.githubusercontent.com/Solved-Overnight/arvana-clothing/refs/heads/main/img/collections/women_denim_1.jpg',
    images: [
      'https://raw.githubusercontent.com/Solved-Overnight/arvana-clothing/refs/heads/main/img/collections/women_denim_1.jpg',
      'https://raw.githubusercontent.com/Solved-Overnight/arvana-clothing/refs/heads/main/img/collections/woman_item5.jpg'
    ],
    category: 'bottoms',
    description: 'Premium designer denim with perfect fit. Flash sale exclusive!',
    sizes: ['28', '30', '32', '34', '36'],
    colors: ['Dark Blue', 'Light Blue'],
    isSale: true,
    rating: 4.9,
    reviews: 203
  },
  {
    id: 'flash-3',
    name: "Luxury Wool Sweater",
    price: 39.99,
    originalPrice: 79.99,
    image: 'https://raw.githubusercontent.com/Solved-Overnight/arvana-clothing/refs/heads/main/img/collections/woman_item4.jpg',
    images: [
      'https://raw.githubusercontent.com/Solved-Overnight/arvana-clothing/refs/heads/main/img/collections/woman_item3.jpg',
      'https://raw.githubusercontent.com/Solved-Overnight/arvana-clothing/refs/heads/main/img/collections/woman_item2.jpg'
    ],
    category: 'sweaters',
    description: 'Luxurious wool blend sweater. Limited flash sale offer!',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Beige', 'Navy', 'Charcoal'],
    isSale: true,
    rating: 4.7,
    reviews: 89
  },
  {
    id: 'flash-4',
    name: "Quarter-Zip Pullover",
    price: 22.99,
    originalPrice: 45.99,
    image: 'https://raw.githubusercontent.com/Solved-Overnight/arvana-clothing/refs/heads/main/img/collections/man_chain1.jpg',
    images: [
      'https://raw.githubusercontent.com/Solved-Overnight/arvana-clothing/refs/heads/main/img/collections/man_chain1.jpg'
    ],
    category: 'tops',
    description: 'Premium quarter-zip pullover. Flash sale special pricing!',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Teal', 'Brown', 'Black'],
    isSale: true,
    rating: 4.6,
    reviews: 134
  },
  {
    id: 'flash-5',
    name: "Oversized Hoodie",
    price: 18.99,
    originalPrice: 37.99,
    image: 'https://raw.githubusercontent.com/Solved-Overnight/arvana-clothing/refs/heads/main/img/collections/man_hoodie1.jpg',
    images: [
      'https://raw.githubusercontent.com/Solved-Overnight/arvana-clothing/refs/heads/main/img/collections/man_hoodie1.jpg'
    ],
    category: 'sweaters',
    description: 'Comfortable oversized hoodie. Limited time flash sale!',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Khaki', 'Navy', 'Black'],
    isSale: true,
    rating: 4.5,
    reviews: 98
  },
  {
    id: 'flash-6',
    name: "Classic Polo Shirt",
    price: 15.99,
    originalPrice: 31.99,
    image: 'https://raw.githubusercontent.com/Solved-Overnight/arvana-clothing/refs/heads/main/img/collections/man_poloshirt2.jpg',
    images: [
      'https://raw.githubusercontent.com/Solved-Overnight/arvana-clothing/refs/heads/main/img/collections/man_poloshirt2.jpg',
      'https://raw.githubusercontent.com/Solved-Overnight/arvana-clothing/refs/heads/main/img/collections/man_poloshirt1.jpg'
    ],
    category: 'shirts',
    description: 'Classic polo shirt with modern fit. Flash sale exclusive!',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Gray', 'Navy', 'White'],
    isSale: true,
    rating: 4.4,
    reviews: 76
  }
];

// Countdown Timer Component
const CountdownTimer = ({ endTime }: { endTime: Date }) => {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = endTime.getTime() - now;

      if (distance > 0) {
        setTimeLeft({
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      } else {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  return (
    <div className="flex items-center gap-2 sm:gap-4">
      {[
        { label: 'Hours', value: timeLeft.hours },
        { label: 'Minutes', value: timeLeft.minutes },
        { label: 'Seconds', value: timeLeft.seconds }
      ].map((item, index) => (
        <div key={item.label} className="flex items-center">
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2 sm:p-3 min-w-[50px] sm:min-w-[60px] text-center border border-white/30">
            <div className="text-xl sm:text-2xl font-bold text-white">{item.value.toString().padStart(2, '0')}</div>
            <div className="text-xs text-white/80 font-medium">{item.label}</div>
          </div>
          {index < 2 && <div className="text-white text-lg sm:text-xl font-bold mx-1 sm:mx-2">:</div>}
        </div>
      ))}
    </div>
  );
};

// Flash Sale Product Card
const FlashSaleCard = ({ product, onProductClick }: { product: Product; onProductClick: (product: Product) => void }) => {
  const { dispatch } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { addNotification } = useNotification();
  const inWishlist = isInWishlist(product.id);

  const discountPercentage = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

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

  return (
    <div 
      className="group cursor-pointer bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-red-200 transition-all duration-500 transform hover:-translate-y-2 hover:shadow-2xl relative"
      onClick={() => onProductClick(product)}
    >
      {/* Flash Sale Badge */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
        <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg animate-pulse">
          <Fire className="h-3 w-3" />
          FLASH SALE
        </div>
        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
          -{discountPercentage}% OFF
        </div>
      </div>

      {/* Image Container */}
      <div className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 aspect-[4/5]">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        
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
        </div>

        {/* Quick Add Button Overlay */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end justify-center pb-6">
          <button
            onClick={handleQuickAdd}
            className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-3 rounded-full font-semibold transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 flex items-center gap-2 shadow-xl hover:shadow-2xl hover:scale-105"
          >
            <ShoppingBag className="h-4 w-4" />
            Quick Add
          </button>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
        {/* Product Name */}
        <h3 className="font-bold text-gray-900 group-hover:text-red-600 transition-colors duration-500 text-base sm:text-lg leading-tight">
          {product.name}
        </h3>
        
        {/* Rating */}
        <div className="flex items-center gap-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                className={`h-3 w-3 sm:h-4 sm:w-4 ${i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-200'}`} 
              />
            ))}
          </div>
          <span className="text-xs sm:text-sm font-semibold text-gray-700">{product.rating}</span>
          <span className="text-xs sm:text-sm text-gray-400">({product.reviews})</span>
        </div>
        
        {/* Price */}
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="text-xl sm:text-2xl font-bold text-red-600">
            ${product.price.toFixed(2)}
          </span>
          {product.originalPrice && (
            <>
              <span className="text-sm sm:text-base text-gray-400 line-through">
                ${product.originalPrice.toFixed(2)}
              </span>
              <span className="bg-red-100 text-red-600 px-2 py-1 rounded-lg text-xs font-bold">
                Save ${(product.originalPrice - product.price).toFixed(2)}
              </span>
            </>
          )}
        </div>
        
        {/* Add to Cart Button */}
        <button 
          onClick={handleQuickAdd}
          className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white py-2 sm:py-3 rounded-xl font-semibold text-sm sm:text-base hover:from-red-600 hover:to-pink-600 transition-all duration-300 flex items-center justify-center gap-2 group/btn shadow-lg hover:shadow-xl"
        >
          Add to Cart
          <ShoppingBag className="h-3 w-3 sm:h-4 sm:w-4 group-hover/btn:translate-x-1 transition-transform duration-300" />
        </button>
      </div>
    </div>
  );
};

export default function FlashSalePage() {
  const navigate = useNavigate();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // Flash sale ends in 6 hours from now
  const flashSaleEndTime = new Date(Date.now() + 6 * 60 * 60 * 1000);

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
  };

  const totalSavings = flashSaleProducts.reduce((total, product) => {
    return total + (product.originalPrice ? product.originalPrice - product.price : 0);
  }, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-red-600 via-pink-600 to-orange-500 text-white py-12 md:py-20 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-24 h-24 sm:w-32 sm:h-32 bg-white rounded-full animate-pulse"></div>
          <div className="absolute top-32 right-10 w-16 h-16 sm:w-24 sm:h-24 bg-yellow-300 rounded-full animate-bounce" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-10 left-10 w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-full animate-ping" style={{ animationDelay: '2s' }}></div>
          <div className="absolute bottom-32 right-32 w-12 h-12 sm:w-16 sm:h-16 bg-yellow-300 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-white/80 hover:text-white transition-colors duration-200 bg-white/10 backdrop-blur-sm px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg hover:bg-white/20 text-sm sm:text-base"
            >
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              Back to Home
            </button>
          </div>

          <div className="text-center mb-10 sm:mb-12">
            <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <div className="bg-white/20 backdrop-blur-sm p-3 sm:p-4 rounded-xl sm:rounded-2xl">
                <Fire className="h-8 w-8 sm:h-12 sm:w-12 text-white animate-pulse" />
              </div>
              <div className="bg-white/20 backdrop-blur-sm p-3 sm:p-4 rounded-xl sm:rounded-2xl">
                <Zap className="h-8 w-8 sm:h-12 sm:w-12 text-white animate-bounce" />
              </div>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-4 sm:mb-6">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-white to-yellow-300">
                FLASH SALE
              </span>
            </h1>
            
            <p className="text-base md:text-xl lg:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed mb-6 sm:mb-8">
              Limited time offer! Save up to 50% on premium fashion items. Don't miss out!
            </p>

            {/* Countdown Timer */}
            <div className="mb-8 flex flex-col items-center">
              <div className="flex items-center justify-center gap-2 mb-3 sm:mb-4">
                <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-white animate-pulse" />
                <span className="text-base sm:text-lg font-semibold text-white">Sale Ends In:</span>
              </div>
              <CountdownTimer endTime={flashSaleEndTime} />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 max-w-2xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/20">
                <div className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">{flashSaleProducts.length}</div>
                <div className="text-white/80 text-sm sm:text-base">Items on Sale</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/20">
                <div className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">Up to 50%</div>
                <div className="text-white/80 text-sm sm:text-base">Discount</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/20">
                <div className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">${totalSavings.toFixed(0)}</div>
                <div className="text-white/80 text-sm sm:text-base">Total Savings</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Flash Sale Products */}
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-12">
            <div className="flex items-center justify-center gap-2 mb-3 sm:mb-4">
              <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-red-500" />
              <span className="text-red-500 font-semibold text-sm sm:text-base">LIMITED TIME OFFERS</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">Flash Sale Products</h2>
            <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
              Grab these amazing deals before they're gone! Limited quantities available.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {flashSaleProducts.map((product) => (
              <FlashSaleCard
                key={product.id}
                product={product}
                onProductClick={handleProductClick}
              />
            ))}
          </div>

          {/* Call to Action */}
          <div className="text-center mt-12 md:mt-16">
            <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-red-100">
              <Fire className="h-12 w-12 sm:h-16 sm:w-16 text-red-500 mx-auto mb-3 sm:mb-4 animate-pulse" />
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Don't Miss Out!</h3>
              <p className="text-sm sm:text-base text-gray-600 mb-5 sm:mb-6 max-w-md mx-auto">
                These flash sale prices won't last long. Shop now and save big on premium fashion!
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4">
                <div className="text-xs sm:text-sm text-gray-500">⚡ Free shipping on all orders</div>
                <div className="text-xs sm:text-sm text-gray-500">🔄 Easy returns</div>
                <div className="text-xs sm:text-sm text-gray-500">💳 Secure checkout</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
}
