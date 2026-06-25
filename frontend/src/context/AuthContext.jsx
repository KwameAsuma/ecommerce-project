import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState("customer");

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await api.get("/auth/me");
        if (res.data.status === "success") {
          setUser(res.data.user);
          if (res.data.user.role) setUserRole(res.data.user.role);
        }
      } catch (err) {
        // Not logged in
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    if (res.data.status === "success") {
      setUser(res.data.user);
      if (res.data.user.role) setUserRole(res.data.user.role);
    }
    return res.data;
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (e) {
      console.error(e);
    } finally {
      setUser(null);
      setUserRole("customer");
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, userRole, setUserRole, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
