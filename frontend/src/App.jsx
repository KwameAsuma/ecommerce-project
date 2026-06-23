import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext"; // <-- IMPORT THIS
import CatalogPage from "./pages/CatalogPage";
import LiveAuctions from "./pages/LiveAuctions";

function App() {
  return (
    <AuthProvider>
      {" "}
      {/* <-- WRAP THE ENTIRE ECOSYSTEM HERE */}
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/catalog" replace />} />
          <Route path="/catalog" element={<CatalogPage />} />
          <Route path="/auctions" element={<LiveAuctions />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
