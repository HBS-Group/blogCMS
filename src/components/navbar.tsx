'use client'; // Add this line to make it a client component

import {  User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"; // Import Dropdown components
import { createClient } from '@/utils/supabase/client';  // Import Supabase client helper
import { useEffect, useState } from 'react'; // Import React hooks
import { useRouter } from 'next/navigation'; // Import router for redirection

export default function Navbar() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUserEmail(session.user.email ?? null);
      }
    };
    getUser();

    // Optional: Listen for auth changes if needed
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUserEmail(session?.user.email ?? null);
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUserEmail(null); // Clear email state
    router.push('/login'); // Redirect to login page after sign out
    router.refresh(); // Refresh server components
  };

  return (
    <header className="bg-gray-900 border-b border-gray-800/50 p-4 backdrop-blur-sm sticky top-0 z-10"> {/* Added sticky positioning */}
      <div className="flex items-center justify-end"> {/* Changed justify-between to justify-end */}
        {/* Removed the empty div */}
        <div className="flex items-center gap-4">

          {/* User Dropdown Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-indigo-400 hover:text-indigo-300 hover:bg-gray-800/50 rounded-full" // Made it round
                title="User Menu" // Added title
              >
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-gray-800 border-gray-700 text-gray-200">
              {userEmail ? (
                <>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">Signed in as</p>
                      <p className="text-xs leading-none text-gray-400 truncate">
                        {userEmail}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-gray-700" />
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="text-red-400 hover:!bg-red-900/50 hover:!text-red-300 cursor-pointer focus:!bg-red-900/50 focus:!text-red-300"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </>
              ) : (
                <DropdownMenuLabel className="text-gray-400">Not signed in</DropdownMenuLabel>
                // Optionally add a Sign In link here if needed
                // <DropdownMenuItem onClick={() => router.push('/login')}>Sign In</DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}