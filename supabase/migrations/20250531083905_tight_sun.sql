-- Create function to generate mock data for a company
CREATE OR REPLACE FUNCTION generate_company_mock_data(company_id UUID)
RETURNS void AS $$
DECLARE
    current_date DATE := CURRENT_DATE;
    service_id UUID;
    payment_id UUID;
BEGIN
    -- Insert mock services
    INSERT INTO servicos (id, empresa_id, nome, valor, criado_em)
    VALUES 
        (gen_random_uuid(), company_id, 'Corte de Cabelo', 50.00, NOW()),
        (gen_random_uuid(), company_id, 'Barba', 30.00, NOW()),
        (gen_random_uuid(), company_id, 'Hidratação', 80.00, NOW())
    RETURNING id INTO service_id;

    -- Insert mock agendamentos
    INSERT INTO agendamentos (id, empresa_id, nome_cliente, telefone, servico, valor, data, hora, status, criado_em)
    SELECT 
        gen_random_uuid(),
        company_id,
        'Cliente ' || i,
        '11999999' || LPAD(i::text, 3, '0'),
        CASE (i % 3)
            WHEN 0 THEN 'Corte de Cabelo'
            WHEN 1 THEN 'Barba'
            ELSE 'Hidratação'
        END,
        CASE (i % 3)
            WHEN 0 THEN 50.00
            WHEN 1 THEN 30.00
            ELSE 80.00
        END,
        current_date + (i % 7),
        format('%02d:00', 9 + (i % 8))::time,
        CASE (i % 3)
            WHEN 0 THEN 'Agendado'
            WHEN 1 THEN 'Concluído'
            ELSE 'Pendente'
        END,
        NOW()
    FROM generate_series(1, 10) i;

    -- Insert mock atendimentos
    INSERT INTO atendimentos (id, empresa_id, nome_cliente, canal, status, descricao, criado_em)
    SELECT 
        gen_random_uuid(),
        company_id,
        'Cliente ' || i,
        CASE (i % 3)
            WHEN 0 THEN 'WhatsApp'
            WHEN 1 THEN 'Instagram'
            ELSE 'Telegram'
        END,
        CASE (i % 3)
            WHEN 0 THEN 'Novo'
            WHEN 1 THEN 'Em Atendimento'
            ELSE 'Concluído'
        END,
        'Atendimento exemplo ' || i,
        NOW() - (i || ' hours')::interval
    FROM generate_series(1, 8) i;

    -- Insert mock pagamentos
    INSERT INTO pagamentos (id, empresa_id, nome_cliente, valor, metodo, status, recebido_em)
    SELECT 
        gen_random_uuid(),
        company_id,
        'Cliente ' || i,
        CASE (i % 3)
            WHEN 0 THEN 50.00
            WHEN 1 THEN 30.00
            ELSE 80.00
        END,
        CASE (i % 3)
            WHEN 0 THEN 'Pix'
            WHEN 1 THEN 'Cartão'
            ELSE 'Link'
        END,
        CASE (i % 3)
            WHEN 0 THEN 'Pago'
            WHEN 1 THEN 'Pendente'
            ELSE 'Cancelado'
        END,
        NOW() - (i || ' hours')::interval
    FROM generate_series(1, 12) i
    RETURNING id INTO payment_id;

    -- Insert mock notificações
    INSERT INTO notificacoes (id, empresa_id, tipo, mensagem, valor, criado_em)
    SELECT 
        gen_random_uuid(),
        company_id,
        CASE (i % 3)
            WHEN 0 THEN 'venda_confirmada'
            WHEN 1 THEN 'novo_agendamento'
            ELSE 'atendimento_iniciado'
        END,
        CASE (i % 3)
            WHEN 0 THEN 'Venda confirmada - Cliente ' || i
            WHEN 1 THEN 'Novo agendamento - Cliente ' || i
            ELSE 'Atendimento iniciado - Cliente ' || i
        END,
        CASE (i % 3)
            WHEN 0 THEN 50.00
            WHEN 1 THEN NULL
            ELSE NULL
        END,
        NOW() - (i || ' hours')::interval
    FROM generate_series(1, 6) i;

    -- Insert mock horários
    INSERT INTO horarios (id, empresa_id, dia_semana, hora_inicio, hora_fim, ativo)
    SELECT 
        gen_random_uuid(),
        company_id,
        dia,
        '09:00',
        '18:00',
        TRUE
    FROM unnest(ARRAY['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo']) dia;

    -- Insert mock tom de voz
    INSERT INTO tom_voz (id, empresa_id, prompt, criado_em)
    VALUES (
        gen_random_uuid(),
        company_id,
        'Você é um assistente profissional e cordial. Sempre cumprimente os clientes de forma educada e mantenha um tom amigável durante toda a conversa.',
        NOW()
    );

    -- Insert mock links de pagamento
    INSERT INTO pagamentos_links (id, empresa_id, link_unico, link_pix, link_cartao)
    VALUES (
        gen_random_uuid(),
        company_id,
        'https://pag.ae/exemplo-unico',
        'https://pag.ae/exemplo-pix',
        'https://pag.ae/exemplo-cartao'
    );
END;
$$ LANGUAGE plpgsql;