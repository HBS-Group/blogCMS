import { Bell, Search, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function Navbar() {
  return (
    <header className="bg-gray-900 border-b border-gray-800/50 p-4 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-400" />
          <Input
            type="search"
            placeholder="Search..."
            className="pl-10 bg-gray-800/50 border-gray-700 focus:border-indigo-500 focus:ring-indigo-500/30"
          />
        </div>
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-indigo-400 hover:text-indigo-300 hover:bg-gray-800/50"
          >
            <Bell className="h-5 w-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-indigo-400 hover:text-indigo-300 hover:bg-gray-800/50"
          >
            <User className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  )
}