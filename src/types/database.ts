export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      follows: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "follows_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follows_following_id_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      hardware_items: {
        Row: {
          created_at: string
          id: string
          owner_id: string
          position: number
          text: string
        }
        Insert: {
          created_at?: string
          id?: string
          owner_id: string
          position?: number
          text: string
        }
        Update: {
          created_at?: string
          id?: string
          owner_id?: string
          position?: number
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "hardware_items_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      logbook_entries: {
        Row: {
          body: string
          created_at: string
          id: string
          owner_id: string
          title: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          owner_id: string
          title: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          owner_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "logbook_entries_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      moment_likes: {
        Row: {
          created_at: string
          moment_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          moment_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          moment_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "moment_likes_moment_id_fkey"
            columns: ["moment_id"]
            isOneToOne: false
            referencedRelation: "moments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "moment_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      moment_shares: {
        Row: {
          created_at: string
          moment_id: string
          shared_by: string
          shared_with: string
        }
        Insert: {
          created_at?: string
          moment_id: string
          shared_by: string
          shared_with: string
        }
        Update: {
          created_at?: string
          moment_id?: string
          shared_by?: string
          shared_with?: string
        }
        Relationships: [
          {
            foreignKeyName: "moment_shares_moment_id_fkey"
            columns: ["moment_id"]
            isOneToOne: false
            referencedRelation: "moments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "moment_shares_shared_by_fkey"
            columns: ["shared_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "moment_shares_shared_with_fkey"
            columns: ["shared_with"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      moments: {
        Row: {
          caption: string | null
          created_at: string
          id: string
          owner_id: string
          photo_url: string | null
        }
        Insert: {
          caption?: string | null
          created_at?: string
          id?: string
          owner_id: string
          photo_url?: string | null
        }
        Update: {
          caption?: string | null
          created_at?: string
          id?: string
          owner_id?: string
          photo_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "moments_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          actor_id: string
          created_at: string
          entity_id: string | null
          id: string
          kind: string
          read_at: string | null
          recipient_id: string
          subject: string | null
        }
        Insert: {
          actor_id: string
          created_at?: string
          entity_id?: string | null
          id?: string
          kind: string
          read_at?: string | null
          recipient_id: string
          subject?: string | null
        }
        Update: {
          actor_id?: string
          created_at?: string
          entity_id?: string | null
          id?: string
          kind?: string
          read_at?: string | null
          recipient_id?: string
          subject?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          archived_at: string | null
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          favorite_techniques: string[]
          id: string
          is_official: boolean
          specialties: string[]
          username: string
        }
        Insert: {
          archived_at?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          favorite_techniques?: string[]
          id: string
          is_official?: boolean
          specialties?: string[]
          username: string
        }
        Update: {
          archived_at?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          favorite_techniques?: string[]
          id?: string
          is_official?: boolean
          specialties?: string[]
          username?: string
        }
        Relationships: []
      }
      recipe_ingredients: {
        Row: {
          id: string
          position: number
          recipe_id: string
          text: string
        }
        Insert: {
          id?: string
          position?: number
          recipe_id: string
          text: string
        }
        Update: {
          id?: string
          position?: number
          recipe_id?: string
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipe_ingredients_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_likes: {
        Row: {
          created_at: string
          recipe_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          recipe_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          recipe_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipe_likes_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_notes: {
        Row: {
          created_at: string
          id: string
          owner_id: string
          recipe_id: string
          text: string
        }
        Insert: {
          created_at?: string
          id?: string
          owner_id: string
          recipe_id: string
          text: string
        }
        Update: {
          created_at?: string
          id?: string
          owner_id?: string
          recipe_id?: string
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipe_notes_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_notes_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_shares: {
        Row: {
          created_at: string
          recipe_id: string
          shared_by: string
          shared_with: string
        }
        Insert: {
          created_at?: string
          recipe_id: string
          shared_by: string
          shared_with: string
        }
        Update: {
          created_at?: string
          recipe_id?: string
          shared_by?: string
          shared_with?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipe_shares_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_shares_shared_by_fkey"
            columns: ["shared_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_shares_shared_with_fkey"
            columns: ["shared_with"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_steps: {
        Row: {
          id: string
          position: number
          recipe_id: string
          section: string | null
          text: string
        }
        Insert: {
          id?: string
          position?: number
          recipe_id: string
          section?: string | null
          text: string
        }
        Update: {
          id?: string
          position?: number
          recipe_id?: string
          section?: string | null
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipe_steps_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipes: {
        Row: {
          bbq_type: string
          cook_time_minutes: number | null
          cover_photo_url: string | null
          created_at: string
          description: string | null
          difficulty: string
          forked_from_recipe_id: string | null
          id: string
          is_public: boolean
          main_ingredient: string
          original_owner_display_name: string | null
          original_owner_username: string | null
          owner_id: string
          rating: number | null
          servings: number | null
          title: string
          technique: string
          updated_at: string
          youtube_url: string | null
        }
        Insert: {
          bbq_type?: string
          cook_time_minutes?: number | null
          cover_photo_url?: string | null
          created_at?: string
          description?: string | null
          difficulty?: string
          forked_from_recipe_id?: string | null
          id?: string
          is_public?: boolean
          main_ingredient?: string
          original_owner_display_name?: string | null
          original_owner_username?: string | null
          owner_id: string
          rating?: number | null
          servings?: number | null
          title: string
          technique?: string
          updated_at?: string
          youtube_url?: string | null
        }
        Update: {
          bbq_type?: string
          cook_time_minutes?: number | null
          cover_photo_url?: string | null
          created_at?: string
          description?: string | null
          difficulty?: string
          forked_from_recipe_id?: string | null
          id?: string
          is_public?: boolean
          main_ingredient?: string
          original_owner_display_name?: string | null
          original_owner_username?: string | null
          owner_id?: string
          rating?: number | null
          servings?: number | null
          title?: string
          technique?: string
          updated_at?: string
          youtube_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recipes_forked_from_recipe_id_fkey"
            columns: ["forked_from_recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipes_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      video_likes: {
        Row: {
          created_at: string
          user_id: string
          video_id: string
        }
        Insert: {
          created_at?: string
          user_id: string
          video_id: string
        }
        Update: {
          created_at?: string
          user_id?: string
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_likes_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      video_shares: {
        Row: {
          created_at: string
          shared_by: string
          shared_with: string
          video_id: string
        }
        Insert: {
          created_at?: string
          shared_by: string
          shared_with: string
          video_id: string
        }
        Update: {
          created_at?: string
          shared_by?: string
          shared_with?: string
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_shares_shared_by_fkey"
            columns: ["shared_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_shares_shared_with_fkey"
            columns: ["shared_with"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_shares_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      videos: {
        Row: {
          caption: string | null
          created_at: string
          id: string
          is_feed_visible: boolean
          is_recipe: boolean
          owner_id: string
          tutorial_category: string | null
          youtube_url: string
        }
        Insert: {
          caption?: string | null
          created_at?: string
          id?: string
          is_feed_visible?: boolean
          is_recipe?: boolean
          owner_id: string
          tutorial_category?: string | null
          youtube_url: string
        }
        Update: {
          caption?: string | null
          created_at?: string
          id?: string
          is_feed_visible?: boolean
          is_recipe?: boolean
          owner_id?: string
          tutorial_category?: string | null
          youtube_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "videos_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_chef_points: { Args: { target_user_id: string }; Returns: number }
      get_chef_points_bulk: {
        Args: { user_ids: string[] }
        Returns: {
          points: number
          user_id: string
        }[]
      }
      get_chef_stats: {
        Args: { target_user_id: string }
        Returns: {
          average_rating: number | null
          followers: number
          following: number
          moments: number
          recipe_likes: number
          recipes: number
          saves: number
          videos: number
        }[]
      }
      get_chef_streak: { Args: { target_user_id: string }; Returns: number }
      get_monthly_following_leaderboard: {
        Args: Record<PropertyKey, never>
        Returns: {
          avatar_url: string | null
          display_name: string | null
          moments_logged: number
          monthly_points: number
          recipes_logged: number
          total_points: number
          user_id: string
          username: string
        }[]
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
