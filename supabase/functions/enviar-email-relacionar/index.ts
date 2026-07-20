// Supabase Edge Function — Envio de e-mail para gestores de unidades sem cadastro
//
// Modos de uso:
//   Individual: { destinatario, cnes, nome_unidade, responsavel, tipo: "individual" }
//   Massivo:    { destinatarios: [{ destinatario, cnes, nome_unidade, responsavel }], tipo: "massivo" }
//
// Configuração necessária:
// 1. Crie uma conta em https://brevo.com (grátis — 300 e-mails/dia)
// 2. Obtenha sua API Key em https://app.brevo.com/settings/keys/api
// 3. Defina as variáveis de ambiente no Supabase:
//    supabase secrets set BREVO_API_KEY=xxxxx
//    supabase secrets set BREVO_FROM_EMAIL=cristianmarques.devx@gmail.com
//    supabase secrets set BREVO_FROM_NAME="SEMUSA - Divisão de Controle e Avaliação do SUS"
// 4. Faça deploy:
//    supabase functions deploy enviar-email-relacionar --no-verify-jwt

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'

const BREVO_API_KEY = Deno.env.get('BREVO_API_KEY') || ''
const FROM_EMAIL = Deno.env.get('BREVO_FROM_EMAIL') || 'cristianmarques.devx@gmail.com'
const FROM_NAME = Deno.env.get('BREVO_FROM_NAME') || 'SEMUSA - Divisão de Controle e Avaliação do SUS'

interface Destinatario {
  destinatario: string
  cnes: string
  nome_unidade: string
  responsavel: string
}

interface EmailPayload {
  tipo: 'individual' | 'massivo'
  destinatario?: string
  cnes?: string
  nome_unidade?: string
  responsavel?: string
  destinatarios?: Destinatario[]
}

