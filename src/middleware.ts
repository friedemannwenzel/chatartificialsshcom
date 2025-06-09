import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
]);

const isProtectedRoute = createRouteMatcher([
  '/c(.*)',
  '/settings(.*)',
  '/api/chat(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();
  const url = req.nextUrl.clone();

  // If user is not authenticated and trying to access protected route
  if (!userId && isProtectedRoute(req)) {
    const authResult = await auth();
    return authResult.redirectToSignIn();
  }

  // If user is authenticated and trying to access sign-in page, redirect to home
  if (userId && req.nextUrl.pathname.startsWith('/sign-in')) {
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  // Add security headers to prevent caching of protected pages
  if (isProtectedRoute(req) || !isPublicRoute(req)) {
    const response = NextResponse.next();
    
    // Prevent caching of protected pages
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate, private');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    // Additional security headers
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    return response;
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};