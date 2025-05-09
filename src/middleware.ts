// src/middleware.ts or app/middleware.ts
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { SupabaseClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

// (getUserRoleFromDb function as defined above, using 'freelancers' table)
async function getUserRoleFromDb(
  supabaseClient: SupabaseClient,
  userId: string
): Promise<string | null> {
  if (!userId) return null;
  try {
    const { data: freelancerProfile, error } = await supabaseClient
      .from("freelancers")
      .select("role")
      .eq("id", userId)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error(
        "Middleware: Error fetching user role from freelancers:",
        error.message
      );
      return null;
    }
    return freelancerProfile?.role || null;
  } catch (e: unknown) {
    console.error("Middleware: Exception fetching role:", (e as Error).message);
    return null;
  }
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: "", ...options });
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          response.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { pathname } = request.nextUrl;

  // --- Configuration for Access Control ---
  const allowedPublicPaths = ["/login", "/auth/callback"]; // Add any other public paths
  const generalAccessRoles = ["admin", "marketing"]; // Roles that can access the app generally

  // Paths from which 'marketing' role should be excluded
  const marketerExcludedPaths = [
    "/blogs",
    "/authors",
    "/categories",
    "/generator",
    "/seocheck",
    "/socialmedia",
    "/email_logs",
  ];

  // --- 1. Handle Public Paths ---
  if (allowedPublicPaths.some((p) => pathname.startsWith(p))) {
    return response; // Allow access to public paths
  }

  // --- 2. Handle Unauthenticated Users ---
  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("message", "Please log in to access this page.");
    return NextResponse.redirect(url);
  }

  // --- 3. Fetch User Role ---
  const userRole = await getUserRoleFromDb(supabase, user.id);

  // --- 4. General Access Role Check ---
  if (!userRole || !generalAccessRoles.includes(userRole)) {
    // User is logged in but doesn't have a generally permitted role
    console.warn(
      `User ${user.id} with role '${userRole}' denied general access to ${pathname}.`
    );
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login"; // Or an '/unauthorized' page
    loginUrl.searchParams.set("error", "unauthorized_role");
    loginUrl.searchParams.set(
      "message",
      "You do not have permission to access this application."
    );
    // Optional: Sign out if their role isn't sufficient for any part of the app
    // await supabase.auth.signOut();
    return NextResponse.redirect(loginUrl);
  }

  // --- 5. Specific Role/Path Restrictions (e.g., for 'marketing' role) ---
  if (
    userRole === "marketing" &&
    marketerExcludedPaths.some((p) => pathname.startsWith(p))
  ) {
    console.warn(
      `Marketing user ${user.id} denied access to restricted path ${pathname}.`
    );
    // Redirect marketers away from these specific pages
    const unauthorizedUrl = request.nextUrl.clone();
    unauthorizedUrl.pathname = '/'; // Create an "Unauthorized" page
    // Or redirect to their dashboard or another safe page:
    // unauthorizedUrl.pathname = '/dashboard';
    unauthorizedUrl.searchParams.set(
      "message",
      "You do not have permission to access this specific page."
    );
    return NextResponse.redirect(unauthorizedUrl);
  }

  // --- 6. User is Authenticated and Authorized ---
  // If all checks pass, allow the request
  return response;
}
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
