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
      availability: {
        Row: {
          created_at: string
          day: string
          slot: Database["public"]["Enums"]["day_slot"]
          user_id: string
        }
        Insert: {
          created_at?: string
          day: string
          slot: Database["public"]["Enums"]["day_slot"]
          user_id?: string
        }
        Update: {
          created_at?: string
          day?: string
          slot?: Database["public"]["Enums"]["day_slot"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "availability_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
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
      course_holes: {
        Row: {
          course_id: string
          hole: number
          par: number
          stroke_index: number
          yards: number | null
        }
        Insert: {
          course_id: string
          hole: number
          par: number
          stroke_index: number
          yards?: number | null
        }
        Update: {
          course_id?: string
          hole?: number
          par?: number
          stroke_index?: number
          yards?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "course_holes_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
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
      course_tees: {
        Row: {
          colour: string | null
          course_id: string
          course_rating: number | null
          gender: string | null
          id: string
          is_default: boolean
          name: string
          par: number
          slope: number | null
          sort: number
          yards: number | null
        }
        Insert: {
          colour?: string | null
          course_id: string
          course_rating?: number | null
          gender?: string | null
          id: string
          is_default?: boolean
          name: string
          par: number
          slope?: number | null
          sort?: number
          yards?: number | null
        }
        Update: {
          colour?: string | null
          course_id?: string
          course_rating?: number | null
          gender?: string | null
          id?: string
          is_default?: boolean
          name?: string
          par?: number
          slope?: number | null
          sort?: number
          yards?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "course_tees_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          booking_url: string | null
          card_checked_at: string | null
          golfapi_club_id: string | null
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
          card_checked_at?: string | null
          golfapi_club_id?: string | null
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
          card_checked_at?: string | null
          golfapi_club_id?: string | null
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
      golfer_preferences: {
        Row: {
          clubs_can_contact: boolean
          looking_for_membership: boolean
          play_frequency: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          clubs_can_contact?: boolean
          looking_for_membership?: boolean
          play_frequency?: string | null
          updated_at?: string
          user_id?: string
        }
        Update: {
          clubs_can_contact?: boolean
          looking_for_membership?: boolean
          play_frequency?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "golfer_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      kudos: {
        Row: {
          created_at: string
          from_id: string
          round_id: string
          tag: Database["public"]["Enums"]["kudos_tag"]
          to_id: string
        }
        Insert: {
          created_at?: string
          from_id?: string
          round_id: string
          tag: Database["public"]["Enums"]["kudos_tag"]
          to_id: string
        }
        Update: {
          created_at?: string
          from_id?: string
          round_id?: string
          tag?: Database["public"]["Enums"]["kudos_tag"]
          to_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "kudos_from_id_fkey"
            columns: ["from_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kudos_round_id_fkey"
            columns: ["round_id"]
            isOneToOne: false
            referencedRelation: "rounds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kudos_to_id_fkey"
            columns: ["to_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bag: Json
          bio: string | null
          created_at: string
          display_name: string | null
          handicap: number | null
          handicap_source: string
          home_area: string | null
          home_club_id: string | null
          home_club_member: boolean
          id: string
          onboarded_at: string | null
          play_style: string[]
          search_radius_miles: number
        }
        Insert: {
          avatar_url?: string | null
          bag?: Json
          bio?: string | null
          created_at?: string
          display_name?: string | null
          handicap?: number | null
          handicap_source?: string
          home_area?: string | null
          home_club_id?: string | null
          home_club_member?: boolean
          id: string
          onboarded_at?: string | null
          play_style?: string[]
          search_radius_miles?: number
        }
        Update: {
          avatar_url?: string | null
          bag?: Json
          bio?: string | null
          created_at?: string
          display_name?: string | null
          handicap?: number | null
          handicap_source?: string
          home_area?: string | null
          home_club_id?: string | null
          home_club_member?: boolean
          id?: string
          onboarded_at?: string | null
          play_style?: string[]
          search_radius_miles?: number
        }
        Relationships: [
          {
            foreignKeyName: "profiles_home_club_id_fkey"
            columns: ["home_club_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      round_messages: {
        Row: {
          body: string
          created_at: string
          id: string
          round_id: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          round_id: string
          user_id?: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          round_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "round_messages_round_id_fkey"
            columns: ["round_id"]
            isOneToOne: false
            referencedRelation: "rounds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "round_messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
          auto_accept_buddies: boolean
          cancelled: boolean
          course_id: string | null
          course_name: string
          created_at: string
          format: Database["public"]["Enums"]["round_format"]
          green_fee_pence: number | null
          holes: number
          host_id: string
          id: string
          location: string | null
          max_handicap: number | null
          max_players: number
          min_handicap: number | null
          notes: string | null
          pace_note: string | null
          tee_id: string | null
          tee_time: string
          title: string | null
          urgent: boolean
          visibility: Database["public"]["Enums"]["round_visibility"]
          walking: boolean
        }
        Insert: {
          auto_accept_buddies?: boolean
          cancelled?: boolean
          course_id?: string | null
          course_name: string
          created_at?: string
          format?: Database["public"]["Enums"]["round_format"]
          green_fee_pence?: number | null
          holes?: number
          host_id?: string
          id?: string
          location?: string | null
          max_handicap?: number | null
          max_players?: number
          min_handicap?: number | null
          notes?: string | null
          pace_note?: string | null
          tee_id?: string | null
          tee_time: string
          title?: string | null
          urgent?: boolean
          visibility?: Database["public"]["Enums"]["round_visibility"]
          walking?: boolean
        }
        Update: {
          auto_accept_buddies?: boolean
          cancelled?: boolean
          course_id?: string | null
          course_name?: string
          created_at?: string
          format?: Database["public"]["Enums"]["round_format"]
          green_fee_pence?: number | null
          holes?: number
          host_id?: string
          id?: string
          location?: string | null
          max_handicap?: number | null
          max_players?: number
          min_handicap?: number | null
          notes?: string | null
          pace_note?: string | null
          tee_id?: string | null
          tee_time?: string
          title?: string | null
          urgent?: boolean
          visibility?: Database["public"]["Enums"]["round_visibility"]
          walking?: boolean
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
          {
            foreignKeyName: "rounds_tee_id_fkey"
            columns: ["tee_id"]
            isOneToOne: false
            referencedRelation: "course_tees"
            referencedColumns: ["id"]
          },
        ]
      }
      scores: {
        Row: {
          hole: number
          round_id: string
          strokes: number
          updated_at: string
          updated_by: string | null
          user_id: string
        }
        Insert: {
          hole: number
          round_id: string
          strokes: number
          updated_at?: string
          updated_by?: string | null
          user_id: string
        }
        Update: {
          hole?: number
          round_id?: string
          strokes?: number
          updated_at?: string
          updated_by?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "scores_round_id_fkey"
            columns: ["round_id"]
            isOneToOne: false
            referencedRelation: "rounds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scores_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scores_user_id_fkey"
            columns: ["user_id"]
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
      golfer_stats: {
        Args: { p_user_id: string }
        Returns: {
          buddies: number
          rounds: number
          shows_up_pct: number
        }[]
      }
      is_buddy: { Args: { p_user_id: string }; Returns: boolean }
      is_round_host: { Args: { p_round_id: string }; Returns: boolean }
      is_round_member: { Args: { p_round_id: string }; Returns: boolean }
      is_round_player: {
        Args: { p_round_id: string; p_user_id: string }
        Returns: boolean
      }
      kudos_revealed: { Args: { p_round_id: string }; Returns: boolean }
    }
    Enums: {
      day_slot: "am" | "pm"
      kudos_tag:
        | "great_company"
        | "kept_the_pace"
        | "clutch_putter"
        | "would_play_again"
      request_status: "pending" | "accepted" | "declined" | "withdrawn"
      round_format: "stableford" | "stroke" | "match" | "scramble"
      round_visibility: "public" | "buddies"
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

export const Constants = {
  public: {
    Enums: {
      day_slot: ["am", "pm"],
      kudos_tag: [
        "great_company",
        "kept_the_pace",
        "clutch_putter",
        "would_play_again",
      ],
      request_status: ["pending", "accepted", "declined", "withdrawn"],
      round_format: ["stableford", "stroke", "match", "scramble"],
      round_visibility: ["public", "buddies"],
    },
  },
} as const
