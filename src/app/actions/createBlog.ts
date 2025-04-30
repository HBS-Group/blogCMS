import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

// --- Server Action to Create Post ---
export async function createBlogPostAction(formData: FormData) {
    'use server';
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        console.error("User not authenticated.");
        return redirect('/login?message=Please login to create a post');
    }

    // --- 1. Extract Form Data ---
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const excerpt = formData.get('excerpt') as string || null;
    const status = formData.get('status') as string;

    // ***** MODIFIED: Get image URL instead of file *****
    const featuredImageUrl = formData.get('featuredImageUrl') as string || null;

    // Get arrays of selected IDs (UUIDs)
    const categoryIds = formData.getAll('categories') as string[];
    const tagIds = formData.getAll('tags') as string[];
    const skillIds = formData.getAll('skills') as string[];

    // Basic validation
    if (!title || !content || !status) {
      console.error('Missing required fields: Title, Content, Status');
      return;
    }

    // --- 2. Generate Slug ---
    const slug = generateSlug(title);

    // --- 4. Prepare Parameters for SQL Function ---
    const functionParams = {
      p_title: title,
      p_slug: slug,
      p_content: content,
      p_excerpt: excerpt,
      // ***** MODIFIED: Pass the URL string *****
      p_featured_image_path: featuredImageUrl,
      p_status: status,
      p_category_ids: categoryIds,
      p_tag_ids: tagIds,
      p_skill_ids: skillIds,
    };

    console.log("Calling create_blog_post with params:", functionParams);

    // --- 5. Call the SQL Function ---
    const { data: newPostData, error: rpcError } = await supabase.rpc(
      'create_blog_post',
      functionParams
    );

    // --- 6. Handle Response ---
    if (rpcError) {
      console.error('Error calling create_blog_post function:', rpcError);
      // Handle errors as before...
       if (rpcError.message.includes('duplicate key value violates unique constraint') && rpcError.message.includes('blog_posts_slug_key')) {
          console.error("Slug conflict:", slug);
       }
      return;
    }

    if (!newPostData) {
        console.error('RPC call succeeded but returned no data (new post ID).');
        return;
    }

    const newPostId = newPostData;
    console.log('Successfully created blog post with ID:', newPostId);

    // --- 7. Redirect ---
    // revalidatePath('/dashboard/blogs'); // Optional: revalidate if needed
    redirect(`/dashboard/blogs?message=Post created successfully`);
    // Or redirect to edit: redirect(`/dashboard/blogs/${newPostId}/edit`);

}
function generateSlug(text: string): string {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  }