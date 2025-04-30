// app/login/LoginForm.tsx
'use client'; // Mark this as a Client Component

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { emaillogin } from '../actions'; // Adjust path if necessary

export default function LoginForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams(); // Hook is used here

  // Check for error messages passed via URL query parameters
  useEffect(() => {
    const errorMessage = searchParams.get('message');
    if (errorMessage) {
      setError(decodeURIComponent(errorMessage));
      // Optional: Clear the query params from URL without reload
      // window.history.replaceState(null, '', '/login');
    }
    const needsConfirmation = searchParams.get('needsConfirmation');
    if (needsConfirmation === 'true') {
        const emailParam = searchParams.get('email');
        console.log(`Email confirmation needed for: ${emailParam}`);
        // Set a specific confirmation message if desired
        setError(`Please check ${emailParam} to confirm your email address before logging in.`);
    }
  }, [searchParams]); // Dependency array is correct

  // Handle the form submission
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loading) return;

    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);

    try {
      // Server action handles redirect or throws error
      await emaillogin(formData);
      // If emaillogin throws, the catch block below will handle it.
      // If it succeeds and redirects, this component might unmount.
      // If it succeeds but doesn't redirect (unlikely for login), reset form?
    } catch (err: unknown) { // Catch potential errors thrown by the action/redirect
      console.error("Client-side wrapper catch:", err);
      // Use the error message from the server action if available
      setError(err instanceof Error ? err.message : 'An unexpected error occurred during login. Please try again.');
    } finally {
      // Only set loading to false if *not* redirecting.
      // Since redirects often happen *before* finally runs smoothly on the client,
      // it's often better to let the server action handle the full flow.
      // If an error occurred, we definitely want to stop loading.
      if (!document.hidden) { // Check if page is still visible (simple check)
          setLoading(false);
      }
    }
  };

  // Return only the form part and related elements
  return (
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
            name="email"
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
            name="password"
            type="password"
            required
            minLength={6}
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

      <div className="text-sm text-center text-gray-600 dark:text-gray-400">
        {/* Optional links can stay here */}
      </div>
    </div>
  );
}