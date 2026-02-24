import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
    () => NextResponse.next(),
    {
        callbacks: {
            authorized: ({ token }) => !!token,
        },
        pages: {
            signIn: '/login',
        },
    }
);

// Protect all routes EXCEPT /login, /api/auth/*, and static public files
export const config = {
    matcher: [
        '/((?!login|api/auth|_next/static|_next/image|favicon.ico|nesr-logo.jpg).*)',
    ],
};
