# Otaku Nation - Client Application

Welcome to the frontend application for **Otaku Nation**, a comprehensive e-commerce platform dedicated to anime merchandise. This application is built with modern web technologies, providing a fast, responsive, and seamless shopping experience.

## Table of Contents
- [Project Overview](#project-overview)
- [Technologies Used](#technologies-used)
- [Key Features](#key-features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Available Scripts](#available-scripts)

## Project Overview
The Otaku Nation client is a Single Page Application (SPA) designed to handle product browsing, cart management, user authentication, and order tracking. It was migrated to a modern React stack to improve performance, development speed, and maintainability.

## Technologies Used
- **Framework:** React.js
- **Build Tool:** Vite
- **Routing:** React Router v6
- **State Management:** Zustand (Cart, Wishlist)
- **Styling:** Vanilla CSS (Modular, Utility-first approach)
- **Icons:** React Icons

## Key Features
- **Dynamic Product Catalog:** View products, filter by categories, and review product details.
- **Cart & Wishlist Management:** Persistent shopping cart and wishlist functionality powered by Zustand and local storage.
- **Order Tracking:** Integrated UI to check the visual progress and status of previous purchases.
- **User Dashboard:** Dedicated account area for user profiles, order history, and saved addresses.
- **Admin Interface:** Layouts and templates designed for inventory management, customer support, and administrative settings.
- **Responsive Design:** Fully optimized layouts for both mobile and desktop experiences.

## Project Structure
```text
client/
├── public/                 # Static assets (favicons, etc.)
├── src/
│   ├── assets/             # Images, global styles, and fonts
│   ├── components/         # Reusable UI components (Layout, UI elements)
│   ├── pages/              # Route-specific page components
│   │   ├── Admin/          # Admin dashboard pages
│   │   ├── Auth/           # Login and Registration
│   │   ├── Checkout/       # Cart, Payment, and Confirmation
│   │   ├── General/        # Home, Contact, NotFound
│   │   ├── Shop/           # Products, Product Details
│   │   └── User/           # Account, Orders, Order Tracking, Wishlist
│   ├── App.jsx             # Main application routing and entry point
│   └── main.jsx            # React DOM rendering
├── index.html              # HTML template
├── package.json            # Project dependencies and scripts
└── vite.config.js          # Vite configuration
```

## Getting Started

### Prerequisites
Make sure you have Node.js (version 16 or higher) installed on your system.

### Installation
1. Navigate to the client directory:
   ```bash
   cd client
   ```
2. Install the required dependencies:
   ```bash
   npm install
   ```

### Running the Application
To start the local development server:
```bash
npm run dev
```
The application will be available at `http://localhost:5173`.

## Available Scripts

In the project directory, you can run:

- `npm run dev`: Starts the Vite development server with Hot Module Replacement (HMR).
- `npm run build`: Bundles the application for production into the `dist` folder.
- `npm run preview`: Locally previews the production build.
- `npm run lint`: Runs ESLint to find and fix code style issues.

---
*Built for the Otaku Nation e-commerce modernization initiative.*
