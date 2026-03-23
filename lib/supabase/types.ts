export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export interface Database {
  public: {
    Tables: {
      chapters: {
        Row: {
          id: string
          user_id: string
          name: string
          emoji: string | null
          started_at: string
          ended_at: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['chapters']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['chapters']['Insert']>
      }
      goals: {
        Row: {
          id: string
          user_id: string
          chapter_id: string | null
          parent_goal_id: string | null
          title: string
          description: string | null
          status: 'active' | 'completed' | 'archived'
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['goals']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['goals']['Insert']>
      }
      tasks: {
        Row: {
          id: string
          user_id: string
          goal_id: string | null
          title: string
          status: 'todo' | 'in_progress' | 'done'
          due_date: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['tasks']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['tasks']['Insert']>
      }
      journal_entries: {
        Row: {
          id: string
          user_id: string
          chapter_id: string | null
          title: string | null
          content: string
          entry_type: 'journal' | 'prompt' | 'whatif'
          prompt: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['journal_entries']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['journal_entries']['Insert']>
      }
      journal_entry_goals: {
        Row: { journal_entry_id: string; goal_id: string }
        Insert: Database['public']['Tables']['journal_entry_goals']['Row']
        Update: never
      }
    }
  }
}

export type Chapter = Database['public']['Tables']['chapters']['Row']
export type Goal = Database['public']['Tables']['goals']['Row']
export type Task = Database['public']['Tables']['tasks']['Row']
export type JournalEntry = Database['public']['Tables']['journal_entries']['Row']
