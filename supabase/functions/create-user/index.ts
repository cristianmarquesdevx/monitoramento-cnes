// Supabase Edge Function — Criar novo usuário (requer service_role)
// Chamada pelo AdminUsers.jsx para adicionar usuários diretamente
//
// Deploy:
//   supabase functions deploy create-user --no-verify-jwt

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || ''
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // ═══ Verifica que o usuário logado é admin ═══
    const authHeader = req.headers.get('authorization')?.replace('Bearer ', '')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Token de autenticação não fornecido.' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Cliente anon para verificar o token do usuário
    const anonClient = createClient(SUPABASE_URL, Deno.env.get('SUPABASE_ANON_KEY') || '')
    const { data: { user: authUser }, error: userError } = await anonClient.auth.getUser(authHeader)

    if (userError || !authUser) {
      return new Response(
        JSON.stringify({ error: 'Token inválido ou expirado.' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verifica se o usuário é admin na tabela profiles
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', authUser.id)
      .single()

    if (profile?.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Acesso negado. Apenas administradores podem criar usuários.' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // ═══ Lê os dados do novo usuário ═══
    const { email, password, nome, role } = await req.json()

    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: 'E-mail e senha são obrigatórios.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (password.length < 6) {
      return new Response(
        JSON.stringify({ error: 'A senha deve ter pelo menos 6 caracteres.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const rolesValidas = ['admin', 'editor', 'viewer']
    if (role && !rolesValidas.includes(role)) {
      return new Response(
        JSON.stringify({ error: `Role inválida. Use: ${rolesValidas.join(', ')}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // ═══ Cria o usuário no auth (email_confirm: true para não enviar confirmação) ═══
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { nome: nome || email.split('@')[0] },
    })

    if (createError) throw createError
    if (!newUser?.user) throw new Error('Usuário não foi criado.')

    // ═══ Atualiza o perfil (role e nome) — o trigger handle_new_user já criou o profile ═══
    const profileUpdate = { nome: nome || email.split('@')[0] }
    if (role) profileUpdate.role = role

    const { error: profileError } = await supabase
      .from('profiles')
      .update(profileUpdate)
      .eq('id', newUser.user.id)

    if (profileError) {
      console.error('Erro ao atualizar profile (não crítico):', profileError.message)
    }

    // ═══ Registra auditoria ═══
    try {
      await supabase.rpc('log_audit', {
        p_usuario_id: authUser.id,
        p_usuario_nome: profile?.nome || 'Admin',
        p_acao: 'create_user',
        p_tipo: 'usuario',
        p_target_id: newUser.user.id,
        p_descricao: `Criou usuário "${nome || email}" com perfil ${role || 'viewer'}`
      })
    } catch (e) {
      console.error('Erro ao registrar auditoria:', e.message)
    }

    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: newUser.user.id,
          email: newUser.user.email,
          nome: nome || email.split('@')[0],
          role: role || 'viewer',
          created_at: newUser.user.created_at,
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (e) {
    console.error('Erro ao criar usuário:', e.message)
    return new Response(
      JSON.stringify({ error: e.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
