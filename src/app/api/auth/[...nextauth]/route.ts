import NextAuth from 'next-auth';
import AzureADProvider from 'next-auth/providers/azure-ad';
import CredentialsProvider from 'next-auth/providers/credentials';

const handler = NextAuth({
    providers: [
        AzureADProvider({
            clientId: process.env.AZURE_AD_CLIENT_ID!,
            clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
            tenantId: process.env.AZURE_AD_TENANT_ID!,
        }),
        CredentialsProvider({
            name: 'Password',
            credentials: {
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (credentials?.password === 'nesr2026') {
                    return { id: '1', name: 'Admin', email: 'admin@nesr.com' };
                }
                return null;
            },
        }),
    ],
    pages: {
        signIn: '/login',
    },
    session: {
        strategy: 'jwt',
    },
    callbacks: {
        async jwt({ token, profile }) {
            if (profile) {
                // Azure AD sends jobTitle in the OIDC id_token claims
                const p = profile as Record<string, unknown>;
                token.jobTitle =
                    (p.jobTitle as string) ??
                    (p.job_title as string) ??
                    (p.title as string) ??
                    undefined;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.jobTitle = token.jobTitle as string | undefined;
            }
            return session;
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
