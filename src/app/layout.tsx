import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Sidebar from '@/components/sidebar'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
// Import your Supabase server client creator utility
// Adjust the path based on your project structure
import { createClient } from '@/utils/supabase/server' // Example path

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Tech Blog CMS',
  description: 'Content Management System for Tech Blog',
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

  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-900 text-gray-100 min-h-screen flex flex-col`}>
        {isLoggedIn ? (
          // Layout for logged-in users
          <>
            <div className="flex flex-1">
              <Sidebar />
              <div className="flex-1 flex flex-col">
                <Navbar />
                <main className="flex-1 p-4 md:p-6 lg:p-8">
                  {children}
                </main>
              </div>
            </div>
            <Footer />
          </>
        ) : (
          // Layout for logged-out users (only show children)
          // You might want a different container or minimal structure here
          <main className="flex-1 p-4 md:p-6 lg:p-8">
             {children}
          </main>
          // Optionally add a minimal footer for logged-out users if needed
          // <Footer />
        )}
      </body>
    </html>
  )
}

