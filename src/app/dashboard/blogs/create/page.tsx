// app/dashboard/blogs/create/page.tsx
import { createClient } from '@/utils/supabase/server';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, Link as LinkIcon, Plus } from 'lucide-react';
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { createBlogPostAction } from '@/app/actions/createBlog';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export default async function BlogCreatePage() {
  const supabase = await createClient();

  const [
    { data: categories, error: catError },
    { data: tags, error: tagError },
    { data: skills, error: skillError }
  ] = await Promise.all([
    supabase.from('blog_categories').select('id, name').order('name', { ascending: true }),
    supabase.from('blog_tags').select('id, name').order('name', { ascending: true }),
    supabase.from('skills').select('id, name').order('name', { ascending: true })
  ]);

  // Basic error logging
  if (catError) console.error("Error fetching categories:", catError.message);
  if (tagError) console.error("Error fetching tags:", tagError.message);
  if (skillError) console.error("Error fetching skills:", skillError.message);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Create New Post</h1>
          <p className="text-gray-400/90 mt-1">Share your knowledge with the community</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button variant="outline" className="w-full md:w-auto bg-gray-800/60 border-gray-700 text-gray-300 hover:text-indigo-300 hover:bg-gray-800/80">
            <Plus className="mr-2 h-4 w-4" /> Save as Draft
          </Button>
          <Button type="submit" form="blog-form" className="w-full md:w-auto bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-lg hover:shadow-indigo-500/20 transition-all">
            <Save className="mr-2 h-4 w-4" /> Publish Post
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Column */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-gray-900/80 border-gray-800 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Post Content</CardTitle>
            </CardHeader>
            <CardContent>
              <form id="blog-form" action={createBlogPostAction} className="space-y-6">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-gray-300">
                    Title <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    name="title"
                    required
                    minLength={5}
                    maxLength={150}
                    placeholder="Catchy title that grabs attention"
                    className="text-lg py-3 bg-gray-800/60 border-gray-700 text-white focus-visible:ring-2 focus-visible:ring-indigo-500"
                  />
                </div>

                {/* Excerpt */}
                <div className="space-y-2">
                  <Label htmlFor="excerpt" className="text-gray-300">
                    Excerpt
                    <span className="text-xs text-gray-400/90 ml-2">(Optional preview text)</span>
                  </Label>
                  <Textarea
                    id="excerpt"
                    name="excerpt"
                    maxLength={300}
                    placeholder="Brief summary of your post (appears in listings and social shares)"
                    rows={3}
                    className="bg-gray-800/60 border-gray-700 text-white focus-visible:ring-2 focus-visible:ring-indigo-500"
                  />
                </div>

                {/* Content */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="content" className="text-gray-300">
                      Content <span className="text-red-500">*</span>
                    </Label>
                    <Badge variant="outline" className="text-xs bg-gray-800/60 text-indigo-300 border-indigo-800/50">
                      Markdown Supported
                    </Badge>
                  </div>
                  <Textarea
                    id="content"
                    name="content"
                    required
                    minLength={50}
                    className="min-h-[400px] bg-gray-800/60 border-gray-700 text-white focus-visible:ring-2 focus-visible:ring-indigo-500"
                    placeholder="Write your amazing content here..."
                  />
                </div>

                {/* Hidden fields for form submission */}
                <input type="hidden" name="status" value="published" />
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          {/* Status Card */}
          <Card className="bg-gray-900/80 border-gray-800 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Publish Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-gray-300">Status</Label>
                <Select name="status" defaultValue="draft">
                  <SelectTrigger className="w-full bg-gray-800/60 border-gray-700 text-white focus-visible:ring-2 focus-visible:ring-indigo-500">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700 text-white">
                    <SelectItem value="draft" className="focus:bg-gray-700 focus:text-white">Draft</SelectItem>
                    <SelectItem value="published" className="focus:bg-gray-700 focus:text-white">Published</SelectItem>
                    <SelectItem value="archived" className="focus:bg-gray-700 focus:text-white">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="featuredImageUrl" className="text-gray-300">
                  Featured Image
                </Label>
                <div className="flex items-center gap-2">
                  <LinkIcon className="h-4 w-4 text-indigo-400" />
                  <Input
                    id="featuredImageUrl"
                    name="featuredImageUrl"
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    className="flex-grow bg-gray-800/60 border-gray-700 text-white focus-visible:ring-2 focus-visible:ring-indigo-500"
                  />
                </div>
                <p className="text-xs text-gray-400/90">
                  Recommended size: 1200x630px
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Categories, Tags, Skills */}
          <Card className="bg-gray-900/80 border-gray-800 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Post Attributes</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="categories" className="w-full">
                <TabsList className="grid grid-cols-3 bg-gray-800/60">
                  <TabsTrigger value="categories" className="data-[state=active]:bg-indigo-900/50 data-[state=active]:text-indigo-300">Categories</TabsTrigger>
                  <TabsTrigger value="tags" className="data-[state=active]:bg-indigo-900/50 data-[state=active]:text-indigo-300">Tags</TabsTrigger>
                  <TabsTrigger value="skills" className="data-[state=active]:bg-indigo-900/50 data-[state=active]:text-indigo-300">Skills</TabsTrigger>
                </TabsList>
                
                <TabsContent value="categories">
                  <ScrollArea className="h-64 rounded-md border border-gray-700 p-4 bg-gray-800/40">
                    {categories && categories.length > 0 ? (
                      <div className="space-y-3">
                        {categories.map(category => (
                          <div key={category.id} className="flex items-center gap-3">
                            <Checkbox
                              id={`category-${category.id}`}
                              name="categories"
                              value={category.id.toString()}
                              className="h-5 w-5 rounded-md border-gray-600 text-indigo-600 focus:ring-indigo-500"
                            />
                            <Label 
                              htmlFor={`category-${category.id}`} 
                              className="text-sm font-medium text-gray-300 cursor-pointer hover:text-indigo-300"
                            >
                              {category.name}
                            </Label>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400/90 text-center py-8">
                        No categories available
                      </p>
                    )}
                  </ScrollArea>
                </TabsContent>
                
                <TabsContent value="tags">
                  <ScrollArea className="h-64 rounded-md border border-gray-700 p-4 bg-gray-800/40">
                    {tags && tags.length > 0 ? (
                      <div className="space-y-3">
                        {tags.map(tag => (
                          <div key={tag.id} className="flex items-center gap-3">
                            <Checkbox
                              id={`tag-${tag.id}`}
                              name="tags"
                              value={tag.id.toString()}
                              className="h-5 w-5 rounded-md border-gray-600 text-indigo-600 focus:ring-indigo-500"
                            />
                            <Label 
                              htmlFor={`tag-${tag.id}`} 
                              className="text-sm font-medium text-gray-300 cursor-pointer hover:text-indigo-300"
                            >
                              {tag.name}
                            </Label>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400/90 text-center py-8">
                        No tags available
                      </p>
                    )}
                  </ScrollArea>
                </TabsContent>
                
                <TabsContent value="skills">
                  <ScrollArea className="h-64 rounded-md border border-gray-700 p-4 bg-gray-800/40">
                    {skills && skills.length > 0 ? (
                      <div className="space-y-3">
                        {skills.map(skill => (
                          <div key={skill.id} className="flex items-center gap-3">
                            <Checkbox
                              id={`skill-${skill.id}`}
                              name="skills"
                              value={skill.id.toString()}
                              className="h-5 w-5 rounded-md border-gray-600 text-indigo-600 focus:ring-indigo-500"
                            />
                            <Label 
                              htmlFor={`skill-${skill.id}`} 
                              className="text-sm font-medium text-gray-300 cursor-pointer hover:text-indigo-300"
                            >
                              {skill.name}
                            </Label>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400/90 text-center py-8">
                        No skills available
                      </p>
                    )}
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Action Buttons (mobile only) */}
          <div className="lg:hidden flex gap-2">
            <Button variant="outline" className="flex-1 bg-gray-800/60 border-gray-700 text-gray-300 hover:text-indigo-300 hover:bg-gray-800/80">
              <Plus className="mr-2 h-4 w-4" /> Draft
            </Button>
            <Button type="submit" form="blog-form" className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-lg hover:shadow-indigo-500/20 transition-all">
              <Save className="mr-2 h-4 w-4" /> Publish
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}