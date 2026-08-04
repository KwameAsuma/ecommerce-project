import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PublicOnlyRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>Loading...</div>;
  }

  if (user) {
    let redirectPath = '/';
    if (['merchant', 'MERCHANT', 'vendor', 'VENDOR'].includes(user.role)) redirectPath = '/merchant';
    if (['admin', 'ADMIN'].includes(user.role)) redirectPath = '/admin';
    return <Navigate to={redirectPath} replace />;
  }

  return children ? children : <Outlet />;
};

export default PublicOnlyRoute;
