# LUXE - Modern Clothing Brand Website

A professional e-commerce website built with React, TypeScript, and Firebase, featuring a modern design inspired by top fashion brands like Zara and H&M.

## 🚀 Features

### Core Functionality
- **Hero Section**: Auto-sliding carousel with typing animation
- **Product Catalog**: Complete product browsing with filtering and search
- **Shopping Cart**: Full cart management with add/remove functionality
- **User Authentication**: Firebase-powered login/signup system
- **Wishlist**: Save favorite items with Firebase sync
- **User Profile**: Complete profile management with editable fields

### Professional Design
- **Responsive Design**: Mobile-first approach with all device support
- **Modern UI**: Clean, minimalist aesthetic with premium typography
- **Smooth Animations**: Hover effects, transitions, and micro-interactions
- **Professional Notifications**: Toast-style notifications with proper feedback
- **Typing Animation**: Dynamic text animation in hero section

### Technical Stack
- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Authentication**: Firebase Auth
- **Database**: Firestore
- **State Management**: React Context API
- **Icons**: Lucide React
- **Build Tool**: Vite

## 🛠️ Setup Instructions

### 1. Firebase Configuration

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication with Email/Password provider
3. Create a Firestore database
4. Get your Firebase config from Project Settings
5. Update `src/config/firebase.ts` with your Firebase configuration:

```typescript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};
```

### 2. Firestore Security Rules

Add these security rules to your Firestore database:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read and write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Users can read and write their own wishlist items
    match /wishlists/{wishlistId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
  }
}
```

### 3. Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

## 📱 Features Overview

### Authentication System
- Email/password authentication via Firebase
- User registration with profile creation
- Secure login/logout functionality
- Profile management with editable fields

### Shopping Experience
- Product browsing with category filters
- Advanced search functionality
- Product detail modals with image galleries
- Size and color selection
- Shopping cart with quantity management
- Wishlist functionality with Firebase sync

### Professional UI/UX
- Auto-sliding hero carousel with dot navigation
- Typing animation for dynamic text
- Professional toast notifications
- Responsive design for all devices
- Smooth animations and transitions

## 🎨 Design Philosophy

The website follows modern e-commerce design principles:
- **Clean & Minimal**: Focus on products with minimal distractions
- **Professional Typography**: Carefully chosen fonts and spacing
- **Consistent Spacing**: 8px grid system throughout
- **Premium Feel**: High-quality imagery and sophisticated interactions
- **Mobile-First**: Optimized for mobile devices with desktop enhancements

## 🔧 Development

### Project Structure
```
src/
├── components/          # React components
├── context/            # Context providers
├── hooks/              # Custom hooks
├── config/             # Configuration files
├── data/               # Static data
├── types/              # TypeScript types
└── main.tsx           # Application entry point
```

### Key Components
- `Hero.tsx` - Auto-sliding carousel with typing animation
- `ProductGrid.tsx` - Product listing with filtering
- `Cart.tsx` - Shopping cart management
- `WishlistModal.tsx` - Wishlist functionality
- `LoginModal.tsx` - Authentication interface
- `ProfileModal.tsx` - User profile management

## 🚀 Deployment

The application is ready for deployment to platforms like:
- Netlify
- Vercel
- Firebase Hosting

Make sure to set up your Firebase configuration in the production environment.

## 📄 License

This project is for educational and demonstration purposes.
