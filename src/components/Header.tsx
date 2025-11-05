import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, User, Menu, X, Heart, Settings, Siren as Fire, Leaf } from 'lucide-react'; // Import Leaf icon
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  onCartClick: () => void;
  onWishlistClick: () => void;
  onProfileClick: () => void;
  onSearchSubmit: (query: string) => void;
}

export default function Header({ onCartClick, onWishlistClick, onProfileClick, onSearchSubmit }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // const [isSearchOpen, setIsSearchOpen] = useState(false); // No longer needed if search icon is removed
  const [searchQuery, setSearchQuery] = useState('');
  const { state } = useCart();
  const { state: wishlistState } = useWishlist();
  const { state: authState, logout } = useAuth();
  const location = useLocation();

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
    { name: 'Sustainability', href: '/sustainability' } // Add Sustainability link
  ];

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      onSearchSubmit(searchQuery.trim());
      // setIsSearchOpen(false); // No longer needed
      setSearchQuery('');
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center group">
              <div className="relative">
                <h1 className="text-4xl font-black bg-gradient-to-r from-gray-900 via-blue-800 to-purple-900 bg-clip-text text-transparent tracking-wider relative">
                  ARVANA
                  <div className="absolute -top-1 -right-2 w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-pulse"></div>
                  <div className="absolute -bottom-1 left-0 w-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 group-hover:w-full transition-all duration-700 rounded-full"></div>
                </h1>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`text-gray-700 hover:text-gray-900 transition-all duration-300 font-medium relative group py-2 ${
                  location.pathname === item.href ? 'text-gray-900' : ''
                }`}
              >
                {item.name === 'Sustainability' ? (
                  <span className="flex items-center gap-2">
                    <Leaf className="h-4 w-4 text-green-600" />
                    {item.name}
                  </span>
                ) : (
                  item.name
                )}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gray-900 transition-all duration-300 group-hover:w-full"></span>
                {location.pathname === item.href && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-500 to-purple-600"></span>
                )}
              </Link>
            ))}
            
            {/* Flash Sale Link */}
            <Link
              to="/flash-sale"
              className="text-red-600 hover:text-red-700 transition-all duration-300 font-medium relative group py-2 flex items-center gap-2 animate-pulse"
            >
              <Fire className="h-4 w-4 animate-bounce" />
              Flash Sale
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-red-600 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            
            {/* Admin Link - Only show if authenticated */}
            {authState.isAuthenticated && (
              <Link
                to="/admin"
                className="text-gray-700 hover:text-blue-600 transition-all duration-300 font-medium relative group py-2 flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                Admin
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
              </Link>
            )}
          </nav>

          {/* Right Icons */}
          <div className="flex items-center space-x-4">
            {/* Search - Removed from here, now only in AllProductsPage */}
            {/* <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all duration-300 transform hover:scale-110"
            >
              <Search className="h-5 w-5" />
            </button> */}

            {/* Wishlist */}
            <button 
              onClick={onWishlistClick}
              className="p-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all duration-300 transform hover:scale-110 relative group"
            >
              <Heart className="h-5 w-5 group-hover:text-red-500 transition-colors duration-300" />
              {wishlistState.items.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                  {wishlistState.items.length}
                </span>
              )}
            </button>

            {/* User */}
            <div className="relative group">
              <button 
                onClick={onProfileClick}
                className="p-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all duration-300 transform hover:scale-110 flex items-center"
              >
                {authState.isAuthenticated && authState.user?.avatar ? (
                  <img
                    src={authState.user.avatar}
                    alt={authState.user.name}
                    className="h-6 w-6 rounded-full object-cover ring-2 ring-transparent group-hover:ring-gray-300 transition-all duration-300"
                  />
                ) : (
                  <User className="h-5 w-5" />
                )}
              </button>
              
              {authState.isAuthenticated && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                  <button
                    onClick={onProfileClick}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                  >
                    My Profile
                  </button>
                  <button
                    onClick={logout}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>

            {/* Shopping Bag */}
            <button
              onClick={onCartClick}
              className="p-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all duration-300 transform hover:scale-110 relative group"
            >
              <ShoppingBag className="h-5 w-5 group-hover:text-blue-500 transition-colors duration-300" />
              {state.itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-bounce">
                  {state.itemCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all duration-300"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Search Bar - Removed from Header, as it's now only in AllProductsPage */}
        {/* {isSearchOpen && (
          <div className="py-4 border-t border-gray-200 transform transition-all duration-500 ease-out animate-in slide-in-from-top-2">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                placeholder="Search products..."
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                className="w-full px-4 py-3 pl-12 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white shadow-lg"
                autoFocus
              />
              <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>
        )} */}

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 transform transition-all duration-300 ease-out animate-in slide-in-from-top-2">
            <nav className="flex flex-col space-y-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`text-left text-gray-700 hover:text-gray-900 hover:bg-gray-50 px-4 py-2 rounded-lg transition-all duration-300 font-medium ${
                    location.pathname === item.href ? 'text-gray-900 bg-gray-50' : ''
                  }`}
                >
                  {item.name === 'Sustainability' ? (
                    <span className="flex items-center gap-2">
                      <Leaf className="h-4 w-4 text-green-600" />
                      {item.name}
                    </span>
                  ) : (
                    item.name
                  )}
                </Link>
              ))}
              
              {/* Mobile Flash Sale */}
              <Link
                to="/flash-sale"
                onClick={() => setIsMenuOpen(false)}
                className="text-left text-red-600 hover:text-red-700 hover:bg-red-50 px-4 py-2 rounded-lg transition-all duration-300 font-medium flex items-center gap-2 animate-pulse"
              >
                <Fire className="h-4 w-4 animate-bounce" />
                Flash Sale
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
