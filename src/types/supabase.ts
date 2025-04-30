export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      blog_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      blog_post_categories: {
        Row: {
          blog_post_id: string
          category_id: string
          created_at: string
        }
        Insert: {
          blog_post_id: string
          category_id: string
          created_at?: string
        }
        Update: {
          blog_post_id?: string
          category_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_post_categories_blog_post_id_fkey"
            columns: ["blog_post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_post_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "blog_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_post_skills: {
        Row: {
          blog_post_id: string
          created_at: string
          skill_id: string
        }
        Insert: {
          blog_post_id: string
          created_at?: string
          skill_id: string
        }
        Update: {
          blog_post_id?: string
          created_at?: string
          skill_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_post_skills_blog_post_id_fkey"
            columns: ["blog_post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_post_skills_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_post_tags: {
        Row: {
          blog_post_id: string
          created_at: string
          tag_id: string
        }
        Insert: {
          blog_post_id: string
          created_at?: string
          tag_id: string
        }
        Update: {
          blog_post_id?: string
          created_at?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_post_tags_blog_post_id_fkey"
            columns: ["blog_post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_post_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "blog_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_posts: {
        Row: {
          author_id: string
          content: string
          created_at: string
          excerpt: string | null
          featured_image_path: string | null
          id: string
          published_at: string | null
          slug: string
          status: string
          title: string
          updated_at: string | null
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          excerpt?: string | null
          featured_image_path?: string | null
          id?: string
          published_at?: string | null
          slug: string
          status?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          excerpt?: string | null
          featured_image_path?: string | null
          id?: string
          published_at?: string | null
          slug?: string
          status?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blog_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "freelancers"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_tags: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      freelancer_skills: {
        Row: {
          freelancer_id: string
          skill_id: string
        }
        Insert: {
          freelancer_id: string
          skill_id: string
        }
        Update: {
          freelancer_id?: string
          skill_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "freelancer_skills_freelancer_id_fkey"
            columns: ["freelancer_id"]
            isOneToOne: false
            referencedRelation: "freelancers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "freelancer_skills_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
        ]
      }
      freelancer_test_answers: {
        Row: {
          created_at: string | null
          freelancer_test_id: string
          id: string
          is_correct: boolean | null
          question_id: string
          selected_option_id: string
        }
        Insert: {
          created_at?: string | null
          freelancer_test_id: string
          id?: string
          is_correct?: boolean | null
          question_id: string
          selected_option_id: string
        }
        Update: {
          created_at?: string | null
          freelancer_test_id?: string
          id?: string
          is_correct?: boolean | null
          question_id?: string
          selected_option_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "freelancer_test_answers_freelancer_test_id_fkey"
            columns: ["freelancer_test_id"]
            isOneToOne: false
            referencedRelation: "freelancer_tests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "freelancer_test_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "freelancer_test_answers_selected_option_id_fkey"
            columns: ["selected_option_id"]
            isOneToOne: false
            referencedRelation: "question_options"
            referencedColumns: ["id"]
          },
        ]
      }
      freelancer_tests: {
        Row: {
          completed_at: string | null
          duration_taken_seconds: number | null
          experience_level: string | null
          freelancer_id: string
          id: string
          score: number
          started_at: string
          test_id: string
        }
        Insert: {
          completed_at?: string | null
          duration_taken_seconds?: number | null
          experience_level?: string | null
          freelancer_id: string
          id?: string
          score: number
          started_at?: string
          test_id: string
        }
        Update: {
          completed_at?: string | null
          duration_taken_seconds?: number | null
          experience_level?: string | null
          freelancer_id?: string
          id?: string
          score?: number
          started_at?: string
          test_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "freelancer_tests_freelancer_id_fkey"
            columns: ["freelancer_id"]
            isOneToOne: false
            referencedRelation: "freelancers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "freelancer_tests_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "tests"
            referencedColumns: ["id"]
          },
        ]
      }
      freelancers: {
        Row: {
          bio: string | null
          created_at: string | null
          experience: number
          hourly_rate: number
          id: string
          image: string | null
          name: string
          portfolio_link: string | null
          role: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          bio?: string | null
          created_at?: string | null
          experience: number
          hourly_rate: number
          id?: string
          image?: string | null
          name: string
          portfolio_link?: string | null
          role?: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          bio?: string | null
          created_at?: string | null
          experience?: number
          hourly_rate?: number
          id?: string
          image?: string | null
          name?: string
          portfolio_link?: string | null
          role?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      project_skills: {
        Row: {
          created_at: string
          project_id: string
          skill_id: string
        }
        Insert: {
          created_at?: string
          project_id: string
          skill_id: string
        }
        Update: {
          created_at?: string
          project_id?: string
          skill_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_skills_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_skills_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          created_at: string
          description: string | null
          freelancer_id: string
          id: string
          image_url: string | null
          project_url: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          freelancer_id: string
          id?: string
          image_url?: string | null
          project_url?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          freelancer_id?: string
          id?: string
          image_url?: string | null
          project_url?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_freelancer_id_fkey"
            columns: ["freelancer_id"]
            isOneToOne: false
            referencedRelation: "freelancers"
            referencedColumns: ["id"]
          },
        ]
      }
      question_options: {
        Row: {
          created_at: string | null
          id: string
          is_correct: boolean
          option_text: string
          question_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_correct?: boolean
          option_text: string
          question_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_correct?: boolean
          option_text?: string
          question_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "question_options_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      questions: {
        Row: {
          created_at: string | null
          id: string
          question_text: string
          test_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          question_text: string
          test_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          question_text?: string
          test_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "questions_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "tests"
            referencedColumns: ["id"]
          },
        ]
      }
      skills: {
        Row: {
          description: string | null
          id: string
          name: string
        }
        Insert: {
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      tests: {
        Row: {
          average_completion_time_minutes: number | null
          created_at: string | null
          difficulty: string | null
          duration_minutes: number | null
          id: string
          passing_score_percentage: number | null
          skill_id: string | null
          test_name: string
        }
        Insert: {
          average_completion_time_minutes?: number | null
          created_at?: string | null
          difficulty?: string | null
          duration_minutes?: number | null
          id?: string
          passing_score_percentage?: number | null
          skill_id?: string | null
          test_name: string
        }
        Update: {
          average_completion_time_minutes?: number | null
          created_at?: string | null
          difficulty?: string | null
          duration_minutes?: number | null
          id?: string
          passing_score_percentage?: number | null
          skill_id?: string | null
          test_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "tests_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_freelancer_test_score: {
        Args: { p_attempt_id: string }
        Returns: number
      }
      get_freelancer_dashboard_tests: {
        Args: { p_freelancer_id: string }
        Returns: Json
      }
      get_latest_imperfect_freelancer_tests: {
        Args: Record<PropertyKey, never>
        Returns: {
          completed_at: string | null
          duration_taken_seconds: number | null
          experience_level: string | null
          freelancer_id: string
          id: string
          score: number
          started_at: string
          test_id: string
        }[]
      }
      get_latest_imperfect_freelancer_tests_with_details: {
        Args: Record<PropertyKey, never>
        Returns: {
          freelancer_test_id: string
          freelancer_id: string
          test_id: string
          score: number
          started_at: string
          completed_at: string
          duration_taken_seconds: number
          experience_level: string
          test_name: string
        }[]
      }
      get_latest_perfect_freelancer_tests: {
        Args: Record<PropertyKey, never>
        Returns: {
          completed_at: string | null
          duration_taken_seconds: number | null
          experience_level: string | null
          freelancer_id: string
          id: string
          score: number
          started_at: string
          test_id: string
        }[]
      }
      get_latest_perfect_freelancer_tests_with_details: {
        Args: Record<PropertyKey, never>
        Returns: {
          freelancer_test_id: string
          freelancer_id: string
          test_id: string
          score: number
          started_at: string
          completed_at: string
          duration_taken_seconds: number
          experience_level: string
          test_name: string
        }[]
      }
      get_unattended_tests_by_skill: {
        Args: { p_freelancer_id: string }
        Returns: Json
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_claims_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_own_freelancer: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_own_test_answer: {
        Args: { answer_id: string }
        Returns: boolean
      }
      is_owner: {
        Args: { table_name: string; id_column: string; id_value: unknown }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
