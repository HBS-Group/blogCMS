import { createClient } from '@/utils/supabase/server';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import Link from 'next/link';
import { PlusCircle, BarChart2, Clock, Users, FileText } from 'lucide-react';

import { Badge } from "@/components/ui/badge";



export default async function AdminDashboard() {
  const supabase = await createClient();

    // Fetch blog posts and stats
  const { data: posts } = await supabase
  .from('blog_posts')
  .select(`*, freelancers ( name )`)
  .order('created_at', { ascending: false });

const { count: totalPosts } = await supabase
  .from('blog_posts')
  .select('*', { count: 'exact' });

const { count: publishedPosts } = await supabase
  .from('blog_posts')
  .select('*', { count: 'exact' })
  .eq('status', 'published');

const { data: recentPosts } = await supabase
  .from('blog_posts')
  .select('*')
  .order('created_at', { ascending: false })
  .limit(5);

  

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-indigo-900/50 to-indigo-800/50 border-indigo-800/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-indigo-300">
              Total Posts
            </CardTitle>
            <FileText className="h-4 w-4 text-indigo-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{totalPosts || 0}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-900/50 to-emerald-800/50 border-emerald-800/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-emerald-300">
              Published
            </CardTitle>
            <BarChart2 className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{publishedPosts || 0}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-900/50 to-purple-800/50 border-purple-800/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-300">
              Recent Activity
            </CardTitle>
            <Clock className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {recentPosts?.[0] ? new Date(recentPosts[0].created_at).toLocaleDateString() : 'N/A'}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-900/50 to-amber-800/50 border-amber-800/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-amber-300">
              Active Authors
            </CardTitle>
            <Users className="h-4 w-4 text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {new Set(posts?.map(p => p.author_id)).size || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Posts Table */}
      <Card className="bg-gray-900/80 border-gray-800 backdrop-blur-sm">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-xl font-bold text-white">
                Recent Blog Posts
              </CardTitle>
              <CardDescription className="text-gray-400/90">
                Latest 5 posts with their current status
              </CardDescription>
            </div>
            <Button asChild className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-lg hover:shadow-indigo-500/20 transition-all">
              <Link href="/dashboard/blogs/create">
                <PlusCircle className="mr-2 h-4 w-4" /> Create New Post
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentPosts?.map(post => (
              <div key={post.id} className="flex items-center justify-between p-4 bg-gray-800/40 rounded-lg hover:bg-gray-800/60 transition-colors">
                <div>
                  <h3 className="font-medium text-white">{post.title}</h3>
                  <p className="text-sm text-indigo-400/80">
                    {post.freelancers?.name || 'Unknown author'} • {new Date(post.created_at).toLocaleDateString()}
                  </p>
                </div>
                <Badge variant={post.status === 'published' ? 'default' : 'outline'} className={post.status === 'published' ? 'bg-emerald-900/30 text-emerald-400 border-emerald-800/50' : 'border-gray-600 text-gray-400'}>
                  {post.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}