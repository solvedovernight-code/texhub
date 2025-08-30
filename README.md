# TextileHub: Dyeing & Inventory Management App

## Project Overview

TextileHub is a comprehensive web application designed to streamline the dyeing and chemical requisition processes for textile manufacturers. It provides a robust platform for managing dyeing recipes, tracking chemical inventory, generating proforma invoices, and maintaining a detailed history of operations. Built with a focus on precision, efficiency, and user experience, TextileHub aims to be an indispensable tool for lab technicians, production managers, and sales teams in the textile industry.

## Features

*   **Dyeing Calculator:**
    *   Create and manage detailed dyeing recipes with precise chemical dosing calculations.
    *   Input fabric type, color, machine details, liquor ratio, and other critical parameters.
    *   Automatic calculation of total water required based on fabric weight and liquor ratio.
    *   Dynamic addition and reordering of chemical items with individual dosing, shade, quantity, unit price, and costing.
    *   Highlight specific chemical items for attention.
    *   Draft and Final document modes for recipe management.
    *   Inhouse and Subcontract product modes.

*   **Recipe History & Management:**
    *   Save dyeing recipes to the cloud (Firebase Firestore) for persistent storage.
    *   View a comprehensive history of all saved recipes, sortable by date.
    *   Search and filter recipes by various criteria (Req ID, Batch No, Buyer, Color, Fabric Type, Machine No, Date).
    *   Load any saved recipe back into the calculator for editing or re-use.
    *   Secure deletion of recipes with password re-authentication for enhanced security.

*   **Printable Reports:**
    *   Generate professional, printable reports for chemical requisitions.
    *   "View/Print" functionality to preview and print current or historical recipes.

*   **User Authentication:**
    *   Secure user authentication powered by Firebase Authentication.
    *   Recipes and data are stored securely under each user's account.
    *   Password re-authentication required for sensitive actions like deleting recipes.

*   **Intuitive User Interface:**
    *   Modern and responsive design built with React and Tailwind CSS.
    *   Interactive components with clear feedback states and subtle animations.
    *   Toast notifications for user actions (save, delete, error).
    *   Customizable settings (industry name, currency, date format - *future enhancement*).

## Technology Stack

*   **Frontend:** React, TypeScript, Vite
*   **Styling:** Tailwind CSS
*   **State Management:** React's built-in state management (useState, useEffect, useCallback)
*   **UI Components:** Shadcn/ui (Dialog, Button, Input, Toast)
*   **Animations:** Framer Motion
*   **Printing:** React-to-Print
*   **Drag and Drop:** React Beautiful DND
*   **Backend:** Firebase (Firestore for database, Authentication for user management)

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

*   Node.js (v18 or higher)
*   npm or Yarn

### Firebase Setup

1.  **Create a Firebase Project:**
    *   Go to the [Firebase Console](https://console.firebase.google.com/).
    *   Click "Add project" and follow the steps to create a new project.

2.  **Enable Firestore Database:**
    *   In your Firebase project, navigate to "Firestore Database".
    *   Click "Create database" and choose "Start in production mode" (you can adjust security rules later). Select a location for your database.

3.  **Enable Firebase Authentication:**
    *   In your Firebase project, navigate to "Authentication".
    *   Go to the "Sign-in method" tab and enable "Email/Password" provider.

4.  **Get Firebase Configuration:**
    *   In your Firebase project, go to "Project settings" (gear icon next to "Project overview").
    *   Scroll down to "Your apps" and click the web icon `</>` to add a new web app.
    *   Follow the steps and copy your Firebase configuration object.

5.  **Update `src/lib/firebaseConfig.ts`:**
    *   Create a file `src/lib/firebaseConfig.ts` if it doesn't exist.
    *   Paste your Firebase configuration into this file, replacing the placeholder values. It should look something like this:

    ```typescript
    // src/lib/firebaseConfig.ts
    import { initializeApp } from "firebase/app";
    import { getFirestore } from "firebase/firestore";
    import { getAuth } from "firebase/auth";

    const firebaseConfig = {
      apiKey: "YOUR_API_KEY",
      authDomain: "YOUR_AUTH_DOMAIN",
      projectId: "YOUR_PROJECT_ID",
      storageBucket: "YOUR_STORAGE_BUCKET",
      messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
      appId: "YOUR_APP_ID"
    };

    const app = initializeApp(firebaseConfig);
    export const db = getFirestore(app);
    export const auth = getAuth(app);
    ```

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd textile-hub
    ```
    *(Note: In a WebContainer environment, cloning is not directly supported. You would typically receive the project files directly.)*

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

### Running the Application

1.  **Start the development server:**
    ```bash
    npm run dev
    # or
    yarn dev
    ```
    The application will open in your browser, usually at `http://localhost:5173`.

## Usage

1.  **Login/Register:** Upon first access, you will be prompted to log in or register. Use your email and a strong password.
2.  **Chemical Requisition (Form Tab):**
    *   Fill in the dyeing parameters in the "Dyeing Form" section.
    *   Add chemical items, specify dosing, quantity, and unit price. The costing will be calculated automatically.
    *   Use the drag-and-drop functionality to reorder chemical items.
    *   Click "Save Recipe" to save your current recipe to the cloud. If it's an existing recipe with changes, you'll have options to "Save As New" or "Update Existing".
    *   Click "View/Print" to generate a printable report.
3.  **History Tab:**
    *   Navigate to the "History" tab to view all your saved recipes.
    *   Use the search bar to quickly find specific recipes.
    *   Click the "Edit" icon (beaker) to load a recipe back into the form.
    *   Click the "Print" icon (printer) to generate a printable report for a historical recipe.
    *   Click the "Delete" icon (trash can) to remove a recipe. You will be prompted for password re-authentication for security.

## Future Enhancements

*   **Inventory Management:** Module for tracking chemical stock levels, reorder points, and supplier information.
*   **Proforma Invoicing:** Functionality to generate and manage proforma invoices for customers.
*   **Advanced Reporting:** More detailed analytics and custom report generation.
*   **User Roles & Permissions:** Implement different access levels for various users (e.g., lab, production, admin).
*   **Multi-language Support:** Localize the application for different regions.

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.
