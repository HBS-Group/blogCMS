import { createClient } from '@/utils/supabase/server';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';


export default async function BlogEditPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  
  const { data: post, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error) {
    return <div className="p-4 text-red-500">Error loading blog post: {error.message}</div>;
  }

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/blogs">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Edit Blog Post</h1>
      </div>

      <form className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input id="title" name="title" defaultValue={post?.title} required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="content">Content</Label>
          <Input id="content" name="content" defaultValue={post?.content} required />
        </div>

        <div className="flex justify-end gap-2">
          <Button type="submit">
            <Save className="mr-2 h-4 w-4" /> Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}