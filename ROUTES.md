# TradeHub Ghana - Route Documentation

The application implements a role-isolated routing architecture to prevent "UI bleed" between Consumers and Merchants. 

## Authentication & Public Routes
These routes are unprotected and available to all users.
- `/` - **Landing Page**: The public gateway and discovery page.
- `/login` - **Login Page**: Standard user authentication.
- `/register` - **Registration Page**: New user onboarding.
- `/role` - **Role Selection**: Appears after signup for users to identify as a Buyer or Merchant.

## Customer Ecosystem
Protected routes accessible only by authenticated `customer` users. These routes are wrapped by the `CustomerLayout` which provides the global top bar navigation and filtering.

- `/catalog` - **Native Store (Default)**: The main product discovery grid with live filtering.
- `/product/:id` - **Product Details**: Specific product view (currently hooks into the catalog).
- `/auctions` - **Live Auctions**: Horizontal carousel view for active bidding items.
- `/merchants` - **Verified Merchants**: Horizontal carousel view showcasing top-tier sellers.
- `/escrow` - **Escrow Center**: View current orders and payment holding status.
- `/profile` - **My Profile**: Customer account settings.
- `/settings` - **Settings**: Application preferences.
- `/checkout` - **Checkout Page**: Dedicated full-screen route for finalizing a cart purchase.

## Merchant Ecosystem
Protected routes accessible only by authenticated `merchant` users. These routes are wrapped by the `MerchantLayout`.

- `/merchant` - **TradeHub Pro Dashboard**: The operational backend portal for inventory management, order fulfillment, and analytics.

---
**Testing Note:** The `ProtectedRoute` wrapper is currently bypassing strict auth checks for development/testing purposes, allowing you to freely navigate between the customer and merchant ecosystems without logging in.
