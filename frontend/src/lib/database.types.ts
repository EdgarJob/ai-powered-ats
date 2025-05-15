export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string
          name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
          updated_at?: string
        }
      }
      org_credits: {
        Row: {
          org_id: string
          credits: number
          created_at: string
          updated_at: string
        }
        Insert: {
          org_id: string
          credits: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          org_id?: string
          credits?: number
          created_at?: string
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: string
          org_id: string
          email: string
          role: 'admin' | 'user'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          org_id: string
          email: string
          role?: 'admin' | 'user'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          email?: string
          role?: 'admin' | 'user'
          created_at?: string
          updated_at?: string
        }
      }
      jobs: {
        Row: {
          id: string
          org_id: string
          title: string
          description: string
          requirements: string[]
          status: 'draft' | 'published' | 'closed'
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          org_id: string
          title: string
          description: string
          requirements: string[]
          status?: 'draft' | 'published' | 'closed'
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          title?: string
          description?: string
          requirements?: string[]
          status?: 'draft' | 'published' | 'closed'
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      candidates: {
        Row: {
          id: string
          job_id: string
          full_name: string
          email: string
          phone?: string
          resume_url: string
          status: 'pending' | 'reviewed' | 'shortlisted' | 'rejected'
          embedding: number[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          job_id: string
          full_name: string
          email: string
          phone?: string
          resume_url: string
          status?: 'pending' | 'reviewed' | 'shortlisted' | 'rejected'
          embedding?: number[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          job_id?: string
          full_name?: string
          email?: string
          phone?: string
          resume_url?: string
          status?: 'pending' | 'reviewed' | 'shortlisted' | 'rejected'
          embedding?: number[]
          created_at?: string
          updated_at?: string
        }
      }
      candidate_scores: {
        Row: {
          candidate_id: string
          job_id: string
          score: number
          created_at: string
        }
        Insert: {
          candidate_id: string
          job_id: string
          score: number
          created_at?: string
        }
        Update: {
          candidate_id?: string
          job_id?: string
          score?: number
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      match_candidates: {
        Args: {
          p_job_id: string
          p_limit?: number
        }
        Returns: {
          candidate_id: string
          full_name: string
          email: string
          score: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
} 