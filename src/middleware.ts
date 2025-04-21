import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const origin = request.headers.get('origin') || 'http://localhost:5173';
    const response = NextResponse.next();

    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.headers.set('Access-Control-Allow-Credentials', 'true');

    return response;
}

export const config = {
    matcher: [
        '/auth/:path*',
        '/trainer/:path*',
        '/athlete/:path*',
        '/admin/:path*',
        '/otp/:path*',
        '/routine/:path*',
        '/routine-exercise/:path*',
        '/routineAssigned/:path*',
        '/routineHistory/:path*',
        '/category/:path*',
        '/exercise/:path*',
        '/docs/:path*',
        '/send-otp/:path*',
        '/test/:path*',
    ],
};
