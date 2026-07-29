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
    if (user.role === 'merchant' || user.role === 'MERCHANT') redirectPath = '/merchant';
    if (user.role === 'admin' || user.role === 'ADMIN') redirectPath = '/admin';
    return <Navigate to={redirectPath} replace />;
  }

  return children ? children : <Outlet />;
};

export default PublicOnlyRoute;
