import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Sign In — Supply Chain AI',
    icons: {
        icon: '/icon.png',
    },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
