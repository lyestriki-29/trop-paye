export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      access_logs: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          dossier_id: string | null
          id: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          dossier_id?: string | null
          id?: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          dossier_id?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "access_logs_dossier_id_fkey"
            columns: ["dossier_id"]
            isOneToOne: false
            referencedRelation: "dossiers"
            referencedColumns: ["id"]
          },
        ]
      }
      actions: {
        Row: {
          created_at: string
          dossier_id: string
          executed_at: string | null
          id: string
          payload: Json
          scheduled_at: string | null
          type: Database["public"]["Enums"]["action_type"]
        }
        Insert: {
          created_at?: string
          dossier_id: string
          executed_at?: string | null
          id?: string
          payload?: Json
          scheduled_at?: string | null
          type: Database["public"]["Enums"]["action_type"]
        }
        Update: {
          created_at?: string
          dossier_id?: string
          executed_at?: string | null
          id?: string
          payload?: Json
          scheduled_at?: string | null
          type?: Database["public"]["Enums"]["action_type"]
        }
        Relationships: [
          {
            foreignKeyName: "actions_dossier_id_fkey"
            columns: ["dossier_id"]
            isOneToOne: false
            referencedRelation: "dossiers"
            referencedColumns: ["id"]
          },
        ]
      }
      articles: {
        Row: {
          author: string
          created_at: string
          excerpt: string | null
          id: string
          keyword: string | null
          mdx: string
          published_at: string | null
          slug: string
          sources: Json
          status: Database["public"]["Enums"]["article_status"]
          title: string
          topic: string | null
          updated_at: string
        }
        Insert: {
          author?: string
          created_at?: string
          excerpt?: string | null
          id?: string
          keyword?: string | null
          mdx?: string
          published_at?: string | null
          slug: string
          sources?: Json
          status?: Database["public"]["Enums"]["article_status"]
          title: string
          topic?: string | null
          updated_at?: string
        }
        Update: {
          author?: string
          created_at?: string
          excerpt?: string | null
          id?: string
          keyword?: string | null
          mdx?: string
          published_at?: string | null
          slug?: string
          sources?: Json
          status?: Database["public"]["Enums"]["article_status"]
          title?: string
          topic?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      dossiers: {
        Row: {
          address_label: string | null
          ban_id: string | null
          charges_cents: number | null
          construction_period: string | null
          created_at: string
          current_rent_cents: number | null
          deposit_cents: number | null
          dpe_class: string | null
          dpe_date: string | null
          dpe_number: string | null
          dpe_source: Database["public"]["Enums"]["dpe_source"] | null
          engine_snapshot: Json | null
          furnished: boolean | null
          id: string
          initial_rent_cents: number | null
          insee_code: string | null
          lease_renewed_at: string | null
          lease_signed_at: string | null
          previous_tenant_rent_cents: number | null
          recovery_state: Database["public"]["Enums"]["recovery_state"]
          revision_clause: boolean | null
          revision_quarter: string | null
          rooms: number | null
          session_token: string | null
          status: Database["public"]["Enums"]["dossier_status"]
          surface_m2: number | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          address_label?: string | null
          ban_id?: string | null
          charges_cents?: number | null
          construction_period?: string | null
          created_at?: string
          current_rent_cents?: number | null
          deposit_cents?: number | null
          dpe_class?: string | null
          dpe_date?: string | null
          dpe_number?: string | null
          dpe_source?: Database["public"]["Enums"]["dpe_source"] | null
          engine_snapshot?: Json | null
          furnished?: boolean | null
          id?: string
          initial_rent_cents?: number | null
          insee_code?: string | null
          lease_renewed_at?: string | null
          lease_signed_at?: string | null
          previous_tenant_rent_cents?: number | null
          recovery_state?: Database["public"]["Enums"]["recovery_state"]
          revision_clause?: boolean | null
          revision_quarter?: string | null
          rooms?: number | null
          session_token?: string | null
          status?: Database["public"]["Enums"]["dossier_status"]
          surface_m2?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          address_label?: string | null
          ban_id?: string | null
          charges_cents?: number | null
          construction_period?: string | null
          created_at?: string
          current_rent_cents?: number | null
          deposit_cents?: number | null
          dpe_class?: string | null
          dpe_date?: string | null
          dpe_number?: string | null
          dpe_source?: Database["public"]["Enums"]["dpe_source"] | null
          engine_snapshot?: Json | null
          furnished?: boolean | null
          id?: string
          initial_rent_cents?: number | null
          insee_code?: string | null
          lease_renewed_at?: string | null
          lease_signed_at?: string | null
          previous_tenant_rent_cents?: number | null
          recovery_state?: Database["public"]["Enums"]["recovery_state"]
          revision_clause?: boolean | null
          revision_quarter?: string | null
          rooms?: number | null
          session_token?: string | null
          status?: Database["public"]["Enums"]["dossier_status"]
          surface_m2?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dossiers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      dpe_records: {
        Row: {
          class: string
          created_at: string
          date: string
          dossier_id: string
          id: string
          numero: string | null
          source: Database["public"]["Enums"]["dpe_source"]
          surface_m2: number | null
        }
        Insert: {
          class: string
          created_at?: string
          date: string
          dossier_id: string
          id?: string
          numero?: string | null
          source: Database["public"]["Enums"]["dpe_source"]
          surface_m2?: number | null
        }
        Update: {
          class?: string
          created_at?: string
          date?: string
          dossier_id?: string
          id?: string
          numero?: string | null
          source?: Database["public"]["Enums"]["dpe_source"]
          surface_m2?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "dpe_records_dossier_id_fkey"
            columns: ["dossier_id"]
            isOneToOne: false
            referencedRelation: "dossiers"
            referencedColumns: ["id"]
          },
        ]
      }
      fee_cap_zones: {
        Row: {
          effective_from: string
          insee_code: string
          verified: boolean
          zone: string
        }
        Insert: {
          effective_from: string
          insee_code: string
          verified?: boolean
          zone: string
        }
        Update: {
          effective_from?: string
          insee_code?: string
          verified?: boolean
          zone?: string
        }
        Relationships: []
      }
      fund_movements: {
        Row: {
          amount_cents: number
          created_at: string
          direction: string
          dossier_id: string
          id: string
          occurred_at: string
          reference: string | null
        }
        Insert: {
          amount_cents: number
          created_at?: string
          direction: string
          dossier_id: string
          id?: string
          occurred_at?: string
          reference?: string | null
        }
        Update: {
          amount_cents?: number
          created_at?: string
          direction?: string
          dossier_id?: string
          id?: string
          occurred_at?: string
          reference?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fund_movements_dossier_id_fkey"
            columns: ["dossier_id"]
            isOneToOne: false
            referencedRelation: "dossiers"
            referencedColumns: ["id"]
          },
        ]
      }
      irl_index: {
        Row: {
          published_at: string | null
          quarter: string
          value: number
          verified: boolean
        }
        Insert: {
          published_at?: string | null
          quarter: string
          value: number
          verified?: boolean
        }
        Update: {
          published_at?: string | null
          quarter?: string
          value?: number
          verified?: boolean
        }
        Relationships: []
      }
      legal_rules: {
        Row: {
          effective_from: string
          effective_to: string | null
          id: string
          params: Json
          version: string
        }
        Insert: {
          effective_from: string
          effective_to?: string | null
          id: string
          params?: Json
          version: string
        }
        Update: {
          effective_from?: string
          effective_to?: string | null
          id?: string
          params?: Json
          version?: string
        }
        Relationships: []
      }
      mandates: {
        Row: {
          created_at: string
          dossier_id: string
          fee_rate_bps: number
          id: string
          pdf_url: string | null
          signed_at: string | null
          status: Database["public"]["Enums"]["mandate_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          dossier_id: string
          fee_rate_bps?: number
          id?: string
          pdf_url?: string | null
          signed_at?: string | null
          status?: Database["public"]["Enums"]["mandate_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          dossier_id?: string
          fee_rate_bps?: number
          id?: string
          pdf_url?: string | null
          signed_at?: string | null
          status?: Database["public"]["Enums"]["mandate_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mandates_dossier_id_fkey"
            columns: ["dossier_id"]
            isOneToOne: true
            referencedRelation: "dossiers"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          body: string
          created_at: string
          dossier_id: string
          id: string
          sender: string
        }
        Insert: {
          body: string
          created_at?: string
          dossier_id: string
          id?: string
          sender: string
        }
        Update: {
          body?: string
          created_at?: string
          dossier_id?: string
          id?: string
          sender?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_dossier_id_fkey"
            columns: ["dossier_id"]
            isOneToOne: false
            referencedRelation: "dossiers"
            referencedColumns: ["id"]
          },
        ]
      }
      outbox_emails: {
        Row: {
          body: string
          created_at: string
          dossier_id: string | null
          id: string
          sent_at: string | null
          status: string
          subject: string
          template: string | null
          to_email: string
        }
        Insert: {
          body: string
          created_at?: string
          dossier_id?: string | null
          id?: string
          sent_at?: string | null
          status?: string
          subject: string
          template?: string | null
          to_email: string
        }
        Update: {
          body?: string
          created_at?: string
          dossier_id?: string | null
          id?: string
          sent_at?: string | null
          status?: string
          subject?: string
          template?: string | null
          to_email?: string
        }
        Relationships: [
          {
            foreignKeyName: "outbox_emails_dossier_id_fkey"
            columns: ["dossier_id"]
            isOneToOne: false
            referencedRelation: "dossiers"
            referencedColumns: ["id"]
          },
        ]
      }
      pieces: {
        Row: {
          created_at: string
          dossier_id: string
          encrypted: boolean
          id: string
          kind: string
          reason: string | null
          status: Database["public"]["Enums"]["piece_status"]
          storage_path: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          dossier_id: string
          encrypted?: boolean
          id?: string
          kind: string
          reason?: string | null
          status?: Database["public"]["Enums"]["piece_status"]
          storage_path?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          dossier_id?: string
          encrypted?: boolean
          id?: string
          kind?: string
          reason?: string | null
          status?: Database["public"]["Enums"]["piece_status"]
          storage_path?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pieces_dossier_id_fkey"
            columns: ["dossier_id"]
            isOneToOne: false
            referencedRelation: "dossiers"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          first_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          first_name?: string | null
          id: string
          last_name?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
      rent_events: {
        Row: {
          created_at: string
          date: string
          dossier_id: string
          id: string
          rent_cents: number
          source: string
          type: Database["public"]["Enums"]["rent_event_type"]
        }
        Insert: {
          created_at?: string
          date: string
          dossier_id: string
          id?: string
          rent_cents: number
          source?: string
          type: Database["public"]["Enums"]["rent_event_type"]
        }
        Update: {
          created_at?: string
          date?: string
          dossier_id?: string
          id?: string
          rent_cents?: number
          source?: string
          type?: Database["public"]["Enums"]["rent_event_type"]
        }
        Relationships: [
          {
            foreignKeyName: "rent_events_dossier_id_fkey"
            columns: ["dossier_id"]
            isOneToOne: false
            referencedRelation: "dossiers"
            referencedColumns: ["id"]
          },
        ]
      }
      signature_proofs: {
        Row: {
          consented_at: string
          created_at: string
          document_hash: string
          dossier_id: string
          id: string
          ip: string | null
          mandate_id: string | null
          proof_hmac: string
          signer_name: string
          user_agent: string | null
        }
        Insert: {
          consented_at: string
          created_at?: string
          document_hash: string
          dossier_id: string
          id?: string
          ip?: string | null
          mandate_id?: string | null
          proof_hmac: string
          signer_name: string
          user_agent?: string | null
        }
        Update: {
          consented_at?: string
          created_at?: string
          document_hash?: string
          dossier_id?: string
          id?: string
          ip?: string | null
          mandate_id?: string | null
          proof_hmac?: string
          signer_name?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "signature_proofs_dossier_id_fkey"
            columns: ["dossier_id"]
            isOneToOne: false
            referencedRelation: "dossiers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "signature_proofs_mandate_id_fkey"
            columns: ["mandate_id"]
            isOneToOne: false
            referencedRelation: "mandates"
            referencedColumns: ["id"]
          },
        ]
      }
      tense_zone_communes: {
        Row: {
          effective_from: string
          effective_to: string | null
          insee_code: string
          name: string | null
          verified: boolean
        }
        Insert: {
          effective_from: string
          effective_to?: string | null
          insee_code: string
          name?: string | null
          verified?: boolean
        }
        Update: {
          effective_from?: string
          effective_to?: string | null
          insee_code?: string
          name?: string | null
          verified?: boolean
        }
        Relationships: []
      }
      verdicts: {
        Row: {
          as_of: string
          computed_at: string
          confidence: string
          dossier_id: string
          id: string
          outcome: string
          results: Json
          signals: Json
          total_future_monthly_saving_cents: number
          total_recoverable_cents: number
        }
        Insert: {
          as_of: string
          computed_at?: string
          confidence: string
          dossier_id: string
          id?: string
          outcome: string
          results: Json
          signals?: Json
          total_future_monthly_saving_cents?: number
          total_recoverable_cents?: number
        }
        Update: {
          as_of?: string
          computed_at?: string
          confidence?: string
          dossier_id?: string
          id?: string
          outcome?: string
          results?: Json
          signals?: Json
          total_future_monthly_saving_cents?: number
          total_recoverable_cents?: number
        }
        Relationships: [
          {
            foreignKeyName: "verdicts_dossier_id_fkey"
            columns: ["dossier_id"]
            isOneToOne: false
            referencedRelation: "dossiers"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      owns_dossier: { Args: { d: string }; Returns: boolean }
    }
    Enums: {
      action_type:
        | "LETTER_J0"
        | "REMINDER_J21"
        | "PROPOSAL_J35"
        | "FINAL_NOTICE_J50"
        | "LANDLORD_REPLY"
        | "ESCALATION"
        | "PAYMENT_RECEIVED"
        | "PAYOUT_SENT"
      article_status: "DRAFT" | "REVIEW" | "PUBLISHED" | "ARCHIVED"
      dossier_status:
        | "DRAFT"
        | "DIAGNOSED"
        | "MANDATE_PENDING"
        | "IN_REVIEW"
        | "RECOVERY"
        | "ESCALATED"
        | "WON"
        | "LOST"
        | "CLOSED"
      dpe_source: "ADEME_API" | "USER_INPUT" | "DOCUMENT"
      mandate_status: "DRAFT" | "PENDING" | "SIGNED" | "CANCELLED"
      piece_status: "RECEIVED" | "ILLEGIBLE" | "VALIDATED"
      recovery_state: "SCHEDULED" | "PAUSED" | "LOCKED"
      rent_event_type:
        | "INITIAL"
        | "REVISION"
        | "RENEWAL"
        | "RELOCATION"
        | "REGULARISATION_CHARGES"
      user_role: "client" | "admin"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      action_type: [
        "LETTER_J0",
        "REMINDER_J21",
        "PROPOSAL_J35",
        "FINAL_NOTICE_J50",
        "LANDLORD_REPLY",
        "ESCALATION",
        "PAYMENT_RECEIVED",
        "PAYOUT_SENT",
      ],
      article_status: ["DRAFT", "REVIEW", "PUBLISHED", "ARCHIVED"],
      dossier_status: [
        "DRAFT",
        "DIAGNOSED",
        "MANDATE_PENDING",
        "IN_REVIEW",
        "RECOVERY",
        "ESCALATED",
        "WON",
        "LOST",
        "CLOSED",
      ],
      dpe_source: ["ADEME_API", "USER_INPUT", "DOCUMENT"],
      mandate_status: ["DRAFT", "PENDING", "SIGNED", "CANCELLED"],
      piece_status: ["RECEIVED", "ILLEGIBLE", "VALIDATED"],
      recovery_state: ["SCHEDULED", "PAUSED", "LOCKED"],
      rent_event_type: [
        "INITIAL",
        "REVISION",
        "RENEWAL",
        "RELOCATION",
        "REGULARISATION_CHARGES",
      ],
      user_role: ["client", "admin"],
    },
  },
} as const

