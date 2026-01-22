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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      activity_log: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      aid_requests: {
        Row: {
          admin_notes: string | null
          category: string
          contact_email: string
          contact_name: string
          contact_phone: string | null
          created_at: string
          description: string
          goal_amount: number
          id: string
          image_urls: string[] | null
          location: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          title: string
          updated_at: string
          urgency: string
          user_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          category?: string
          contact_email: string
          contact_name: string
          contact_phone?: string | null
          created_at?: string
          description: string
          goal_amount?: number
          id?: string
          image_urls?: string[] | null
          location?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          title: string
          updated_at?: string
          urgency?: string
          user_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          category?: string
          contact_email?: string
          contact_name?: string
          contact_phone?: string | null
          created_at?: string
          description?: string
          goal_amount?: number
          id?: string
          image_urls?: string[] | null
          location?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          title?: string
          updated_at?: string
          urgency?: string
          user_id?: string | null
        }
        Relationships: []
      }
      causes: {
        Row: {
          category: string
          created_at: string
          description: string | null
          goal_amount: number
          id: string
          image_url: string | null
          is_active: boolean
          raised_amount: number
          title: string
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          goal_amount?: number
          id?: string
          image_url?: string | null
          is_active?: boolean
          raised_amount?: number
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          goal_amount?: number
          id?: string
          image_url?: string | null
          is_active?: boolean
          raised_amount?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      contact_submissions: {
        Row: {
          admin_response: string | null
          created_at: string
          email: string
          id: string
          is_read: boolean
          message: string
          name: string
          responded_at: string | null
          responded_by: string | null
          subject: string | null
        }
        Insert: {
          admin_response?: string | null
          created_at?: string
          email: string
          id?: string
          is_read?: boolean
          message: string
          name: string
          responded_at?: string | null
          responded_by?: string | null
          subject?: string | null
        }
        Update: {
          admin_response?: string | null
          created_at?: string
          email?: string
          id?: string
          is_read?: boolean
          message?: string
          name?: string
          responded_at?: string | null
          responded_by?: string | null
          subject?: string | null
        }
        Relationships: []
      }
      donations: {
        Row: {
          amount: number
          cause_id: string | null
          created_at: string
          donor_email: string | null
          donor_name: string | null
          id: string
          is_anonymous: boolean
          is_recurring: boolean
          status: string
          user_id: string | null
        }
        Insert: {
          amount: number
          cause_id?: string | null
          created_at?: string
          donor_email?: string | null
          donor_name?: string | null
          id?: string
          is_anonymous?: boolean
          is_recurring?: boolean
          status?: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          cause_id?: string | null
          created_at?: string
          donor_email?: string | null
          donor_name?: string | null
          id?: string
          is_anonymous?: boolean
          is_recurring?: boolean
          status?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "donations_cause_id_fkey"
            columns: ["cause_id"]
            isOneToOne: false
            referencedRelation: "causes"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_subscribers: {
        Row: {
          email: string
          id: string
          is_active: boolean
          name: string | null
          source: string | null
          subscribed_at: string
          unsubscribed_at: string | null
        }
        Insert: {
          email: string
          id?: string
          is_active?: boolean
          name?: string | null
          source?: string | null
          subscribed_at?: string
          unsubscribed_at?: string | null
        }
        Update: {
          email?: string
          id?: string
          is_active?: boolean
          name?: string | null
          source?: string | null
          subscribed_at?: string
          unsubscribed_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          approved_at: string | null
          approved_by: string | null
          avatar_url: string | null
          created_at: string
          email: string | null
          first_name: string | null
          id: string
          is_approved: boolean
          last_name: string | null
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          approved_at?: string | null
          approved_by?: string | null
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          is_approved?: boolean
          last_name?: string | null
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          approved_at?: string | null
          approved_by?: string | null
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          is_approved?: boolean
          last_name?: string | null
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          id: string
          key: string
          updated_at: string
          updated_by: string | null
          value: Json | null
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string
          updated_by?: string | null
          value?: Json | null
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json | null
        }
        Relationships: []
      }
      success_stories: {
        Row: {
          condition: string
          created_at: string
          featured_quote: string | null
          id: string
          is_featured: boolean
          is_published: boolean
          location: string | null
          patient_name: string
          status: string
          story_content: string
          title: string
          treatment: string
          updated_at: string
        }
        Insert: {
          condition: string
          created_at?: string
          featured_quote?: string | null
          id?: string
          is_featured?: boolean
          is_published?: boolean
          location?: string | null
          patient_name: string
          status?: string
          story_content: string
          title: string
          treatment: string
          updated_at?: string
        }
        Update: {
          condition?: string
          created_at?: string
          featured_quote?: string | null
          id?: string
          is_featured?: boolean
          is_published?: boolean
          location?: string | null
          patient_name?: string
          status?: string
          story_content?: string
          title?: string
          treatment?: string
          updated_at?: string
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          author_name: string
          author_role: string
          created_at: string
          id: string
          is_published: boolean
          quote: string
          sort_order: number
          story_id: string | null
        }
        Insert: {
          author_name: string
          author_role: string
          created_at?: string
          id?: string
          is_published?: boolean
          quote: string
          sort_order?: number
          story_id?: string | null
        }
        Update: {
          author_name?: string
          author_role?: string
          created_at?: string
          id?: string
          is_published?: boolean
          quote?: string
          sort_order?: number
          story_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "testimonials_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "success_stories"
            referencedColumns: ["id"]
          },
        ]
      }
      treatment_updates: {
        Row: {
          created_at: string
          description: string
          id: string
          sort_order: number
          story_id: string
          title: string
          update_date: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          sort_order?: number
          story_id: string
          title: string
          update_date: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          sort_order?: number
          story_id?: string
          title?: string
          update_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "treatment_updates_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "success_stories"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
