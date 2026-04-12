import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // 1. Run i18n middleware first to handle locale detection and redirection
    const response = intlMiddleware(request);

    // 2. Check for authentication on protected routes
    const token = request.cookies.get('token')?.value;

    // Strip the locale from the pathname to check against protected patterns
    // e.g. /en/dashboard -> /dashboard
    const pathnameWithoutLocale = pathname.replace(/^\/(en|ar)/, '') || '/';

    // Paths that need authentication
    const protectedPaths = ['/admin', '/dashboard', '/orders', '/inventory', '/customers', '/analytics', '/settings'];
    const isProtectedPath = protectedPaths.some(path => pathnameWithoutLocale.startsWith(path));

    if (isProtectedPath && !token) {
        // Redirect to staff-login for dashboard paths, login for admin paths
        const loginPath = pathnameWithoutLocale.startsWith('/admin') ? '/login' : '/staff-login';
        // Maintain the current locale in the redirect if possible, else default to 'en'
        const localeMatch = pathname.match(/^\/(en|ar)/);
        const locale = localeMatch ? localeMatch[1] : 'en';
        return NextResponse.redirect(new URL(`/${locale}${loginPath}`, request.url));
    }

    // Redirect already-authenticated users away from login pages
    if ((pathnameWithoutLocale === '/login' || pathnameWithoutLocale === '/staff-login') && token) {
        const localeMatch = pathname.match(/^\/(en|ar)/);
        const locale = localeMatch ? localeMatch[1] : 'en';
        
        const userRole = request.cookies.get('user_role')?.value;
        const targetPath = userRole === 'SUPER_ADMIN' ? '/admin' : '/dashboard';
        
        return NextResponse.redirect(new URL(`/${locale}${targetPath}`, request.url));
    }

    // 3. Subdomain & Custom Domain Routing Logic
    const host = request.headers.get('host') || '';
    const searchParams = request.nextUrl.searchParams.toString();
    const query = searchParams ? `?${searchParams}` : '';

    const mainDomains = ['localhost:3001', 'idarax.io', 'www.idarax.io'];
    const isMainDomain = mainDomains.some(d => host === d);

    if (!isMainDomain) {
        let identifier = '';
        
        // 1. Check if it's a subdomain of idarax.io or localhost
        if (host.endsWith('.idarax.io') || host.endsWith('.localhost:3001')) {
            const subdomain = host.split('.')[0];
            if (subdomain && !['www', 'api', 'admin', 'dashboard'].includes(subdomain.toLowerCase())) {
                identifier = subdomain;
            }
        } 
        // 2. Otherwise treat as a potential Custom Domain
        else {
            identifier = host;
        }

        if (identifier) {
            // If the path doesn't already start with /m/ or is a static asset
            if (!pathnameWithoutLocale.startsWith('/m/') && !pathname.includes('.')) {
                const localeMatch = pathname.match(/^\/(en|ar)/);
                const locale = localeMatch ? localeMatch[1] : 'en';
                
                // Rewrite to /[locale]/m/[identifier]/[rest]
                const newPath = `/${locale}/m/${identifier}${pathnameWithoutLocale}${query}`;
                console.log(`Routing detected: ${host} -> identifier: ${identifier}. Rewriting to ${newPath}`);
                return NextResponse.rewrite(new URL(newPath, request.url));
            }
        }
    }

    return response;
}

export const config = {
    // Match all pathnames except for
    // - API routes
    // - Static files
    // - Image optimization
    // - Favicon
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
