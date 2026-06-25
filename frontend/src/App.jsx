import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import NavBar from "./components/NavBar";
import CatalogPage from "./pages/CatalogPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

import ProtectedRoute from "./components/ProtectedRoute";
import ProductDetailsPage from "./pages/ProductDetailsPage";
import CheckoutPage from "./pages/CheckoutPage";
import LandingPage from "./pages/LandingPage";
import MerchantDashboard from "./pages/MerchantDashboard";
import EscrowStatus from "./pages/EscrowStatus";
import CustomerLayout from "./components/CustomerLayout";
import MerchantLayout from "./components/MerchantLayout";
import AuctionsPage from "./pages/AuctionsPage";
import VerifiedMerchantsPage from "./pages/VerifiedMerchantsPage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import { CatalogProvider } from "./context/CatalogContext";
import { CartProvider } from "./context/CartContext";

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <CatalogProvider>
          <Router>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Customer Ecosystem (Isolated) */}
              <Route 
                element={
                  <ProtectedRoute allowedRole="customer">
                    <CustomerLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/catalog" element={<CatalogPage />} />
                <Route path="/product/:id" element={<ProductDetailsPage />} />
                <Route path="/escrow" element={<EscrowStatus />} />
                <Route path="/auctions" element={<AuctionsPage />} />
                <Route path="/merchants" element={<VerifiedMerchantsPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Route>

              {/* Merchant Ecosystem (Isolated) */}
              <Route 
                element={
                  <ProtectedRoute allowedRole="merchant">
                    <MerchantLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/merchant" element={<MerchantDashboard />} />
              </Route>

              {/* Dedicated Full Screen Routes (Customer) */}
              <Route path="/checkout" element={
                <ProtectedRoute allowedRole="customer">
                  <CheckoutPage />
                </ProtectedRoute>
              } />

              {/* Catch-all Route: Redirects any unknown or removed paths (like /role) to home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </CatalogProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
