import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import Link from 'next/link';
import { PlusCircle, BookOpen, PenSquare, User } from 'lucide-react';

export default function Home() {
  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent mb-4">
          Tech Blog Generator
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          Create, manage, and publish your tech blog content with ease
        </p>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="bg-gray-800/80 border-gray-700 hover:border-emerald-500/50 transition-colors">
          <CardHeader>
            <BookOpen className="h-8 w-8 text-emerald-400 mb-4" />
            <CardTitle className="text-xl text-white">View Blog Posts</CardTitle>
            <CardDescription className="text-gray-400">
              Browse all your published and draft blog posts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700">
              <Link href="/dashboard/blogs">
                Explore Posts
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/80 border-gray-700 hover:border-teal-500/50 transition-colors">
          <CardHeader>
            <PenSquare className="h-8 w-8 text-teal-400 mb-4" />
            <CardTitle className="text-xl text-white">Create New Post</CardTitle>
            <CardDescription className="text-gray-400">
              Start writing a new tech blog post
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full bg-teal-600 hover:bg-teal-700">
              <Link href="/dashboard/blogs/create">
                <PlusCircle className="mr-2 h-4 w-4" /> New Post
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/80 border-gray-700 hover:border-purple-500/50 transition-colors">
          <CardHeader>
            <User className="h-8 w-8 text-purple-400 mb-4" />
            <CardTitle className="text-xl text-white">Manage Authors</CardTitle>
            <CardDescription className="text-gray-400">
              View and manage all blog authors
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full bg-purple-600 hover:bg-purple-700">
              <Link href="/dashboard/authors">
                Author Dashboard
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}