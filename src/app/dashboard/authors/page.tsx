import { createClient } from '@/utils/supabase/server';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from 'next/link';
import { Edit, Trash2, User, PlusCircle } from 'lucide-react';

export default async function AuthorsPage() {
  const supabase = await createClient();
  const { data: authors } = await supabase.from('freelancers').select('*').eq('role', 'admin');

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <Card className="mb-6 bg-gray-900/80 border-gray-800 backdrop-blur-sm">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                Authors Management
              </CardTitle>
              <CardDescription className="text-gray-400/90">
                Manage all blog authors with admin privileges
              </CardDescription>
            </div>
            <Button asChild className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-lg hover:shadow-indigo-500/20 transition-all">
              <Link href="/dashboard/authors/create">
                <PlusCircle className="mr-2 h-4 w-4" /> New Author
              </Link>
            </Button>
          </div>
        </CardHeader>
      </Card>

      <Card className="bg-gray-900/80 border-gray-800 backdrop-blur-sm">
        <div className="divide-y divide-gray-800">
          {authors?.map(author => (
            <div key={author.id} className="p-4 flex items-center justify-between hover:bg-gray-800/40 transition-colors">
              <div className="flex items-center space-x-4">
                <div className="bg-indigo-900/20 p-3 rounded-full">
                  <User className="h-5 w-5 text-indigo-400" />
                </div>
                <div>
                  <h3 className="font-medium text-white">{author.name}</h3>
                  <p className="text-sm text-indigo-400/80">{author.email}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button variant="ghost" size="sm" asChild title="Edit Author" className="text-indigo-400 hover:text-indigo-300">
                  <Link href={`/dashboard/authors/${author.id}/edit`}>
                    <Edit className="h-4 w-4" />
                  </Link>
                </Button>
                <form action={async () => {
                  'use server';
                  const supabase = await createClient();
                  await supabase.from('freelancers').delete().eq('id', author.id);
                }}>
                  <Button variant="ghost" size="sm" type="submit" className="text-rose-500 hover:text-rose-400">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}