// app/unauthorized/page.tsx
'use client'; // Can be a client or server component

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function UnauthorizedPage() {
  const searchParams = useSearchParams();
  const message = searchParams.get('message');

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 text-white flex items-center justify-center p-4 md:p-6 lg:p-8">
      <div className="container mx-auto max-w-md">
        <div className="bg-gray-900/70 border-gray-800 backdrop-blur-sm shadow-xl rounded-lg p-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent mb-6">
            Access Denied
          </h1>
          <p className="text-gray-300 text-lg mb-8">
            {message || 'You do not have the necessary permissions to view this page.'}
          </p>
          <Link
            href="/"
            className="inline-block px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-semibold rounded-lg shadow-md transition-transform transform hover:scale-105"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}