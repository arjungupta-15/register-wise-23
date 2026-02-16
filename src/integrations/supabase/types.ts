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
      admin_users: {
        Row: {
          id: string
          email: string
          password_hash: string
          name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          password_hash: string
          name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          password_hash?: string
          name?: string
          created_at?: string
          updated_at?: string
        }
      }
      courses: {
        Row: {
          id: string
          name: string
          duration: string
          fee: string
          center: 'rajasthan' | 'centerexam' | 'other'
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          duration: string
          fee: string
          center: 'rajasthan' | 'centerexam' | 'other'
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          duration?: string
          fee?: string
          center?: 'rajasthan' | 'centerexam' | 'other'
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      students: {
        Row: {
          id: string
          name: string
          email: string | null
          mobile: string | null
          father_name: string
          mother_name: string
          address: string
          eligibility: string
          obtained_marks: number | null
          total_marks: number | null
          percentage: number | null
          aadhaar: string
          caste: 'general' | 'obc' | 'sc' | 'st'
          gender: 'male' | 'female'
          center: 'rajasthan' | 'centerexam' | 'other'
          status: 'pending' | 'approved' | 'rejected'
          payment_status: 'pending' | 'paid'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email?: string | null
          mobile?: string | null
          father_name: string
          mother_name: string
          address: string
          eligibility: string
          obtained_marks?: number | null
          total_marks?: number | null
          aadhaar: string
          caste: 'general' | 'obc' | 'sc' | 'st'
          gender: 'male' | 'female'
          center: 'rajasthan' | 'centerexam' | 'other'
          status?: 'pending' | 'approved' | 'rejected'
          payment_status?: 'pending' | 'paid'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string | null
          mobile?: string | null
          father_name?: string
          mother_name?: string
          address?: string
          eligibility?: string
          obtained_marks?: number | null
          total_marks?: number | null
          aadhaar?: string
          caste?: 'general' | 'obc' | 'sc' | 'st'
          gender?: 'male' | 'female'
          center?: 'rajasthan' | 'centerexam' | 'other'
          status?: 'pending' | 'approved' | 'rejected'
          payment_status?: 'pending' | 'paid'
          created_at?: string
          updated_at?: string
        }
      }
      student_courses: {
        Row: {
          id: string
          student_id: string
          course_id: string
          created_at: string
        }
        Insert: {
          id?: string
          student_id: string
          course_id: string
          created_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          course_id?: string
          created_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          order_id: string
          student_id: string
          amount: number
          payment_type: 'onetime' | 'installment'
          installment_number: number | null
          status: 'pending' | 'success' | 'failed' | 'refunded'
          payment_session_id: string | null
          payment_method: string | null
          transaction_id: string | null
          payment_time: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_id: string
          student_id: string
          amount: number
          payment_type: 'onetime' | 'installment'
          installment_number?: number | null
          status?: 'pending' | 'success' | 'failed' | 'refunded'
          payment_session_id?: string | null
          payment_method?: string | null
          transaction_id?: string | null
          payment_time?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          student_id?: string
          amount?: number
          payment_type?: 'onetime' | 'installment'
          installment_number?: number | null
          status?: 'pending' | 'success' | 'failed' | 'refunded'
          payment_session_id?: string | null
          payment_method?: string | null
          transaction_id?: string | null
          payment_time?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
