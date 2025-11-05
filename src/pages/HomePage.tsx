import React, { useState, useMemo } from 'react';
import { ArrowRight, ShoppingBag } from 'lucide-react';
import Hero from '../components/Hero';
import FeaturedCollections from '../components/FeaturedCollections';
import ProductGrid from '../components/ProductGrid';
import ProductModal from '../components/ProductModal';
import FilterSidebar from '../components/FilterSidebar';
import Newsletter from '../components/Newsletter';
import Testimonials from '../components/Testimonials';
import { products } from '../data/products';
import { Product } from '../types';

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [priceRange, setPriceRange] = useState({ min: 0, max: Infinity });

  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by price range
    filtered = filtered.filter(product =>
      product.price >= priceRange.min && product.price <= priceRange.max
    );

    // Sort products
    if (sortBy) {
      filtered = [...filtered].sort((a, b) => {
        switch (sortBy) {
          case 'price-low':
            return a.price - b.price;
          case 'price-high':
            return b.price - a.price;
          case 'name':
            return a.name.localeCompare(b.name);
          case 'rating':
            return b.rating - a.rating;
          default:
            return 0;
        }
      });
    }

    return filtered;
  }, [selectedCategory, searchQuery, sortBy, priceRange]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const handleSortChange = (sort: string) => {
    setSortBy(sort);
  };

  const handlePriceFilter = (min: number, max: number) => {
    setPriceRange({ min, max });
  };

  return (
    <>
      <Hero />
      <FeaturedCollections />
      
      <div id="all-products" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Section Header */}
        <div className="text-center mb-10 sm:mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">
            {selectedCategory === 'all' ? 'All Products' : `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}`}
          </h2>
          <p className="text-base sm:text-lg text-gray-600 mb-5 sm:mb-6">{filteredProducts.length} items available</p>
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="bg-gradient-to-r from-gray-900 to-gray-700 text-white px-6 py-2.5 sm:px-8 sm:py-3 rounded-xl hover:from-gray-800 hover:to-gray-600 transition-all duration-300 shadow-lg hover:shadow-xl font-medium transform hover:scale-105 text-sm sm:text-base"
          >
            {isFilterOpen ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>

        <div className="relative">
          <FilterSidebar
            isOpen={isFilterOpen}
            onToggle={() => setIsFilterOpen(false)}
            onSortChange={handleSortChange}
            onPriceFilter={handlePriceFilter}
          />
          
          <div className={`transition-all duration-500 ${isFilterOpen ? 'lg:ml-80' : 'lg:ml-0'}`}>
            <ProductGrid
              products={filteredProducts}
              onProductClick={handleProductClick}
            />
            
            {/* View All Products Button */}
            {filteredProducts.length >= 8 && (
              <div className="text-center mt-10 sm:mt-12">
                <div className="relative group cursor-pointer">
                  {/* Animated Background Layers */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-700 -z-20"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-500 -z-10"></div>
                  
                  {/* Main Card */}
                  <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl p-8 sm:p-12 border border-gray-200 shadow-xl hover:shadow-2xl transition-all duration-700 transform group-hover:-translate-y-2 group-hover:scale-[1.02] overflow-hidden">
                    {/* Background Overlay */}
                    <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>
                    
                    {/* Floating Particles */}
                    <div className="absolute top-6 right-6 w-3 h-3 sm:w-4 sm:h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-bounce transition-all duration-500" style={{ animationDelay: '0.2s' }}></div>
                    <div className="absolute top-12 right-12 w-2 h-2 sm:w-3 sm:h-3 bg-gradient-to-r from-green-400 to-blue-500 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-pulse transition-all duration-700" style={{ animationDelay: '0.4s' }}></div>
                    <div className="absolute bottom-6 left-6 w-4 h-4 sm:w-5 sm:h-5 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-all duration-600" style={{ animationDelay: '0.1s' }}></div>
                    <div className="absolute bottom-12 left-12 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-bounce transition-all duration-800" style={{ animationDelay: '0.3s' }}></div>
                    
                    {/* Content */}
                    <div className="relative z-10">
                      {/* Icon with Animation */}
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 sm:mb-8 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg group-hover:shadow-2xl">
                        <ShoppingBag className="h-8 w-8 sm:h-10 sm:w-10 text-white group-hover:scale-110 transition-transform duration-300" />
                      </div>
                      
                      {/* Title with Gradient Effect */}
                      <h3 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4 sm:mb-6 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:via-purple-600 group-hover:to-pink-600 transition-all duration-500 leading-tight">
                        Discover More Amazing Products
                      </h3>
                      
                      {/* Description */}
                      <p className="text-base sm:text-xl text-gray-600 mb-8 sm:mb-10 leading-relaxed group-hover:text-gray-700 transition-colors duration-300 max-w-2xl mx-auto">
                        Explore our complete collection of premium fashion items designed for every style, season, and occasion
                      </p>
                      
                      {/* Enhanced Button */}
                      <button 
                        onClick={() => window.location.href = '/products'}
                        className="group/btn relative bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white px-10 py-4 sm:px-16 sm:py-5 rounded-2xl font-bold text-base sm:text-lg hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 transition-all duration-500 transform hover:scale-110 shadow-xl hover:shadow-2xl flex items-center gap-3 sm:gap-4 mx-auto overflow-hidden"
                        style={{ borderRadius: '1rem' }}
                      >
                        {/* Button Background Animation */}
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
                        
                        {/* Button Content */}
                        <div className="relative z-10 flex items-center gap-3 sm:gap-4">
                          <ShoppingBag className="h-5 w-5 sm:h-6 sm:w-6 group-hover/btn:rotate-12 group-hover/btn:scale-110 transition-all duration-300" />
                          <span className="tracking-wide">View All Products</span>
                          <ArrowRight className="h-5 w-5 sm:h-6 sm:w-6 group-hover/btn:translate-x-2 group-hover/btn:scale-110 transition-all duration-300" />
                        </div>
                        
                        {/* Button Glow Effect */}
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 opacity-0 group-hover/btn:opacity-30 transition-opacity duration-500 blur-xl -z-10"></div>
                      </button>
                      
                      {/* Stats Row */}
                      <div className="mt-8 sm:mt-10 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs sm:text-sm text-gray-500 group-hover:text-gray-600 transition-colors duration-300">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span>500+ Products</span>
                        </div>
                        <div className="w-px h-4 bg-gray-300 hidden sm:block"></div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                          <span>Free Shipping</span>
                        </div>
                        <div className="w-px h-4 bg-gray-300 hidden sm:block"></div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
                          <span>Easy Returns</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Ripple Effect */}
                    <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-pink-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700 animate-pulse -z-20"></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Testimonials />
      <Newsletter />

      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </>
  );
}
