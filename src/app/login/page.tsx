// app/login/page.tsx
import { Suspense } from 'react';
import LoginForm from './components/Loginform'; // Import the new Client Component

// Define a simple fallback component
function LoginFormFallback() {
    // You can style this better, maybe a skeleton loader matching the form shape
    return (
        <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow dark:bg-gray-800 animate-pulse">
             <div className="text-center">
                <div className="h-8 bg-gray-300 rounded w-3/4 mx-auto dark:bg-gray-700"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2 mx-auto mt-3 dark:bg-gray-700"></div>
            </div>
             <div className="space-y-6">
                 <div className="h-10 bg-gray-300 rounded dark:bg-gray-700"></div>
                 <div className="h-10 bg-gray-300 rounded dark:bg-gray-700"></div>
                 <div className="h-10 bg-gray-400 rounded dark:bg-gray-600"></div>
             </div>
        </div>
    );
}


export default function LoginPage() {
  return (
    // Keep the overall page layout structure here
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Wrap the Client Component needing searchParams in Suspense */}
      <Suspense fallback={<LoginFormFallback />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}