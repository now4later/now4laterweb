import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const role = req.nextauth.token?.role;

    if (pathname.startsWith("/admin") && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/portal", req.url));
    }
    return NextResponse.next();
  },
  {
    callbacks: {
      // Just require *some* logged-in user here; the role check above
      // handles the admin-only restriction.
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: ["/portal/:path*", "/admin/:path*"],
};
