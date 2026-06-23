import { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user has a valid cookie session when the app loads
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await api.get("/auth/me");
        if (res.data.status === "success") {
          setUser(res.data.user);
        }
      } catch (err) {
        // Silent catch: cookie is missing or expired, meaning user is a guest
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkSession();
  }, []);

  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    if (res.data.status === "success") {
      setUser(res.data.user);
    }
    return res.data;
  };

  const logout = async () => {
    try {
      // Clear the cookie session on the server
      await api.post("/auth/logout");
    } catch (e) {
      console.error("Logout error", e);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
