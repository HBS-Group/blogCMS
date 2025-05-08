
import { createClient } from '@/utils/supabase/server';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import Link from 'next/link';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { revalidatePath } from 'next/cache';

export default async function CategoriesPage() {
  const supabase = await createClient();
  const { data: categories } = await supabase.from('blog_categories').select('*');

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <Card className="mb-6 bg-gray-900/80 border-gray-800 backdrop-blur-sm">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                Categories Management
              </CardTitle>
              <CardDescription className="text-gray-400/90">
                Manage all your blog categories
              </CardDescription>
            </div>
            <Button asChild className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-lg hover:shadow-indigo-500/20 transition-all">
              <Link href="/dashboard/categories/create">
                <PlusCircle className="mr-2 h-4 w-4" /> New Category
              </Link>
            </Button>
          </div>
        </CardHeader>
      </Card>

      <Card className="bg-gray-900/80 border-gray-800 backdrop-blur-sm">
        <CardContent className="p-0">
          <Table>
            <TableCaption className="text-gray-400/90">
              A list of your blog categories
            </TableCaption>
            <TableHeader>
              <TableRow className="bg-gray-800/60 hover:bg-transparent">
                <TableHead className="w-[300px] text-indigo-300 font-medium">Name</TableHead>
                <TableHead className="text-indigo-300 font-medium">Created At</TableHead>
                <TableHead className="text-right text-indigo-300 font-medium">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories?.map((category) => (
                <TableRow key={category.id} className="hover:bg-gray-800/40 border-gray-800 transition-colors">
                  <TableCell className="font-medium text-gray-100">
                    {category.name}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-indigo-400/80">
                      {new Date(category.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button variant="ghost" size="sm" asChild title="Edit Category" className="text-indigo-400 hover:text-indigo-300">
                        <Link href={`/dashboard/categories/${category.id}/edit`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <form action={async () => {
                        'use server';
                        const supabase = await createClient();
                        await supabase.from('blog_categories').delete().eq('id', category.id);
                        revalidatePath('/dashboard/categories');
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
        </CardContent>
      </Card>
    </div>
  );
}