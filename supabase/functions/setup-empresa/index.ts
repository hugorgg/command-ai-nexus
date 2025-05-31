
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmpresaRequest {
  nome: string;
  email: string;
  plano: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Método não permitido' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { nome, email, plano }: EmpresaRequest = await req.json()

    if (!nome || !email || !plano) {
      return new Response(
        JSON.stringify({ error: 'Dados obrigatórios não fornecidos' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Criando empresa: ${nome} (${email}) - Plano: ${plano}`)

    // 1. Criar a empresa
    const { data: empresa, error: empresaError } = await supabaseClient
      .from('empresas')
      .insert([{ nome, email, plano }])
      .select()
      .single()

    if (empresaError) {
      console.error('Erro ao criar empresa:', empresaError)
      return new Response(
        JSON.stringify({ error: 'Erro ao criar empresa', details: empresaError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const empresaId = empresa.id
    console.log(`Empresa criada com ID: ${empresaId}`)

    // 2. Inserir agendamentos de exemplo
    const agendamentos = [
      {
        nome_cliente: 'João Silva',
        telefone: '(11) 99999-9999',
        servico: 'Consulta',
        valor: 150.00,
        data: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Amanhã
        hora: '14:00',
        status: 'Agendado',
        empresa_id: empresaId
      },
      {
        nome_cliente: 'Maria Santos',
        telefone: '(11) 88888-8888',
        servico: 'Exame',
        valor: 80.00,
        data: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Depois de amanhã
        hora: '10:30',
        status: 'Agendado',
        empresa_id: empresaId
      },
      {
        nome_cliente: 'Pedro Costa',
        telefone: '(11) 77777-7777',
        servico: 'Retorno',
        valor: 100.00,
        data: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Ontem
        hora: '16:00',
        status: 'Concluído',
        empresa_id: empresaId
      }
    ]

    const { error: agendamentosError } = await supabaseClient
      .from('agendamentos')
      .insert(agendamentos)

    if (agendamentosError) {
      console.error('Erro ao inserir agendamentos:', agendamentosError)
    } else {
      console.log('Agendamentos inseridos com sucesso')
    }

    // 3. Inserir atendimentos de exemplo
    const atendimentos = [
      {
        nome_cliente: 'Ana Oliveira',
        canal: 'WhatsApp',
        status: 'Em Atendimento',
        descricao: 'Dúvidas sobre agendamento',
        empresa_id: empresaId
      },
      {
        nome_cliente: 'Carlos Ferreira',
        canal: 'Telegram',
        status: 'Novo',
        descricao: 'Solicitação de orçamento',
        empresa_id: empresaId
      },
      {
        nome_cliente: 'Lucia Martins',
        canal: 'Instagram',
        status: 'Concluído',
        descricao: 'Informações sobre serviços',
        empresa_id: empresaId
      }
    ]

    const { error: atendimentosError } = await supabaseClient
      .from('atendimentos')
      .insert(atendimentos)

    if (atendimentosError) {
      console.error('Erro ao inserir atendimentos:', atendimentosError)
    } else {
      console.log('Atendimentos inseridos com sucesso')
    }

    // 4. Inserir pagamentos de exemplo
    const pagamentos = [
      {
        nome_cliente: 'João Silva',
        valor: 150.00,
        metodo: 'Pix',
        status: 'Pago',
        empresa_id: empresaId
      },
      {
        nome_cliente: 'Maria Santos',
        valor: 80.00,
        metodo: 'Cartão',
        status: 'Pendente',
        empresa_id: empresaId
      },
      {
        nome_cliente: 'Pedro Costa',
        valor: 100.00,
        metodo: 'Link',
        status: 'Pago',
        empresa_id: empresaId
      }
    ]

    const { error: pagamentosError } = await supabaseClient
      .from('pagamentos')
      .insert(pagamentos)

    if (pagamentosError) {
      console.error('Erro ao inserir pagamentos:', pagamentosError)
    } else {
      console.log('Pagamentos inseridos com sucesso')
    }

    // 5. Inserir notificações de exemplo
    const notificacoes = [
      {
        tipo: 'atendimento_iniciado',
        mensagem: 'Novo atendimento iniciado com Ana Oliveira',
        empresa_id: empresaId
      },
      {
        tipo: 'venda_confirmada',
        mensagem: 'Venda confirmada para João Silva',
        valor: 150.00,
        empresa_id: empresaId
      },
      {
        tipo: 'novo_agendamento',
        mensagem: 'Novo agendamento criado para Maria Santos',
        valor: 80.00,
        empresa_id: empresaId
      }
    ]

    const { error: notificacoesError } = await supabaseClient
      .from('notificacoes')
      .insert(notificacoes)

    if (notificacoesError) {
      console.error('Erro ao inserir notificações:', notificacoesError)
    } else {
      console.log('Notificações inseridas com sucesso')
    }

    // 6. Inserir serviços de exemplo
    const servicos = [
      {
        nome: 'Consulta Inicial',
        valor: 150.00,
        empresa_id: empresaId
      },
      {
        nome: 'Exame Completo',
        valor: 200.00,
        empresa_id: empresaId
      },
      {
        nome: 'Consulta de Retorno',
        valor: 100.00,
        empresa_id: empresaId
      }
    ]

    const { error: servicosError } = await supabaseClient
      .from('servicos')
      .insert(servicos)

    if (servicosError) {
      console.error('Erro ao inserir serviços:', servicosError)
    } else {
      console.log('Serviços inseridos com sucesso')
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        empresa_id: empresaId,
        message: 'Empresa criada com sucesso e dados de exemplo inseridos!' 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Erro na função:', error)
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
