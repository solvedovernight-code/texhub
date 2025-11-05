/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      keyframes: {
        'fade-in-up': {
          'from': { opacity: '0', transform: 'translateY(20px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-delay': {
          'from': { opacity: '0' },
          'to': { opacity: '1' },
        },
        'text-reveal': {
          'from': { opacity: '0', transform: 'translateY(10px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        'card-in': {
          'from': { opacity: '0', transform: 'translateY(30px) scale(0.95)' },
          'to': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        'pulse-button': {
          '0%': { boxShadow: '0 0 0 0 rgba(52, 211, 153, 0.7)' },
          '70%': { boxShadow: '0 0 0 10px rgba(52, 211, 153, 0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(52, 211, 153, 0)' },
        },
        'fade-in-left': {
          'from': { opacity: '0', transform: 'translateX(-50px)' },
          'to': { opacity: '1', transform: 'translateX(0)' },
        },
        'fade-in-right': {
          'from': { opacity: '0', transform: 'translateX(50px)' },
          'to': { opacity: '1', transform: 'translateX(0)' },
        },
        'zoom-in': {
          'from': { transform: 'scale(1)' },
          'to': { transform: 'scale(1.05)' },
        },
        'fade-in-up-rotate': {
          'from': { opacity: '0', transform: 'translateY(50px) rotateX(-30deg) scale(0.9)' },
          'to': { opacity: '1', transform: 'translateY(0) rotateX(0deg) scale(1)' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.8s ease-out forwards',
        'fade-in-delay': 'fade-in-delay 1s ease-out 0.5s forwards',
        'text-reveal': 'text-reveal 0.8s ease-out forwards',
        'card-in': 'card-in 0.7s ease-out forwards',
        'card-in-delay-1': 'card-in 0.7s ease-out 0.2s forwards',
        'card-in-delay-2': 'card-in 0.7s ease-out 0.4s forwards',
        'pulse-button': 'pulse-button 2s infinite',
        'fade-in-left': 'fade-in-left 0.8s ease-out forwards',
        'fade-in-right': 'fade-in-right 0.8s ease-out forwards',
        'zoom-in': 'zoom-in 10s ease-out forwards',
        'fade-in-left-stagger': 'fade-in-left 0.8s ease-out forwards',
        'text-reveal-stagger': 'text-reveal 0.8s ease-out 0.3s forwards',
        'text-reveal-stagger-2': 'text-reveal 0.8s ease-out 0.6s forwards',
        'fade-in-left-stagger-3': 'fade-in-left 0.8s ease-out 0.9s forwards',
        'fade-in-up-rotate': 'fade-in-up-rotate 1s ease-out forwards',
      },
    },
  },
  plugins: [],
};
