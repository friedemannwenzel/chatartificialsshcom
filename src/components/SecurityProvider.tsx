"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

interface SecurityProviderProps {
  children: React.ReactNode;
}

export function SecurityProvider({ children }: SecurityProviderProps) {
  const { isLoaded, userId } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoaded) return;

    const isProtectedRoute = [
      '/c',
      '/settings'
    ].some(route => pathname.startsWith(route));

    // If user is not authenticated and trying to access protected route
    if (!userId && isProtectedRoute) {
      router.replace('/sign-in');
      return;
    }

    // If user is authenticated and on sign-in page, redirect to home
    if (userId && pathname.startsWith('/sign-in')) {
      router.replace('/');
      return;
    }

    // Prevent back navigation to protected pages after logout
    const handlePopState = (event: PopStateEvent) => {
      if (!userId && isProtectedRoute) {
        event.preventDefault();
        window.history.pushState(null, '', '/');
        router.replace('/');
      }
    };

    // Add security headers via meta tags for client-side enforcement
    const addSecurityMeta = () => {
      if (isProtectedRoute && typeof document !== 'undefined') {
        // Remove existing security meta tags
        const existingMeta = document.querySelectorAll('meta[name^="security-"]');
        existingMeta.forEach(meta => meta.remove());

        // Add cache control meta tag
        const cacheControlMeta = document.createElement('meta');
        cacheControlMeta.setAttribute('http-equiv', 'Cache-Control');
        cacheControlMeta.setAttribute('content', 'no-cache, no-store, must-revalidate');
        cacheControlMeta.setAttribute('name', 'security-cache');
        document.head.appendChild(cacheControlMeta);

        // Add pragma meta tag
        const pragmaMeta = document.createElement('meta');
        pragmaMeta.setAttribute('http-equiv', 'Pragma');
        pragmaMeta.setAttribute('content', 'no-cache');
        pragmaMeta.setAttribute('name', 'security-pragma');
        document.head.appendChild(pragmaMeta);

        // Add expires meta tag
        const expiresMeta = document.createElement('meta');
        expiresMeta.setAttribute('http-equiv', 'Expires');
        expiresMeta.setAttribute('content', '0');
        expiresMeta.setAttribute('name', 'security-expires');
        document.head.appendChild(expiresMeta);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('popstate', handlePopState);
      addSecurityMeta();

      return () => {
        window.removeEventListener('popstate', handlePopState);
      };
    }
  }, [isLoaded, userId, pathname, router]);

  // Show loading state while auth is loading
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
} 