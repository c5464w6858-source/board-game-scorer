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
      app_settings: {
        Row: { key: string; value: Json }
        Insert: { key: string; value: Json }
        Update: { key?: string; value?: Json }
        Relationships: []
      }
      blocks: {
        Row: {
          blocked_id: string
          blocker_id: string
          created_at: string
        }
        Insert: {
          blocked_id: string
          blocker_id?: string
          created_at?: string
        }
        Update: {
          blocked_id?: string
          blocker_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "blocks_blocked_id_fkey"
            columns: ["blocked_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blocks_blocker_id_fkey"
            columns: ["blocker_id"]
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
      group_matches: {
        Row: {
          created_at: string
          format: Database["public"]["Enums"]["match_format"]
          group_round_id: string
          id: string
          side_a: string[]
          side_b: string[]
          sort: number
        }
        Insert: {
          created_at?: string
          format: Database["public"]["Enums"]["match_format"]
          group_round_id: string
          id?: string
          side_a: string[]
          side_b: string[]
          sort?: number
        }
        Update: {
          created_at?: string
          format?: Database["public"]["Enums"]["match_format"]
          group_round_id?: string
          id?: string
          side_a?: string[]
          side_b?: string[]
          sort?: number
        }
        Relationships: [
          {
            foreignKeyName: "group_matches_group_round_id_fkey"
            columns: ["group_round_id"]
            isOneToOne: false
            referencedRelation: "group_rounds"
            referencedColumns: ["id"]
          },
        ]
      }
      group_members: {
        Row: {
          group_id: string
          joined_at: string
          role: Database["public"]["Enums"]["group_role"]
          team: number | null
          user_id: string
        }
        Insert: {
          group_id: string
          joined_at?: string
          role?: Database["public"]["Enums"]["group_role"]
          team?: number | null
          user_id: string
        }
        Update: {
          group_id?: string
          joined_at?: string
          role?: Database["public"]["Enums"]["group_role"]
          team?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      group_rounds: {
        Row: {
          course_id: string | null
          course_name: string
          created_at: string
          group_id: string
          holes: number
          id: string
          tee_id: string | null
          tee_time: string
          title: string | null
        }
        Insert: {
          course_id?: string | null
          course_name: string
          created_at?: string
          group_id: string
          holes?: number
          id?: string
          tee_id?: string | null
          tee_time: string
          title?: string | null
        }
        Update: {
          course_id?: string | null
          course_name?: string
          created_at?: string
          group_id?: string
          holes?: number
          id?: string
          tee_id?: string | null
          tee_time?: string
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "group_rounds_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_rounds_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_rounds_tee_id_fkey"
            columns: ["tee_id"]
            isOneToOne: false
            referencedRelation: "course_tees"
            referencedColumns: ["id"]
          },
        ]
      }
      group_scores: {
        Row: {
          group_round_id: string
          hole: number
          strokes: number
          updated_at: string
          updated_by: string | null
          user_id: string
        }
        Insert: {
          group_round_id: string
          hole: number
          strokes: number
          updated_at?: string
          updated_by?: string | null
          user_id: string
        }
        Update: {
          group_round_id?: string
          hole?: number
          strokes?: number
          updated_at?: string
          updated_by?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_scores_group_round_id_fkey"
            columns: ["group_round_id"]
            isOneToOne: false
            referencedRelation: "group_rounds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_scores_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_scores_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      launch_signups: {
        Row: { id: string; email: string; source: string; created_at: string }
        Insert: { id?: string; email: string; source?: string; created_at?: string }
        Update: { id?: string; email?: string; source?: string; created_at?: string }
        Relationships: []
      }
      groups: {
        Row: {
          created_at: string
          description: string | null
          ends_on: string | null
          id: string
          invite_code: string
          kind: Database["public"]["Enums"]["group_kind"]
          location: string | null
          name: string
          owner_id: string
          ryder_cup: boolean
          starts_on: string | null
          team_a_name: string
          team_b_name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          ends_on?: string | null
          id?: string
          invite_code?: string
          kind?: Database["public"]["Enums"]["group_kind"]
          location?: string | null
          name: string
          owner_id?: string
          ryder_cup?: boolean
          starts_on?: string | null
          team_a_name?: string
          team_b_name?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          ends_on?: string | null
          id?: string
          invite_code?: string
          kind?: Database["public"]["Enums"]["group_kind"]
          location?: string | null
          name?: string
          owner_id?: string
          ryder_cup?: boolean
          starts_on?: string | null
          team_a_name?: string
          team_b_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "groups_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
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
          beginner_friendly: boolean
          display_name: string | null
          gender: string | null
          handicap: number | null
          handicap_source: string
          home_area: string | null
          home_club_id: string | null
          home_club_member: boolean
          id: string
          onboarded_at: string | null
          play_style: string[]
          push_off: string[]
          search_radius_miles: number
          women_only: boolean
        }
        Insert: {
          avatar_url?: string | null
          bag?: Json
          bio?: string | null
          created_at?: string
          beginner_friendly?: boolean
          display_name?: string | null
          gender?: string | null
          handicap?: number | null
          handicap_source?: string
          home_area?: string | null
          home_club_id?: string | null
          home_club_member?: boolean
          id: string
          onboarded_at?: string | null
          play_style?: string[]
          push_off?: string[]
          search_radius_miles?: number
          women_only?: boolean
        }
        Update: {
          avatar_url?: string | null
          bag?: Json
          bio?: string | null
          created_at?: string
          beginner_friendly?: boolean
          display_name?: string | null
          gender?: string | null
          handicap?: number | null
          handicap_source?: string
          home_area?: string | null
          home_club_id?: string | null
          home_club_member?: boolean
          id?: string
          onboarded_at?: string | null
          play_style?: string[]
          push_off?: string[]
          search_radius_miles?: number
          women_only?: boolean
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
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          p256dh: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          p256dh: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          p256dh?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "push_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          created_at: string
          current_period_end: string | null
          plan: string
          provider: string | null
          provider_customer_id: string | null
          provider_subscription_id: string | null
          status: Database["public"]["Enums"]["plus_status"]
          trial_ends_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_period_end?: string | null
          plan?: string
          provider?: string | null
          provider_customer_id?: string | null
          provider_subscription_id?: string | null
          status: Database["public"]["Enums"]["plus_status"]
          trial_ends_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_period_end?: string | null
          plan?: string
          provider?: string | null
          provider_customer_id?: string | null
          provider_subscription_id?: string | null
          status?: Database["public"]["Enums"]["plus_status"]
          trial_ends_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          created_at: string
          details: string | null
          id: string
          reason: Database["public"]["Enums"]["report_reason"]
          reported_id: string
          reporter_id: string
          round_id: string | null
        }
        Insert: {
          created_at?: string
          details?: string | null
          id?: string
          reason: Database["public"]["Enums"]["report_reason"]
          reported_id: string
          reporter_id?: string
          round_id?: string | null
        }
        Update: {
          created_at?: string
          details?: string | null
          id?: string
          reason?: Database["public"]["Enums"]["report_reason"]
          reported_id?: string
          reporter_id?: string
          round_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reports_reported_id_fkey"
            columns: ["reported_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_round_id_fkey"
            columns: ["round_id"]
            isOneToOne: false
            referencedRelation: "rounds"
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
          beginner_friendly: boolean
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
          women_only: boolean
        }
        Insert: {
          auto_accept_buddies?: boolean
          beginner_friendly?: boolean
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
          women_only?: boolean
        }
        Update: {
          auto_accept_buddies?: boolean
          beginner_friendly?: boolean
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
          women_only?: boolean
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
      group_of_round: { Args: { p_group_round_id: string }; Returns: string }
      is_blocked_between: { Args: { p_a: string; p_b: string }; Returns: boolean }
      is_buddy: { Args: { p_user_id: string }; Returns: boolean }
      is_group_member: { Args: { p_group_id: string }; Returns: boolean }
      is_group_organiser: { Args: { p_group_id: string }; Returns: boolean }
      is_member_of_group: {
        Args: { p_group_id: string; p_user_id: string }
        Returns: boolean
      }
      join_launch_list: { Args: { p_email: string; p_source?: string }; Returns: undefined }
      is_round_host: { Args: { p_round_id: string }; Returns: boolean }
      is_round_member: { Args: { p_round_id: string }; Returns: boolean }
      is_round_player: {
        Args: { p_round_id: string; p_user_id: string }
        Returns: boolean
      }
      is_woman: { Args: { p_user_id: string }; Returns: boolean }
      join_group: { Args: { p_code: string }; Returns: string }
      kudos_revealed: { Args: { p_round_id: string }; Returns: boolean }
      has_plus: { Args: { p_user_id: string }; Returns: boolean }
      plus_golfers: { Args: { p_ids: string[] }; Returns: string[] }
      plus_usage: { Args: never; Returns: Json }
      push_config: { Args: never; Returns: Json }
      save_push_subscription: {
        Args: {
          p_auth: string
          p_endpoint: string
          p_p256dh: string
          p_user_agent?: string
        }
        Returns: undefined
      }
      send_test_push: { Args: never; Returns: undefined }
      start_plus_trial: { Args: never; Returns: string }
    }
    Enums: {
      day_slot: "am" | "pm"
      group_kind: "society" | "trip" | "event"
      group_role: "organiser" | "member"
      kudos_tag:
        | "great_company"
        | "kept_the_pace"
        | "clutch_putter"
        | "would_play_again"
      match_format: "fourball" | "foursomes" | "singles"
      plus_status: "trialing" | "active" | "past_due" | "canceled"
      report_reason:
        | "no_show"
        | "abusive"
        | "unsafe"
        | "fake_profile"
        | "payment"
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
      group_kind: ["society", "trip", "event"],
      group_role: ["organiser", "member"],
      kudos_tag: [
        "great_company",
        "kept_the_pace",
        "clutch_putter",
        "would_play_again",
      ],
      match_format: ["fourball", "foursomes", "singles"],
      plus_status: ["trialing", "active", "past_due", "canceled"],
      report_reason: [
        "no_show",
        "abusive",
        "unsafe",
        "fake_profile",
        "payment",
      ],
      request_status: ["pending", "accepted", "declined", "withdrawn"],
      round_format: ["stableford", "stroke", "match", "scramble"],
      round_visibility: ["public", "buddies"],
    },
  },
} as const
