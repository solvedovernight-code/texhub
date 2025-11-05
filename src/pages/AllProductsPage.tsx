import React, { useState, useMemo, useEffect } from 'react';
import { ArrowLeft, Filter, Search, Grid, List } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom'; // Import useSearchParams
import ProductGrid from '../components/ProductGrid';
import ProductModal from '../components/ProductModal';
import FilterSidebar from '../components/FilterSidebar';
import { products } from '../data/products';
import { Product } from '../types';

export default function AllProductsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams(); // Get search params and setter
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || ''); // Initialize from URL
  const [sortBy, setSortBy] = useState('');
  const [priceRange, setPriceRange] = useState({ min: 0, max: Infinity });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Effect to update searchQuery state if URL param changes externally
  useEffect(() => {
    const queryFromUrl = searchParams.get('q') || '';
    if (queryFromUrl !== searchQuery) {
      setSearchQuery(queryFromUrl);
    }
  }, [searchParams, searchQuery]);

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

  const categories = [
    { id: 'all', name: 'All Products', count: products.length },
    { id: 'tops', name: 'Tops', count: products.filter(p => p.category === 'tops').length },
    { id: 'bottoms', name: 'Bottoms', count: products.filter(p => p.category === 'bottoms').length },
    { id: 'shirts', name: 'Shirts', count: products.filter(p => p.category === 'shirts').length },
    { id: 'sweaters', name: 'Sweaters', count: products.filter(p => p.category === 'sweaters').length },
    { id: 'jackets', name: 'Jackets', count: products.filter(p => p.category === 'jackets').length }
  ];

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query); // Update local state
    if (query) {
      setSearchParams({ q: query }); // Update URL param
    } else {
      setSearchParams({}); // Clear param if query is empty
    }
  };

  const handleSortChange = (sort: string) => {
    setSortBy(sort);
  };

  const handlePriceFilter = (min: number, max: number) => {
    setPriceRange({ min, max });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 sm:gap-4">
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-1 sm:gap-2 text-gray-600 hover:text-gray-900 transition-colors duration-200 text-sm sm:text-base"
              >
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                Back to Home
              </button>
              <div className="h-5 w-px bg-gray-300 hidden sm:block"></div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">All Products</h1>
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
              {/* Search */}
              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full px-3 py-2 pl-9 sm:pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm sm:text-base"
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
              </div>
              
              {/* View Mode Toggle */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors duration-200 ${
                    viewMode === 'grid' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
                  }`}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors duration-200 ${
                    viewMode === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
                  }`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
              
              {/* Filter Toggle */}
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="flex items-center justify-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors duration-200 text-sm sm:text-base"
              >
                <Filter className="h-4 w-4" />
                Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full whitespace-nowrap transition-colors duration-200 text-sm ${
                  selectedCategory === category.id
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.name}
                <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                  {category.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-white py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <p className="mt-2 text-2xl sm:text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Discover More Amazing Products
            </p>
            <p className="mt-3 sm:mt-4 max-w-2xl text-base sm:text-xl text-gray-500 lg:mx-auto">
              Explore our complete collection of premium fashion items designed for every style, season, and occasion.
            </p>
          </div>

          <div className="mt-8 sm:mt-10">
            <dl className="space-y-8 md:space-y-0 md:grid md:grid-cols-3 md:gap-8">
              <div className="relative">
                <dt>
                  <div className="absolute flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-md bg-gray-900 text-white">
                    {/* Icon */}
                    <svg className="h-5 w-5 sm:h-6 sm:w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  <p className="ml-12 sm:ml-16 text-base sm:text-lg leading-6 font-medium text-gray-900">
                    <a href="#" className="text-blue-600 hover:underline">View All Products</a>
                  </p>
                </dt>
                <dd className="mt-1 sm:mt-2 ml-12 sm:ml-16 text-sm sm:text-base text-gray-500">
                  Browse our extensive range of products.
                </dd>
              </div>

              <div className="relative">
                <dt>
                  <div className="absolute flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-md bg-gray-900 text-white">
                    {/* Icon */}
                    <svg className="h-5 w-5 sm:h-6 sm:w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="ml-12 sm:ml-16 text-base sm:text-lg leading-6 font-medium text-gray-900">500+ Products</p>
                </dt>
                <dd className="mt-1 sm:mt-2 ml-12 sm:ml-16 text-sm sm:text-base text-gray-500">
                  Discover a wide variety of items.
                </dd>
              </div>

              <div className="relative">
                <dt>
                  <div className="absolute flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-md bg-gray-900 text-white">
                    {/* Icon */}
                    <svg className="h-5 w-5 sm:h-6 sm:w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <p className="ml-12 sm:ml-16 text-base sm:text-lg leading-6 font-medium text-gray-900">Free Shipping &amp; Easy Returns</p>
                </dt>
                <dd className="mt-1 sm:mt-2 ml-12 sm:ml-16 text-sm sm:text-base text-gray-500">
                  Enjoy hassle-free shopping with free shipping and easy returns.
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <p className="text-base sm:text-lg text-gray-600">
            Showing {filteredProducts.length} of {products.length} products
          </p>
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
          </div>
        </div>
      </div>

      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
}
