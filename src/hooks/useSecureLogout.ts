"use client";

import { useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export function useSecureLogout() {
  const { signOut } = useClerk();
  const router = useRouter();

  const secureSignOut = async () => {
    try {
      // Clear browser history to prevent back navigation
      if (typeof window !== 'undefined') {
        // Clear session storage and local storage
        sessionStorage.clear();
        
        // Clear specific localStorage items that might contain sensitive data
        const keysToRemove = [
          'custom-theme',
          'sidebar_state',
          'clerk-db-jwt',
        ];
        
        keysToRemove.forEach(key => {
          localStorage.removeItem(key);
        });
        
        // Clear any cached data
        if ('caches' in window) {
          try {
            const cacheNames = await caches.keys();
            await Promise.all(
              cacheNames.map(cacheName => caches.delete(cacheName))
            );
          } catch (error) {
            console.warn('Failed to clear caches:', error);
          }
        }
        
        // Clear browser history by replacing current state
        window.history.replaceState(null, '', '/');
        
        // Disable back button functionality temporarily
        const preventBack = () => {
          window.history.pushState(null, '', window.location.href);
        };
        
        window.addEventListener('popstate', preventBack);
        
        // Remove the event listener after a delay
        setTimeout(() => {
          window.removeEventListener('popstate', preventBack);
        }, 2000);
      }
      
      // Sign out with Clerk
      await signOut({ redirectUrl: "/" });
      
      // Force a complete page reload to ensure all state is cleared
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          window.location.replace('/');
        }
      }, 100);
      
    } catch (error) {
      console.error('Error during secure sign out:', error);
      
      // Fallback: force navigation to home page
      if (typeof window !== 'undefined') {
        window.location.replace('/');
      }
    }
  };

  return { secureSignOut };
} 