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
        Insert: {
          user_id: string
          name: string
          emoji?: string | null
          started_at: string
          ended_at?: string | null
        }
        Update: {
          user_id?: string
          name?: string
          emoji?: string | null
          started_at?: string
          ended_at?: string | null
        }
        Relationships: []
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
        Insert: {
          user_id: string
          chapter_id?: string | null
          parent_goal_id?: string | null
          title: string
          description?: string | null
          status: 'active' | 'completed' | 'archived'
        }
        Update: {
          user_id?: string
          chapter_id?: string | null
          parent_goal_id?: string | null
          title?: string
          description?: string | null
          status?: 'active' | 'completed' | 'archived'
        }
        Relationships: []
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
        Insert: {
          user_id: string
          goal_id?: string | null
          title: string
          status: 'todo' | 'in_progress' | 'done'
          due_date?: string | null
        }
        Update: {
          user_id?: string
          goal_id?: string | null
          title?: string
          status?: 'todo' | 'in_progress' | 'done'
          due_date?: string | null
        }
        Relationships: []
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
        Insert: {
          user_id: string
          chapter_id?: string | null
          title?: string | null
          content: string
          entry_type: 'journal' | 'prompt' | 'whatif'
          prompt?: string | null
        }
        Update: {
          user_id?: string
          chapter_id?: string | null
          title?: string | null
          content?: string
          entry_type?: 'journal' | 'prompt' | 'whatif'
          prompt?: string | null
        }
        Relationships: []
      }
      journal_entry_goals: {
        Row: { journal_entry_id: string; goal_id: string }
        Insert: { journal_entry_id: string; goal_id: string }
        Update: never
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
  }
}

export type Chapter = Database['public']['Tables']['chapters']['Row']
export type Goal = Database['public']['Tables']['goals']['Row']
export type Task = Database['public']['Tables']['tasks']['Row']
export type JournalEntry = Database['public']['Tables']['journal_entries']['Row']
