import NextAuth from "next-auth";
import KakaoProvider from "next-auth/providers/kakao";

const handler = NextAuth({
    providers: [
        KakaoProvider({
            clientId: process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID || "",
            clientSecret: process.env.NEXT_PUBLIC_KAKAO_CLIENT_SECRET || "",
        }),
    ],
    callbacks: {
        async jwt({ token,accout }) {
            if (account) {
                token.accessToken = areCookiesMutableInCurrentPhase.
            }
        }
    }
});

export default handler;