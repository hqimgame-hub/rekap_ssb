import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;
    console.log('Proxy captured request for:', pathname);

    // Redirect /login to /admin/login for better UX
    if (pathname === '/login') {
        return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    // Protection for /admin routes (except /admin/login)
    if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
        const authCookie = request.cookies.get('admin_auth');

        if (!authCookie || authCookie.value !== 'true') {
            const loginUrl = new URL('/admin/login', request.url);
            return NextResponse.redirect(loginUrl);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/login', '/admin/:path*', '/input-menu/:path*'],
};
