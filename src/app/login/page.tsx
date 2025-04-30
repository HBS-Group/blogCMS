// app/login/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation'; // Import useSearchParams
import { emaillogin } from './actions'; // Import the server action

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams(); // Hook to read URL query parameters

  // Check for error messages passed via URL query parameters on initial load or after redirect
  useEffect(() => {
    const errorMessage = searchParams.get('message');
    if (errorMessage) {
      setError(decodeURIComponent(errorMessage));
      // Optional: Clear the query params from URL without reload after reading the error
      // window.history.replaceState(null, '', '/login');
    }
    // Check if email confirmation is needed (add specific UI if desired)
    const needsConfirmation = searchParams.get('needsConfirmation');
    if (needsConfirmation === 'true') {
        const emailParam = searchParams.get('email');
        // You could set a different state here to show a specific message/link
        // like "Check your email [emailParam] to confirm your account."
        console.log(`Email confirmation needed for: ${emailParam}`);
        // Example: setError(`Please check ${emailParam} to confirm your email address before logging in.`);
    }

  }, [searchParams]); // Re-run when searchParams change

  // Handle the form submission
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Prevent default browser form submission
    if (loading) return; // Prevent multiple submissions

    setLoading(true);
    setError(null); // Clear previous errors

    const formData = new FormData(event.currentTarget);

    try {
      // Call the server action.
      // If successful, it redirects to '/'.
      // If error, it redirects back to '/login?message=...'
      // We don't need to check a return value here because redirect handles navigation.
      await emaillogin(formData);

      // If emaillogin redirects, the code below might not execute,
      // or the component will unmount/remount.
      // If emaillogin *doesn't* redirect (e.g., future change), handle it here.
      // setLoading(false); // Usually not needed due to redirect/page reload

    } catch (err) {
      // This catch block is for *unexpected* errors during the action call process
      // itself (e.g., network errors, server action crashing unexpectedly before redirecting).
      // It will NOT catch the Supabase auth errors handled by `redirect` inside the action.
      console.error("Client-side submission error:", err);
      setError('An unexpected error occurred during login. Please try again.');
      setLoading(false); // Ensure loading is stopped on unexpected client error
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow dark:bg-gray-800">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome Back</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Login to access your dashboard</p>
        </div>

        {/* Display error messages */}
        {error && (
          <div className="p-3 text-sm text-red-700 bg-red-100 rounded-md dark:bg-red-900 dark:text-red-300" role="alert">
            {error}
          </div>
        )}

        {/* The Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email
            </label>
            <input
              id="email"
              name="email" // *** Crucial: Added name attribute ***
              type="email"
              required
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="name@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Password
            </label>
            <input
              id="password"
              name="password" // *** Crucial: Added name attribute ***
              type="password"
              required
              minLength={6} // Good practice: Add minLength if Supabase requires it
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="••••••••"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </div>
        </form>

        {/* Optional: Add link to signup or password reset */}
        <div className="text-sm text-center text-gray-600 dark:text-gray-400">
          {/* Don't have an account? <a href="/signup" className="font-medium text-blue-600 hover:underline dark:text-blue-500">Sign up</a> */}
          {/* <br /> */}
          {/* <a href="/forgot-password" className="font-medium text-blue-600 hover:underline dark:text-blue-500">Forgot password?</a> */}
        </div>
      </div>
    </div>
  );
}