interface ResultadoEnvio {
  destinatario: string
  cnes: string
  nome_unidade: string
  success: boolean
  message_id?: string
  error?: string
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function buildHtml(responsavel: string, cnes: string, nome_unidade: string, dataAtual: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 0; background: #f5f5f5; }
    .container { max-width: 600px; margin: 20px auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .header { background: #003c7d; color: #fff; padding: 20px; text-align: center; }
    .header h1 { margin: 0; font-size: 18px; }
    .header p { margin: 5px 0 0; font-size: 12px; opacity: 0.9; }
    .body { padding: 25px; }
    .body p { font-size: 14px; line-height: 1.6; color: #333; }
    .info-box { background: #e8f0fe; border-left: 4px solid #003c7d; padding: 15px; margin: 15px 0; border-radius: 4px; }
    .info-box strong { display: block; font-size: 13px; color: #003c7d; }
    .info-box span { font-size: 14px; color: #333; }
    .footer { background: #f0f0f0; padding: 15px; text-align: center; font-size: 11px; color: #666; }
    .button { display: inline-block; background: #003c7d; color: #fff; text-decoration: none; padding: 10px 20px; border-radius: 5px; font-size: 13px; margin-top: 15px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Prefeitura do Município de Porto Velho</h1>
      <p>Secretaria Municipal de Saúde – SEMUSA</p>
      <p>Divisão de Controle e Avaliação do SUS</p>
    </div>
    <div class="body">
      <p>Prezado(a) <strong>${responsavel}</strong>,</p>
      <p>
        A <strong>Divisão de Controle e Avaliação do SUS</strong> informa que a unidade de saúde
        sob sua responsabilidade <strong>ainda não possui profissionais cadastrados</strong> no
        sistema de Atualização Cadastral do CNES.
      </p>

      <div class="info-box">
        <strong>Unidade:</strong>
        <span>${cnes} — ${nome_unidade}</span>
      </div>

      <p>
        <strong>Por que isso é importante?</strong><br>
        O cadastro dos profissionais no CNES é obrigatório para o funcionamento regular da unidade
        e para o repasse de recursos federais. Sem o cadastro, a unidade pode ficar sem
        financiamento do SUS.
      </p>

      <p>
        <strong>O que precisa ser feito:</strong><br>
        Acesse o sistema de Atualização Cadastral e cadastre todos os profissionais da sua unidade
        o mais breve possível.
      </p>

      <p style="text-align: center;">
        <a href="https://atualizacaoprofissionais-cnes.vercel.app" class="button">
          Acessar Sistema CNES
        </a>
      </p>

      <p>
        Em caso de dúvidas, entre em contato com a Divisão de Controle e Avaliação do SUS.
      </p>

      <p>
        Atenciosamente,<br>
        <strong>Divisão de Controle e Avaliação do SUS</strong><br>
        SEMUSA — Porto Velho/RO
      </p>

      <p style="font-size: 11px; color: #999; margin-top: 20px;">
        <em>Data: ${dataAtual}</em>
      </p>
    </div>
    <div class="footer">
      <p>SEMUSA - Secretaria Municipal de Saúde de Porto Velho</p>
      <p>Este é um e-mail automático. Não responda a esta mensagem.</p>
    </div>
  </div>
</body>
</html>`
}

async function enviarEmailParaUm(dest: Destinatario, dataAtual: string): Promise<ResultadoEnvio> {
  try {
    const html = buildHtml(dest.responsavel, dest.cnes, dest.nome_unidade, dataAtual)

    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': BREVO_API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        sender: { name: FROM_NAME, email: FROM_EMAIL },
        to: [{ email: dest.destinatario, name: dest.responsavel || 'Gestor(a)' }],
        subject: `[SEMUSA] Cadastro CNES — Unidade ${dest.nome_unidade} sem profissionais cadastrados`,
        htmlContent: html,
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      console.error(`Erro Brevo para ${dest.destinatario}:`, data)
      return { ...dest, success: false, error: data.message || 'Erro desconhecido' }
    }

    return { ...dest, success: true, message_id: data.messageId }
  } catch (e) {
    console.error(`Erro na requisição para ${dest.destinatario}:`, e.message)
    return { ...dest, success: false, error: e.message }
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    if (!BREVO_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'BREVO_API_KEY não configurada.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const payload: EmailPayload = await req.json()

    if (payload.tipo === 'massivo' && payload.destinatarios) {
      // === MODO MASSIVO ===
      if (payload.destinatarios.length === 0) {
        return new Response(
          JSON.stringify({ error: 'Nenhum destinatário informado.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const dataAtual = new Date().toLocaleDateString('pt-BR', {
        timeZone: 'America/Porto_Velho',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })

      console.log(`Enviando lote massivo com ${payload.destinatarios.length} destinatário(s)`)

      // Processa todos em paralelo
      const resultados = await Promise.allSettled(
        payload.destinatarios.map(dest => enviarEmailParaUm(dest, dataAtual))
      )

      const detalhes: ResultadoEnvio[] = resultados.map(r =>
        r.status === 'fulfilled' ? r.value : { destinatario: 'erro', cnes: '', nome_unidade: '', success: false, error: r.reason?.message || 'Falha interna' }
      )

      const enviados = detalhes.filter(d => d.success).length
      const erros = detalhes.filter(d => !d.success).length

      console.log(`Lote massivo concluído: ${enviados} enviados, ${erros} erros`)

      return new Response(
        JSON.stringify({ success: true, enviados, erros, total: payload.destinatarios.length, detalhes }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // === MODO INDIVIDUAL ===
    const { destinatario, cnes, nome_unidade, responsavel } = payload

    if (!destinatario || !destinatario.includes('@')) {
      return new Response(
        JSON.stringify({ error: 'E-mail do destinatário inválido.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const dataAtual = new Date().toLocaleDateString('pt-BR', {
      timeZone: 'America/Porto_Velho',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })

    const resultado = await enviarEmailParaUm(
      { destinatario, cnes: cnes || '', nome_unidade: nome_unidade || '', responsavel: responsavel || 'Gestor(a)' },
      dataAtual
    )

    if (!resultado.success) {
      return new Response(
        JSON.stringify({ error: 'Falha ao enviar e-mail', details: resultado.error }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ success: true, message_id: resultado.message_id, destinatario, cnes, nome_unidade }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (e) {
    console.error('Erro na Edge Function:', e.message)
    return new Response(
      JSON.stringify({ error: e.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
