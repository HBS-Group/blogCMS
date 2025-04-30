import { createClient } from '@/utils/supabase/server';
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from 'next/link';
import { PlusCircle, Edit, Trash2, Eye } from 'lucide-react';
import { Tables } from '@/types/supabase'; // Import the types
import { Card, CardHeader, CardTitle, CardDescription} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { revalidatePath } from 'next/cache';
// Define the type for blog posts with author name included
type BlogPostWithAuthor = Tables<'blog_posts'> & {
  freelancers: { name: string } | null; // Assuming 'freelancers' is the related table name
};


// Dashboard page for logged-in users - Now an async Server Component
export default async function Dashboard() {
  const supabase = await createClient();

  // Fetch blog posts and join with freelancers to get author name
  const { data: posts, error } = await supabase
    .from('blog_posts')
    .select(`
      *,
      freelancers ( name )
    `)
    .order('created_at', { ascending: false }) as { data: BlogPostWithAuthor[] | null, error: unknown }; // Type assertion

  if (error) {
    console.error("Error fetching blog posts:", error);
    // Handle error display appropriately
    return <div className="p-4 text-red-500">Error loading blog posts: {String(error)}</div>;
  }

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <Card className="mb-6 bg-gray-900/80 border-gray-800 backdrop-blur-sm">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                Blog Post Management
              </CardTitle>
              <CardDescription className="text-gray-400/90">
                Manage all your tech blog content in one place
              </CardDescription>
            </div>
            <Button asChild className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-lg hover:shadow-indigo-500/20 transition-all">
              <Link href="/dashboard/blogs/create">
                <PlusCircle className="mr-2 h-4 w-4" /> Create New Post
              </Link>
            </Button>
          </div>
        </CardHeader>
      </Card>

      {posts && posts.length > 0 ? (
        <Card className="bg-gray-900/80 border-gray-800 backdrop-blur-sm">
          <Table>
            <TableCaption className="text-gray-400/90">
              A list of your recent tech blog posts
            </TableCaption>
            <TableHeader>
              <TableRow className="bg-gray-800/60 hover:bg-transparent">
                <TableHead className="w-[300px] text-indigo-300 font-medium">Title</TableHead>
                <TableHead className="text-indigo-300 font-medium">Author</TableHead>
                <TableHead className="text-indigo-300 font-medium">Status</TableHead>
                <TableHead className="text-indigo-300 font-medium">Created At</TableHead>
                <TableHead className="text-right text-indigo-300 font-medium">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.map((post) => (
                <TableRow key={post.id} className="hover:bg-gray-800/40 border-gray-800 transition-colors">
                  <TableCell className="font-medium text-gray-100">
                    <div className="flex items-center space-x-2">
                      <span className="hover:text-indigo-400 transition-colors">{post.title}</span>
                      {post.status === 'published' ? (
                        <Badge className="bg-indigo-900/30 text-indigo-400 border-indigo-800/50">
                          Live
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-gray-600 text-gray-400">
                          Draft
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2 text-white">
                      <span>{post.freelancers?.name ?? 'N/A'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={post.status === 'published' ? 'default' : 'outline'}>
                      {post.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-indigo-400/80">
                      {new Date(post.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button variant="ghost" size="sm" asChild title="View Post" className="text-indigo-400 hover:text-indigo-300">
                        <Link href={`/dashboard/blogs/${post.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="sm" asChild title="Edit Post" className="text-indigo-400 hover:text-indigo-300">
                        <Link href={`/dashboard/blogs/${post.id}/edit`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <form action={async () => {
                        'use server';
                        const supabase = await createClient();
                        await supabase.from('blog_posts').delete().eq('id', post.id);
                        revalidatePath('/dashboard/blogs');
                      }}>
                        <Button variant="ghost" size="sm" type="submit" className="text-rose-500 hover:text-rose-400">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </form>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      ) : (
        <div className="text-center text-gray-400/80 mt-10">
          No blog posts found. <Link href="/dashboard/blogs/create" className="text-emerald-400 hover:underline hover:text-emerald-300 transition-colors">Create one now!</Link>
        </div>
      )}
    </div>
  );
}