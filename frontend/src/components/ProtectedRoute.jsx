import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRole }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Strict role check — admin accounts are never allowed into customer/merchant routes
  if (allowedRole) {
    const userRoleUpper = user.role?.toUpperCase();
    const allowedRoleUpper = allowedRole?.toUpperCase();
    // Map VENDOR/MERCHANT aliases to the same bucket
    const merchantRoles = ["MERCHANT", "VENDOR"];
    const allowed = userRoleUpper === allowedRoleUpper ||
      (merchantRoles.includes(userRoleUpper) && merchantRoles.includes(allowedRoleUpper));
    if (!allowed) {
      return <Navigate to="/login" replace />;
    }
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;
