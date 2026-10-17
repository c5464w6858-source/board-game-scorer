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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      connections: {
        Row: {
          addressee_id: string
          created_at: string
          id: string
          requester_id: string
          responded_at: string | null
          status: Database["public"]["Enums"]["request_status"]
        }
        Insert: {
          addressee_id: string
          created_at?: string
          id?: string
          requester_id?: string
          responded_at?: string | null
          status?: Database["public"]["Enums"]["request_status"]
        }
        Update: {
          addressee_id?: string
          created_at?: string
          id?: string
          requester_id?: string
          responded_at?: string | null
          status?: Database["public"]["Enums"]["request_status"]
        }
        Relationships: [
          {
            foreignKeyName: "connections_addressee_id_fkey"
            columns: ["addressee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "connections_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      course_imports: {
        Row: {
          course_count: number | null
          error: string | null
          finished_at: string | null
          id: number
          started_at: string
        }
        Insert: {
          course_count?: number | null
          error?: string | null
          finished_at?: string | null
          id?: never
          started_at?: string
        }
        Update: {
          course_count?: number | null
          error?: string | null
          finished_at?: string | null
          id?: never
          started_at?: string
        }
        Relationships: []
      }
      courses: {
        Row: {
          booking_url: string | null
          holes: number | null
          id: string
          lat: number
          lon: number
          name: string
          phone: string | null
          postcode: string | null
          town: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          booking_url?: string | null
          holes?: number | null
          id: string
          lat: number
          lon: number
          name: string
          phone?: string | null
          postcode?: string | null
          town?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          booking_url?: string | null
          holes?: number | null
          id?: string
          lat?: number
          lon?: number
          name?: string
          phone?: string | null
          postcode?: string | null
          town?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          handicap: number | null
          home_area: string | null
          id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          handicap?: number | null
          home_area?: string | null
          id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          handicap?: number | null
          home_area?: string | null
          id?: string
        }
        Relationships: []
      }
      round_requests: {
        Row: {
          created_at: string
          id: string
          message: string | null
          responded_at: string | null
          round_id: string
          status: Database["public"]["Enums"]["request_status"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message?: string | null
          responded_at?: string | null
          round_id: string
          status?: Database["public"]["Enums"]["request_status"]
          user_id?: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string | null
          responded_at?: string | null
          round_id?: string
          status?: Database["public"]["Enums"]["request_status"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "round_requests_round_id_fkey"
            columns: ["round_id"]
            isOneToOne: false
            referencedRelation: "rounds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "round_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      rounds: {
        Row: {
          cancelled: boolean
          course_id: string | null
          course_name: string
          created_at: string
          holes: number
          host_id: string
          id: string
          location: string | null
          max_handicap: number | null
          max_players: number
          min_handicap: number | null
          notes: string | null
          tee_time: string
        }
        Insert: {
          cancelled?: boolean
          course_id?: string | null
          course_name: string
          created_at?: string
          holes?: number
          host_id?: string
          id?: string
          location?: string | null
          max_handicap?: number | null
          max_players?: number
          min_handicap?: number | null
          notes?: string | null
          tee_time: string
        }
        Update: {
          cancelled?: boolean
          course_id?: string | null
          course_name?: string
          created_at?: string
          holes?: number
          host_id?: string
          id?: string
          location?: string | null
          max_handicap?: number | null
          max_players?: number
          min_handicap?: number | null
          notes?: string | null
          tee_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "rounds_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rounds_host_id_fkey"
            columns: ["host_id"]
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
      is_round_host: { Args: { p_round_id: string }; Returns: boolean }
    }
    Enums: {
      request_status: "pending" | "accepted" | "declined" | "withdrawn"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database["public"]

export type Tables<T extends keyof PublicSchema["Tables"]> = PublicSchema["Tables"][T]["Row"]
export type TablesInsert<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Insert"]
export type TablesUpdate<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Update"]
export type Enums<T extends keyof PublicSchema["Enums"]> = PublicSchema["Enums"][T]
