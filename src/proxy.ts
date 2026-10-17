import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth/jwt";
import { isAdminPanelRole } from "@/lib/auth/permissions";
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_VALUE,
  CLIENT_ADMIN_USER,
} from "@/lib/admin-auth";

// ─── Route Protection Configuration ─────────────────────────────────────────
// Coarse gates only — fine-grained ACL is enforced in route handlers via
// requirePermission(). More specific rules should come first.

interface RouteRule {
  pathPrefix: string;
  /** When true, only super_admin may access. Otherwise any admin-panel role. */
  superAdminOnly?: boolean;
  /** When true, any authenticated user (including customer) may access. */
  anyAuthenticated?: boolean;
}

const protectedRoutes: RouteRule[] = [
  {
    pathPrefix: "/api/admin/super",
    superAdminOnly: true,
  },
  {
    pathPrefix: "/api/admin/staff",
    superAdminOnly: true,
  },
  {
    pathPrefix: "/api/admin/roles",
    superAdminOnly: true,
  },
  {
    pathPrefix: "/api/admin/audit-logs",
    superAdminOnly: true,
  },
  {
    pathPrefix: "/api/admin",
  },
  {
    pathPrefix: "/api/user",
    anyAuthenticated: true,
  },
];

const publicPaths = [
  "/api/auth/register",
  "/api/auth/login",
  "/api/auth/logout",
  "/api/auth/verify-email",
  "/api/auth/resend-verification",
  "/api/auth/send-otp",
  "/api/auth/verify-otp",
  "/api/webhooks/",
  "/admin/login",
];

function attachUserHeaders(
  request: NextRequest,
  payload: { userId: string; email: string; role: string }
) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-user-id", payload.userId);
  requestHeaders.set("x-user-email", payload.email);
  requestHeaders.set("x-user-role", payload.role);
  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

function hasClientAdminSession(request: NextRequest) {
  return request.cookies.get(ADMIN_SESSION_COOKIE)?.value === ADMIN_SESSION_VALUE;
}

function attachClientAdminHeaders(request: NextRequest) {
  return attachUserHeaders(request, {
    userId: CLIENT_ADMIN_USER.id,
    email: CLIENT_ADMIN_USER.email,
    role: CLIENT_ADMIN_USER.role,
  });
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (publicPaths.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const isPageRoute = !pathname.startsWith("/api/");

  // ── Admin page protection (temporary client-side session cookie) ───────
  if (isPageRoute && pathname.startsWith("/admin")) {
    const loginUrl = new URL("/admin/login", request.url);

    if (!hasClientAdminSession(request)) {
      return NextResponse.redirect(loginUrl);
    }

    return attachClientAdminHeaders(request);
  }

  const rule = protectedRoutes.find((r) => pathname.startsWith(r.pathPrefix));

  if (!rule) {
    return NextResponse.next();
  }

  // Temporary: admin APIs accept the client-side admin session cookie
  if (pathname.startsWith("/api/admin") && hasClientAdminSession(request)) {
    if (rule.superAdminOnly && CLIENT_ADMIN_USER.role !== "super_admin") {
      return NextResponse.json(
        { success: false, message: "Insufficient permissions" },
        { status: 403 }
      );
    }
    return attachClientAdminHeaders(request);
  }

  const token = request.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.json(
      { success: false, message: "Authentication required" },
      { status: 401 }
    );
  }

  const payload = await verifyToken(token);

  if (!payload) {
    const response = NextResponse.json(
      { success: false, message: "Invalid or expired token" },
      { status: 401 }
    );
    response.cookies.set("token", "", { maxAge: 0, path: "/" });
    return response;
  }

  if (rule.superAdminOnly && payload.role !== "super_admin") {
    return NextResponse.json(
      { success: false, message: "Insufficient permissions" },
      { status: 403 }
    );
  }

  if (!rule.anyAuthenticated && !isAdminPanelRole(payload.role)) {
    return NextResponse.json(
      { success: false, message: "Insufficient permissions" },
      { status: 403 }
    );
  }

  return attachUserHeaders(request, payload);
}

export const config = {
  matcher: ["/api/:path*", "/admin/:path*"],
};
