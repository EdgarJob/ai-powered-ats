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
          id: string
          org_id: string
          credits: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          org_id: string
          credits?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          credits?: number
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
          requirements?: string[]
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
          phone: string | null
          resume_url: string
          status: 'pending' | 'reviewed' | 'shortlisted' | 'rejected'
          embedding: number[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          job_id: string
          full_name: string
          email: string
          phone?: string | null
          resume_url: string
          status?: 'pending' | 'reviewed' | 'shortlisted' | 'rejected'
          embedding?: number[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          job_id?: string
          full_name?: string
          email?: string
          phone?: string | null
          resume_url?: string
          status?: 'pending' | 'reviewed' | 'shortlisted' | 'rejected'
          embedding?: number[] | null
          created_at?: string
          updated_at?: string
        }
      }
      candidate_scores: {
        Row: {
          id: string
          candidate_id: string
          total_score: number
          skills_score: number
          experience_score: number
          education_score: number
          explanation: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          candidate_id: string
          total_score: number
          skills_score: number
          experience_score: number
          education_score: number
          explanation?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          candidate_id?: string
          total_score?: number
          skills_score?: number
          experience_score?: number
          education_score?: number
          explanation?: Json
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
} 