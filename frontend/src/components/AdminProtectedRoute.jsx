import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingOverlay from './LoadingOverlay';

const AdminProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingOverlay message="Verifying Admin Security Gate..." />;
  }

  // Strictly check if user is authenticated and possesses the ADMIN role
  if (!user || (user.role?.toUpperCase() !== 'ADMIN' && user.role !== 'admin')) {
    return <Navigate to="/" replace />;
  }

  return children ? children : <Outlet />;
};

export default AdminProtectedRoute;
