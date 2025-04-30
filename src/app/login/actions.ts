// app/login/actions.ts
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server' // Make sure this path is correct

export async function emaillogin(formData: FormData) {
  const supabase = await createClient()

  // Get email and password from FormData
  // It's crucial that the form inputs have `name="email"` and `name="password"`
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  // Basic validation server-side (optional but recommended)
  if (!email || !password) {
    return redirect('/login?message=Email+and+password+are+required');
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    console.error('Supabase Auth Error:', error); // Log server-side for debugging

    // Check specifically for email confirmation errors
    // Be slightly more robust checking the message
    if (error.message.toLowerCase().includes('email not confirmed')) {
       // Redirect with a specific flag for confirmation needed
       return redirect(`/login?message=${encodeURIComponent(error.message)}&needsConfirmation=true&email=${encodeURIComponent(email)}`)
    }

    // Handle other errors - redirect back to login with the error message
    // Ensure the message is encoded properly for the URL
    return redirect(`/login?message=${encodeURIComponent(error.message)}`);
  }

  // On successful login:
  // Revalidate the root layout and potentially other paths
  revalidatePath('/', 'layout')
  // Redirect to the home page (or dashboard)
  redirect('/')
}
export async function signOut() {
  const supabase = await createClient()

  const { error } = await supabase.auth.signOut()
  
  if (error) {
    return redirect(`/login?message=${encodeURIComponent(error.message)}&error=SignOutError`)
  }

  redirect('/login')
}
export async function createClientClient() {
  const supabase = await createClient()

  const { error } = await supabase.auth.signOut()
  
  if (error) {
    return redirect(`/login?message=${encodeURIComponent(error.message)}&error=SignOutError`)
  }

  redirect('/login')
}