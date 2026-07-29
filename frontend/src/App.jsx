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
import LiveAuctions from "./pages/LiveAuctions";

import PublicOnlyRoute from "./components/PublicOnlyRoute";
import ProtectedRoute from "./components/ProtectedRoute";
import ProductDetailsPage from "./pages/ProductDetailsPage";
import CheckoutPage from "./pages/CheckoutPage";
import MerchantDashboard from "./pages/MerchantDashboard";
import MerchantInventory from "./pages/MerchantInventory";
import MerchantAuctions from "./pages/MerchantAuctions";
import MerchantEscrow from "./pages/MerchantEscrow";
import MerchantSettings from "./pages/MerchantSettings";
import MerchantSupport from "./pages/MerchantSupport";
import MerchantProductForm from "./pages/MerchantProductForm";
import MerchantFinances from "./pages/MerchantFinances";

import AdminLayout from "./components/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminOrders from "./pages/admin/AdminOrders";

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

import AdminProducts from "./pages/admin/AdminProducts";
import AdminAuctions from "./pages/admin/AdminAuctions";

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
              {/* Always Accessible Routes */}
              {/* Root route is now handled inside CustomerLayout */}

              {/* Guest Only Routes (Redirects if logged in) */}
              <Route element={<PublicOnlyRoute />}>
                <Route path="/login" element={<LoginPage />} />
                <Route path={import.meta.env.VITE_ADMIN_LOGIN_PATH || "/hidden-admin-xyz"} element={<LoginPage isAdminLogin={true} />} />
                <Route path="/register" element={<RegisterPage />} />
              </Route>

              {/* Customer Ecosystem (Public + Protected) */}
              <Route element={<CustomerLayout />}>
                {/* Public Catalog */}
                <Route path="/" element={<CatalogPage />} />
                <Route path="/product/:id" element={<ProductDetailsPage />} />
                <Route path="/merchants" element={<VerifiedMerchantsPage />} />
                <Route path="/merchant-profile/:id" element={<MerchantProfilePage />} />
                <Route path="/auctions" element={<AuctionsPage />} />

                {/* Protected Customer Features */}
                <Route element={<ProtectedRoute allowedRole="customer" />}>
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/escrow" element={<EscrowStatus />} />
                  <Route path="/auctions/:id" element={<LiveAuctions />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/profile/orders" element={<AllOrdersPage />} />
                  <Route path="/profile/bids" element={<AllBidsPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                </Route>
                
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
                <Route path="/merchant/products/new" element={<MerchantProductForm />} />
                <Route path="/merchant/products/:id/edit" element={<MerchantProductForm />} />
                <Route path="/merchant/finances" element={<MerchantFinances />} />
              </Route>

              {/* Admin Ecosystem */}
              <Route 
                element={
                  <ProtectedRoute allowedRole="admin">
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/users" element={<AdminUsers />} />
                <Route path="/admin/orders" element={<AdminOrders />} />
                <Route path="/admin/products" element={<AdminProducts />} />
                <Route path="/admin/auctions" element={<AdminAuctions />} />
              </Route>

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
