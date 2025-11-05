import React from 'react';
import { Quote } from 'lucide-react';

interface QuoteSectionProps {
  quote: string;
  author: string;
}

export default function QuoteSection({ quote, author }: QuoteSectionProps) {
  return (
    <div className="relative bg-gradient-to-r from-green-600 to-blue-600 text-white py-20 px-8 sm:px-12 lg:px-16 rounded-3xl shadow-2xl overflow-hidden transform rotate-1 skew-y-1 scale-95 my-24 animate-fade-in-up-rotate">
      <div className="absolute inset-0 bg-pattern-quote opacity-10 z-0"></div>
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <Quote className="w-16 h-16 text-white/70 mx-auto mb-6 transform -rotate-6" />
        <p className="text-3xl sm:text-4xl font-extrabold leading-tight mb-8 italic drop-shadow-lg">
          "{quote}"
        </p>
        <p className="text-xl sm:text-2xl font-semibold text-white/90">
          - {author}
        </p>
      </div>
    </div>
  );
}
