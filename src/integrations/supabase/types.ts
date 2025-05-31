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
      agendamentos: {
        Row: {
          criado_em: string | null
          data: string
          empresa_id: string | null
          hora: string | null
          id: string
          nome_cliente: string
          servico: string | null
          status: string | null
          telefone: string | null
          valor: number | null
        }
        Insert: {
          criado_em?: string | null
          data: string
          empresa_id?: string | null
          hora?: string | null
          id?: string
          nome_cliente: string
          servico?: string | null
          status?: string | null
          telefone?: string | null
          valor?: number | null
        }
        Update: {
          criado_em?: string | null
          data?: string
          empresa_id?: string | null
          hora?: string | null
          id?: string
          nome_cliente?: string
          servico?: string | null
          status?: string | null
          telefone?: string | null
          valor?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "agendamentos_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      atendimentos: {
        Row: {
          canal: string | null
          criado_em: string | null
          descricao: string | null
          empresa_id: string | null
          id: string
          nome_cliente: string | null
          status: string | null
        }
        Insert: {
          canal?: string | null
          criado_em?: string | null
          descricao?: string | null
          empresa_id?: string | null
          id?: string
          nome_cliente?: string | null
          status?: string | null
        }
        Update: {
          canal?: string | null
          criado_em?: string | null
          descricao?: string | null
          empresa_id?: string | null
          id?: string
          nome_cliente?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "atendimentos_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      empresas: {
        Row: {
          criado_em: string | null
          email: string
          id: string
          nome: string
          plano: string
        }
        Insert: {
          criado_em?: string | null
          email: string
          id?: string
          nome: string
          plano?: string
        }
        Update: {
          criado_em?: string | null
          email?: string
          id?: string
          nome?: string
          plano?: string
        }
        Relationships: []
      }
      horarios: {
        Row: {
          ativo: boolean | null
          dia_semana: string | null
          empresa_id: string | null
          hora_fim: string | null
          hora_inicio: string | null
          id: string
        }
        Insert: {
          ativo?: boolean | null
          dia_semana?: string | null
          empresa_id?: string | null
          hora_fim?: string | null
          hora_inicio?: string | null
          id?: string
        }
        Update: {
          ativo?: boolean | null
          dia_semana?: string | null
          empresa_id?: string | null
          hora_fim?: string | null
          hora_inicio?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "horarios_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      notificacoes: {
        Row: {
          criado_em: string | null
          empresa_id: string | null
          id: string
          mensagem: string
          tipo: string | null
          valor: number | null
        }
        Insert: {
          criado_em?: string | null
          empresa_id?: string | null
          id?: string
          mensagem: string
          tipo?: string | null
          valor?: number | null
        }
        Update: {
          criado_em?: string | null
          empresa_id?: string | null
          id?: string
          mensagem?: string
          tipo?: string | null
          valor?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "notificacoes_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      pagamentos: {
        Row: {
          empresa_id: string | null
          id: string
          metodo: string | null
          nome_cliente: string | null
          recebido_em: string | null
          status: string | null
          valor: number
        }
        Insert: {
          empresa_id?: string | null
          id?: string
          metodo?: string | null
          nome_cliente?: string | null
          recebido_em?: string | null
          status?: string | null
          valor: number
        }
        Update: {
          empresa_id?: string | null
          id?: string
          metodo?: string | null
          nome_cliente?: string | null
          recebido_em?: string | null
          status?: string | null
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "pagamentos_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      pagamentos_links: {
        Row: {
          empresa_id: string | null
          id: string
          link_cartao: string | null
          link_pix: string | null
          link_unico: string | null
        }
        Insert: {
          empresa_id?: string | null
          id?: string
          link_cartao?: string | null
          link_pix?: string | null
          link_unico?: string | null
        }
        Update: {
          empresa_id?: string | null
          id?: string
          link_cartao?: string | null
          link_pix?: string | null
          link_unico?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pagamentos_links_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      servicos: {
        Row: {
          criado_em: string | null
          empresa_id: string | null
          id: string
          nome: string
          valor: number
        }
        Insert: {
          criado_em?: string | null
          empresa_id?: string | null
          id?: string
          nome: string
          valor: number
        }
        Update: {
          criado_em?: string | null
          empresa_id?: string | null
          id?: string
          nome?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "servicos_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      tom_voz: {
        Row: {
          criado_em: string | null
          empresa_id: string | null
          id: string
          prompt: string | null
        }
        Insert: {
          criado_em?: string | null
          empresa_id?: string | null
          id?: string
          prompt?: string | null
        }
        Update: {
          criado_em?: string | null
          empresa_id?: string | null
          id?: string
          prompt?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tom_voz_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_dashboard_stats: {
        Args: { p_empresa_id: string }
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
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
