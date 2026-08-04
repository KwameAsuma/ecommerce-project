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
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import LiveAuctions from "./pages/LiveAuctions";

import PublicOnlyRoute from "./components/PublicOnlyRoute";
import ProtectedRoute from "./components/ProtectedRoute";
import ProductDetailsPage from "./pages/ProductDetailsPage";
import CheckoutPage from "./pages/CheckoutPage";
import MerchantInventory from "./pages/MerchantInventory";
import MerchantAuctions from "./pages/MerchantAuctions";
import MerchantEscrow from "./pages/MerchantEscrow";
import MerchantSettings from "./pages/MerchantSettings";
import MerchantSupport from "./pages/MerchantSupport";
import MerchantProductForm from "./pages/MerchantProductForm";
import MerchantFinances from "./pages/MerchantFinances";
import MerchantPersonalProfilePage from "./pages/MerchantPersonalProfilePage";
import VendorStorePage from "./pages/VendorStorePage";

import EscrowStatus from "./pages/EscrowStatus";
import CustomerLayout from "./components/CustomerLayout";
import MerchantLayout from "./components/MerchantLayout";
import AuctionsPage from "./pages/AuctionsPage";
import VerifiedMerchantsPage from "./pages/VerifiedMerchantsPage";
import ProfilePage from "./pages/ProfilePage";
import MerchantProfilePage from "./pages/MerchantProfilePage";
import AllOrdersPage from "./pages/AllOrdersPage";
import AllBidsPage from "./pages/AllBidsPage";
import SettingsPage from "./pages/SettingsPage";
import { CatalogProvider } from "./context/CatalogContext";
import { CartProvider } from "./context/CartContext";
import AccountSetupModal from "./components/AccountSetupModal";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import AdminDashboard from "./pages/AdminDashboard";


function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <CatalogProvider>
          <Router>
            <ScrollToTop />
            <AccountSetupModal />
            <Routes>
              {/* Guest-Only Routes */}
              <Route element={<PublicOnlyRoute />}>
                <Route path="/login" element={<LoginPage />} />
                <Route path={import.meta.env.VITE_ADMIN_LOGIN_PATH || "/hidden-admin-xyz"} element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              </Route>

              {/* Customer Ecosystem */}
              <Route element={<CustomerLayout />}>
                <Route path="/" element={<CatalogPage />} />
                <Route path="/product/:id" element={<ProductDetailsPage />} />
                <Route path="/merchants" element={<VerifiedMerchantsPage />} />
                <Route path="/merchant-profile/:id" element={<MerchantProfilePage />} />
                <Route path="/auctions" element={<AuctionsPage />} />
                <Route path="/auctions/:id" element={<LiveAuctions />} />

                <Route element={<ProtectedRoute allowedRole="customer" />}>
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/escrow" element={<EscrowStatus />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/profile/orders" element={<AllOrdersPage />} />
                  <Route path="/profile/bids" element={<AllBidsPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                </Route>
              </Route>

              {/* Merchant Ecosystem */}
              <Route
                element={
                  <ProtectedRoute allowedRole="merchant">
                    <MerchantLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/merchant" element={<Navigate to="/merchant/finances" replace />} />
                <Route path="/merchant/inventory" element={<MerchantInventory />} />
                <Route path="/merchant/auctions" element={<MerchantAuctions />} />
                <Route path="/merchant/escrow" element={<MerchantEscrow />} />
                <Route path="/merchant/settings" element={<MerchantSettings />} />
                <Route path="/merchant/profile" element={<MerchantPersonalProfilePage />} />
                <Route path="/merchant/support" element={<MerchantSupport />} />
                <Route path="/merchant/products/new" element={<MerchantProductForm />} />
                <Route path="/merchant/products/:id/edit" element={<MerchantProductForm />} />
                <Route path="/merchant/finances" element={<MerchantFinances />} />
                <Route path="/merchant/store" element={<VendorStorePage />} />
              </Route>

              {/* Admin Ecosystem */}
              <Route path="/admin" element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </CatalogProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
