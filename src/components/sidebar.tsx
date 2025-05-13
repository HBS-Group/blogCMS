import Link from 'next/link'
import { Home, FileText, Users, Bookmark, PenSquare, CheckCheckIcon, NotebookPen, Mail, MailWarning, MailPlus, Mailbox, BookUser } from 'lucide-react'

// Define the props interface for type safety (optional if you're not using TypeScript, but good practice)
interface SidebarProps {
  userRole?: string;
}

export default function Sidebar({ userRole }: SidebarProps) {
  return (
    <div className="w-64 bg-gray-900 border-r border-gray-800/50 p-4 hidden md:block backdrop-blur-sm">
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold tracking-tight text-indigo-400">Dashboard</h2>
          <nav className="space-y-1">
            {/* Link always visible */}
            <Link href="/" className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-300 hover:text-indigo-300 hover:bg-gray-800/50 transition-colors">
              <Home className="h-4 w-4 text-indigo-400" />
              Overview
            </Link>

            {/* Admin-specific links */}
            {userRole === 'admin' && (
              <> {/* Use a React Fragment to group these conditional links */}
                <Link href="/blogs" className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-300 hover:text-indigo-300 hover:bg-gray-800/50 transition-colors">
                  <FileText className="h-4 w-4 text-indigo-400" />
                  Blog Posts
                </Link>
                <Link href="/authors" className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-300 hover:text-indigo-300 hover:bg-gray-800/50 transition-colors">
                  <Users className="h-4 w-4 text-indigo-400" />
                  Authors
                </Link>
                <Link href="/categories" className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-300 hover:text-indigo-300 hover:bg-gray-800/50 transition-colors">
                  <Bookmark className="h-4 w-4 text-indigo-400" />
                  Categories
                </Link>
                <Link href="/generator" className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-300 hover:text-indigo-300 hover:bg-gray-800/50 transition-colors">
                  <PenSquare className="h-4 w-4 text-indigo-400" />
                  Generate Blog
                </Link>
                <Link href="/seocheck" className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-300 hover:text-indigo-300 hover:bg-gray-800/50 transition-colors">
                  <CheckCheckIcon className="h-4 w-4 text-indigo-400" />
                  SEO Check
                </Link>
                <Link href="/socialmedia" className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-300 hover:text-indigo-300 hover:bg-gray-800/50 transition-colors">
                  <NotebookPen className="h-4 w-4 text-indigo-400" />
                  Social Media Posts
                </Link>
                <Link href="/email_logs" className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-300 hover:text-indigo-300 hover:bg-gray-800/50 transition-colors">
                  <MailWarning  className="h-4 w-4 text-indigo-400" />
                  Email Logs
                </Link>
                <Link href="/mailbox" className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-300 hover:text-indigo-300 hover:bg-gray-800/50 transition-colors">
                  <Mailbox  className="h-4 w-4 text-indigo-400" />
                  Mail Box
                </Link>
              </>
            )}

            {/* Links always visible (or for other roles) */}
            <Link href="/emailgenerator" className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-300 hover:text-indigo-300 hover:bg-gray-800/50 transition-colors">
              <Mail className="h-4 w-4 text-indigo-400" />
              Generate Email
            </Link>
            <Link href="/crm" className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-300 hover:text-indigo-300 hover:bg-gray-800/50 transition-colors">
              <BookUser className="h-4 w-4 text-indigo-400" />
              Generate Email
            </Link>
            <Link href="/sendEmail" className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-300 hover:text-indigo-300 hover:bg-gray-800/50 transition-colors">
              <MailPlus className="h-4 w-4 text-indigo-400" />
              Send Email
            </Link>
          </nav>
        </div>
      </div>
    </div>
  )
}