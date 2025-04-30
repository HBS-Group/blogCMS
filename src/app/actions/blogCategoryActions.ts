'use server'

import { createClient } from '@/utils/supabase/server'


export async function fetchBlogCategoriesAction() {
  const supabase = await createClient()
  
  try {
    const { data, error } = await supabase
      .from('blog_categories')
      .select('*')
      .order('name')
    
    if (error) {
      return { success: false, error: error.message, categories: [] }
    }
    
    return { success: true, categories: data || [] }
  } catch (error) {
    console.error('Error fetching blog categories:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error fetching categories',
      categories: []
    }
  }
}