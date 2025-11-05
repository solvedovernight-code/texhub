import React from 'react';
import { Play } from 'lucide-react';

export default function Hero() {
  return (
    <div className="relative bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 min-h-screen overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-screen flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center w-full">
          {/* Left Content */}
          <div className="space-y-6 lg:space-y-8 pt-20 lg:pt-0">
            {/* Tagline */}
            <div className="inline-block">
              <p className="text-orange-600 font-semibold text-sm md:text-base tracking-wider uppercase">
                Premium Fashion Collection
              </p>
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight">
              Fashion, enjoy{' '}
              <span className="relative inline-block">
                and live
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2 10C100 2 200 2 298 10" stroke="#F97316" strokeWidth="4" strokeLinecap="round"/>
                </svg>
              </span>{' '}
              a new and full life
            </h1>

            {/* Description */}
            <p className="text-gray-600 text-base md:text-lg leading-relaxed max-w-xl">
              Built with premium quality and modern design. Preferred by fashion enthusiasts worldwide. Park yourself in style with our exclusive collection.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <button
                onClick={() => {
                  const productsSection = document.getElementById('all-products');
                  if (productsSection) {
                    productsSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-8 py-4 rounded-full font-semibold hover:from-orange-600 hover:to-amber-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Find out more
              </button>

              <button
                onClick={() => {
                  const productsSection = document.getElementById('all-products');
                  if (productsSection) {
                    productsSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="flex items-center gap-3 text-gray-700 font-semibold hover:text-gray-900 transition-colors duration-300 group"
              >
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300">
                  <Play className="h-5 w-5 text-orange-500 fill-orange-500" />
                </div>
                <span>Play Demo</span>
              </button>
            </div>
          </div>

          {/* Right Content - Model Image */}
          <div className="relative hidden lg:flex items-center justify-center">
            <div className="relative">
              {/* Decorative Elements */}
              <div className="absolute -top-8 -right-8 w-32 h-32 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full opacity-20 blur-3xl animate-pulse"></div>
              <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full opacity-20 blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

              {/* Flying Icons */}
              <div className="absolute top-20 -right-12 animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '3s' }}>
                <svg className="w-12 h-12 text-blue-400 opacity-80" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
                </svg>
              </div>

              <div className="absolute top-32 -left-8 animate-bounce" style={{ animationDelay: '1.5s', animationDuration: '2.5s' }}>
                <svg className="w-10 h-10 text-blue-400 opacity-80" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
                </svg>
              </div>

              <div className="absolute bottom-32 -right-16 animate-bounce" style={{ animationDelay: '0.8s', animationDuration: '2.8s' }}>
                <svg className="w-14 h-14 text-blue-400 opacity-80" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
                </svg>
              </div>

              {/* Main Image */}
              <div className="relative z-10 w-full max-w-lg">
                <img
                  src="https://raw.githubusercontent.com/Solved-Overnight/arvana-clothing/refs/heads/main/img/collections/home_woman_model.jpg"
                  alt="Fashion Model"
                  className="w-full h-auto object-cover rounded-3xl"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-orange-200 to-amber-200 rounded-full opacity-30 blur-3xl -z-10"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-blue-200 to-cyan-200 rounded-full opacity-30 blur-3xl -z-10"></div>
    </div>
  );
}
