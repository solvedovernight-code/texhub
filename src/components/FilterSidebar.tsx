import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Filter, X, DollarSign } from 'lucide-react';

interface FilterSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onSortChange: (sort: string) => void;
  onPriceFilter: (min: number, max: number) => void;
}

export default function FilterSidebar({ isOpen, onToggle, onSortChange, onPriceFilter }: FilterSidebarProps) {
  const [sortBy, setSortBy] = useState('');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 200 });
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const handleSortChange = (value: string) => {
    setSortBy(value);
    onSortChange(value);
  };

  const handlePriceChange = (type: 'min' | 'max', value: number) => {
    const newRange = { ...priceRange, [type]: value };
    setPriceRange(newRange);
    onPriceFilter(newRange.min, newRange.max);
  };

  const toggleSelection = (item: string, list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const clearAllFilters = () => {
    setSortBy('');
    setPriceRange({ min: 0, max: 200 });
    setSelectedSizes([]);
    setSelectedColors([]);
    setSelectedCategories([]);
    onSortChange('');
    onPriceFilter(0, Infinity);
  };

  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const colors = [
    { name: 'Black', value: '#000000' },
    { name: 'White', value: '#FFFFFF' },
    { name: 'Gray', value: '#6B7280' },
    { name: 'Navy', value: '#1E3A8A' },
    { name: 'Red', value: '#DC2626' },
    { name: 'Blue', value: '#2563EB' },
    { name: 'Green', value: '#059669' },
    { name: 'Brown', value: '#92400E' }
  ];
  const categories = ['Tops', 'Bottoms', 'Shirts', 'Sweaters', 'Jackets', 'Accessories'];

  return (
    <div className={`fixed left-4 top-32 z-40 transition-all duration-500 transform ${isOpen ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'}`}>
      <div className="w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 h-fit max-h-[calc(100vh-200px)] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-900 to-gray-700 rounded-t-2xl text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-white" />
              <h3 className="text-lg font-semibold text-white">Filters</h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={clearAllFilters}
                className="text-sm text-gray-300 hover:text-white transition-colors duration-200 px-3 py-1 rounded-lg hover:bg-white/20"
              >
                Clear All
              </button>
              <button
                onClick={onToggle}
                className="p-2 hover:bg-white/20 rounded-full transition-all duration-200 hover:scale-110 text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-8 max-h-[calc(100vh-300px)] overflow-y-auto">
          {/* Sort By */}
          <div className="bg-gray-50 p-4 rounded-xl">
            <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <ChevronDown className="h-4 w-4" />
              Sort By
            </h4>
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm hover:shadow-md"
            >
              <option value="">Select sorting...</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name">Name: A to Z</option>
              <option value="rating">Rating: High to Low</option>
            </select>
          </div>

          {/* Price Range */}
          <div className="bg-gray-50 p-4 rounded-xl">
            <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Price Range
            </h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>${priceRange.min}</span>
                <span>${priceRange.max}</span>
              </div>
              
              {/* Min Price Slider */}
              <div>
                <label className="block text-xs text-gray-500 mb-2">Minimum Price</label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={priceRange.min}
                  onChange={(e) => handlePriceChange('min', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb"
                />
              </div>
              
              {/* Max Price Slider */}
              <div>
                <label className="block text-xs text-gray-500 mb-2">Maximum Price</label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={priceRange.max}
                  onChange={(e) => handlePriceChange('max', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb"
                />
              </div>
              
              <div className="flex gap-2">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Min Price</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={priceRange.min}
                    onChange={(e) => handlePriceChange('min', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Max Price</label>
                  <input
                    type="number"
                    placeholder="200"
                    value={priceRange.max}
                    onChange={(e) => handlePriceChange('max', parseInt(e.target.value) || 200)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white shadow-sm"
                  />
                </div>
              </div>
              </div>
            </div>
          </div>

          {/* Categories */}
          <div className="bg-gray-50 p-4 rounded-xl">
            <h4 className="text-sm font-semibold text-gray-900 mb-4">Categories</h4>
            <div className="space-y-2">
              {categories.map((category) => (
                <label key={category} className="flex items-center cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(category)}
                    onChange={() => toggleSelection(category, selectedCategories, setSelectedCategories)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <span className="ml-3 text-sm text-gray-700 group-hover:text-gray-900 transition-colors duration-200">
                    {category}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Size Filter */}
          <div className="bg-gray-50 p-4 rounded-xl">
            <h4 className="text-sm font-semibold text-gray-900 mb-4">Size</h4>
            <div className="flex flex-wrap gap-2">
              {sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => toggleSelection(size, selectedSizes, setSelectedSizes)}
                  className={`px-4 py-2 border rounded-xl text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
                    selectedSizes.includes(size)
                      ? 'border-blue-500 bg-blue-500 text-white shadow-lg'
                      : 'border-gray-300 text-gray-700 hover:border-blue-300 hover:bg-blue-50 bg-white'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Color Filter */}
          <div className="bg-gray-50 p-4 rounded-xl">
            <h4 className="text-sm font-semibold text-gray-900 mb-4">Color</h4>
            <div className="grid grid-cols-4 gap-3">
              {colors.map((color) => (
                <button
                  key={color.name}
                  onClick={() => toggleSelection(color.name, selectedColors, setSelectedColors)}
                  className={`relative w-12 h-12 rounded-full border-2 transition-all duration-200 transform hover:scale-110 ${
                    selectedColors.includes(color.name)
                      ? 'border-blue-500 scale-110 shadow-lg'
                      : 'border-gray-300 hover:border-blue-300 shadow-sm hover:shadow-md'
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                >
                  {selectedColors.includes(color.name) && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className={`w-4 h-4 rounded-full ${color.value === '#FFFFFF' ? 'bg-blue-500' : 'bg-white'} shadow-lg`} />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
