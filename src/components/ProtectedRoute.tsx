// src/components/ProtectedRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('customer' | 'admin')[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const isAdminLoggedIn = localStorage.getItem('isAdminLoggedIn') === 'true';
  const isCustomerLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

  // Jika tidak ada role spesifik, cukup cek login (customer atau admin)
  if (!allowedRoles || allowedRoles.length === 0) {
    if (!isCustomerLoggedIn && !isAdminLoggedIn) {
      return <Navigate to="/login" replace />;
    }
    return <>{children}</>;
  }

  // Cek akses untuk customer
  if (allowedRoles.includes('customer') && isCustomerLoggedIn) {
    return <>{children}</>;
  }
  
  // Cek akses untuk admin
  if (allowedRoles.includes('admin') && isAdminLoggedIn) {
    return <>{children}</>;
  }

  // Jika admin login tapi mencoba akses halaman customer
  if (isAdminLoggedIn && allowedRoles.includes('customer') && !allowedRoles.includes('admin')) {
    return <Navigate to="/admin" replace />;
  }
  
  // Jika customer login tapi mencoba akses halaman admin
  if (isCustomerLoggedIn && allowedRoles.includes('admin') && !allowedRoles.includes('customer')) {
    return <Navigate to="/" replace />;
  }

  return <Navigate to="/login" replace />;
};

export default ProtectedRoute;