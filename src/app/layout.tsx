import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Sidebar from '@/components/sidebar'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
// Import your Supabase server client creator utility
// Adjust the path based on your project structure
import { createClient } from '@/utils/supabase/server' // Example path
import getUserRole from './actions/userRole'
import { RoleProvider } from './contexts/RoleContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Tech HBS CMS',
  description: 'Content Management System for HBS',
}

// Make the component async
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Create Supabase server client
  const supabase = createClient();
  // Fetch session
  const supabaseClient = await supabase;
  const { data: { user } } = await supabaseClient.auth.getUser();

  // Determine login status based on data existence
  const isLoggedIn = !!user;

  const role = await getUserRole(supabaseClient);
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-900 text-gray-100 min-h-screen flex flex-col`}>
      {isLoggedIn && role ? ( // Check for role as well, though it might default if not found
          // Wrap the logged-in layout with RoleProvider
          <RoleProvider role={role}>
            <>
              <div className="flex flex-1">
                <Sidebar userRole={role} /> {/* Sidebar still gets it as a prop */}
                <div className="flex-1 flex flex-col">
                  <Navbar /> {/* Navbar could now use useUserRole() if it's a Client Component */}
                  <main className="flex-1 p-4 md:p-6 lg:p-8">
                    {children} {/* Children can now use useUserRole() if they are Client Components */}
                  </main>
                </div>
              </div>
              <Footer />
            </>
          </RoleProvider>
        ) : (
          // Layout for logged-out users
          <main className="flex-1 p-4 md:p-6 lg:p-8">
             {children}
          </main>
        )}
      </body>
    </html>
  )
}

