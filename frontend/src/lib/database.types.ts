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
          role: 'admin' | 'user'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          org_id: string
          role?: 'admin' | 'user'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          org_id?: string
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
          metadata?: any
          responsibilities?: string
        }
        Insert: Omit<Database['public']['Tables']['jobs']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['jobs']['Insert']>
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
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['candidates']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['candidates']['Insert']>
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

export type Job = Database['public']['Tables']['jobs']['Row'] & {
  deadline?: string | null;
  industry?: string | null;
  location?: string | null;
  field?: string | null;
  responsibilities?: string | null;
};
export type Candidate = Database['public']['Tables']['candidates']['Row'] 