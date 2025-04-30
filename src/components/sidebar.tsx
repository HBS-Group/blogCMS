import Link from 'next/link'
import { Home, FileText, Users, Bookmark, PenSquare, CheckCheckIcon } from 'lucide-react'

export default function Sidebar() {
  return (
    <div className="w-64 bg-gray-900 border-r border-gray-800/50 p-4 hidden md:block backdrop-blur-sm">
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold tracking-tight text-indigo-400">Dashboard</h2>
          <nav className="space-y-1">
            <Link href="/dashboard" className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-300 hover:text-indigo-300 hover:bg-gray-800/50 transition-colors">
              <Home className="h-4 w-4 text-indigo-400" />
              Overview
            </Link>
            <Link href="/dashboard/blogs" className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-300 hover:text-indigo-300 hover:bg-gray-800/50 transition-colors">
              <FileText className="h-4 w-4 text-indigo-400" />
              Blog Posts
            </Link>
            <Link href="/dashboard/authors" className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-300 hover:text-indigo-300 hover:bg-gray-800/50 transition-colors">
              <Users className="h-4 w-4 text-indigo-400" />
              Authors
            </Link>
            <Link href="/dashboard/categories" className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-300 hover:text-indigo-300 hover:bg-gray-800/50 transition-colors">
              <Bookmark className="h-4 w-4 text-indigo-400" />
              Categories
            </Link>
            <Link href="/generator" className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-300 hover:text-indigo-300 hover:bg-gray-800/50 transition-colors">
            <PenSquare className="h-4 w-4 text-indigo-400" />
              Generator
            </Link>
            <Link href="/seocheck" className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-300 hover:text-indigo-300 hover:bg-gray-800/50 transition-colors">
            <CheckCheckIcon className="h-4 w-4 text-indigo-400" />
              SEO Check
            </Link>
          </nav>
        </div>
      </div>
    </div>
  )
}