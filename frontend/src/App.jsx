import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { useEffect } from "react";
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
import MerchantInventory from "./pages/MerchantInventory";
import MerchantAuctions from "./pages/MerchantAuctions";
import MerchantEscrow from "./pages/MerchantEscrow";
import MerchantSettings from "./pages/MerchantSettings";
import MerchantSupport from "./pages/MerchantSupport";

import EscrowStatus from "./pages/EscrowStatus";
import CustomerLayout from "./components/CustomerLayout";
import MerchantLayout from "./components/MerchantLayout";
import AuctionsPage from "./pages/AuctionsPage";
import VerifiedMerchantsPage from "./pages/VerifiedMerchantsPage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import { CatalogProvider } from "./context/CatalogContext";
import { CartProvider } from "./context/CartContext";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <CatalogProvider>
          <Router>
            <ScrollToTop />
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
                <Route path="/merchant/inventory" element={<MerchantInventory />} />
                <Route path="/merchant/auctions" element={<MerchantAuctions />} />
                <Route path="/merchant/escrow" element={<MerchantEscrow />} />
                <Route path="/merchant/settings" element={<MerchantSettings />} />
                <Route path="/merchant/support" element={<MerchantSupport />} />
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
