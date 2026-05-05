'use client';

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/store';
import { useAuth } from '@/providers/AuthProvider';
import { login } from '@/lib/keycloak';
import { useRouter, usePathname } from 'next/navigation';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore();
  const { initialized } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Wait until Keycloak is fully initialized
    if (!initialized) return;

    if (!isAuthenticated) {
      // Not authenticated, save current path and trigger login
      sessionStorage.setItem('redirectAfterLogin', pathname);
      login();
    } else {
      // Authenticated, check roles if provided
      if (allowedRoles && allowedRoles.length > 0) {
        const hasRole = allowedRoles.some(role => user?.roles.includes(role));
        if (!hasRole) {
          // User doesn't have required role, redirect to a safe page (e.g., home or an unauthorized page)
          console.warn(`User lacks required roles. Required: ${allowedRoles.join(', ')}. Has: ${user?.roles.join(', ')}`);
          router.replace('/');
          return;
        }
      }
      setIsChecking(false);
    }
  }, [initialized, isAuthenticated, user, allowedRoles, router, pathname]);

  // Show nothing or a loading spinner while checking auth status
  if (!initialized || isChecking) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <p className="mt-4 text-sm font-semibold text-gray-500 uppercase tracking-widest animate-pulse">Verifying Access...</p>
      </div>
    );
  }

  return <>{children}</>;
}
