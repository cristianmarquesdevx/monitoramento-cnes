"""
Vercel Python Serverless Function — Envio de e-mail via Zimbra SOAP API
========================================================================
Substitui SMTP/Brevo pela API SOAP do Zimbra (webmail.portovelho.ro.gov.br).
Funciona via HTTPS (porta 443) — acessível de qualquer lugar, sem DNS.

Configuração necessária no Vercel (Settings > Environment Variables):
  ZIMBRA_URL       — URL do Zimbra (ex: https://webmail.portovelho.ro.gov.br)
  ZIMBRA_USERNAME  — E-mail (ex: gecav.semusa@portovelho.ro.gov.br)
  ZIMBRA_PASSWORD  — Senha do e-mail
  FROM_EMAIL       — Remetente (ex: gecav.semusa@portovelho.ro.gov.br)
  FROM_NAME        — Nome do remetente

Modos de uso:
  Individual: { "destinatario": "email@exemplo.com", "cnes": "123", "nome_unidade": "UBS", "responsavel": "João", "tipo": "individual" }
  Massivo:    { "tipo": "massivo", "destinatarios": [{ "destinatario": "...", "cnes": "...", "nome_unidade": "...", "responsavel": "..." }] }
"""

import os
import json
import xml.etree.ElementTree as ET
from http.server import BaseHTTPRequestHandler
from datetime import datetime
from urllib.request import Request, urlopen
from urllib.error import URLError

# ===== Configuração via variáveis de ambiente =====
ZIMBRA_URL = os.environ.get('ZIMBRA_URL', '').rstrip('/')
ZIMBRA_USERNAME = os.environ.get('ZIMBRA_USERNAME', '')
ZIMBRA_PASSWORD = os.environ.get('ZIMBRA_PASSWORD', '')
FROM_EMAIL = os.environ.get('FROM_EMAIL', '')
FROM_NAME = os.environ.get('FROM_NAME', 'SEMUSA - Divisão de Controle e Avaliação do SUS')

CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

MESES_PT = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
]

# Suporta SOAP 1.1 e 1.2 (Zimbra aceita ambos, mas versões antigas preferem 1.1)
SOAP_NS = 'http://schemas.xmlsoap.org/soap/envelope/'
ZIMBRA_ACCOUNT_NS = 'urn:zimbraAccount'
ZIMBRA_MAIL_NS = 'urn:zimbraMail'
ZIMBRA_NS = 'urn:zimbra'


def _elem(tag, text=None, attrs=None, children=None):
    """Helper para construir elementos XML (escapamento automático)."""
    el = ET.Element(tag, attrib=attrs or {})
    if text is not None:
        el.text = text
    if children:
        for child in children:
            el.append(child)
    return el


def _soap_envelope(body_children, header_children=None):
    """Monta envelope SOAP completo."""
    envelope = ET.Element(f'{{{SOAP_NS}}}Envelope')
    if header_children:
        envelope.append(_elem(f'{{{SOAP_NS}}}Header', children=header_children))
    envelope.append(_elem(f'{{{SOAP_NS}}}Body', children=body_children))
    return envelope


def _soap_request(body_children, header_children=None):
    """Faz requisição SOAP e retorna o XML de resposta."""
    envelope = _soap_envelope(body_children, header_children)
    payload = ET.tostring(envelope, encoding='unicode')

    req = Request(
        f'{ZIMBRA_URL}/service/soap/',
        data=payload.encode('utf-8'),
        headers={
            'Content-Type': 'text/xml; charset=utf-8',
            'User-Agent': 'SEMUSA-CNES/1.0',
        },
        method='POST',
    )

    try:
        with urlopen(req, timeout=30) as resp:
            raw = resp.read()
            return ET.fromstring(raw)
    except URLError as e:
        raise Exception(f'Erro na requisição SOAP: {str(e)}')


def _check_soap_fault(response):
    """Verifica se a resposta SOAP contém Fault, lança exceção se sim.
    Suporta SOAP 1.1 e 1.2."""
    fault = response.find(f'.//{{{SOAP_NS}}}Fault')
    if fault is not None:
        reason = (fault.find(f'.//{{{SOAP_NS}}}Text')  # SOAP 1.2
                  or fault.find(f'.//{{{SOAP_NS}}}faultstring'))  # SOAP 1.1
        raise Exception(reason.text if reason is not None else 'Erro desconhecido')


def build_html(responsavel, cnes, nome_unidade, data_atual):
    """Gera o HTML do e-mail institucional."""
    return f'''<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {{ font-family: Arial, sans-serif; margin: 0; padding: 0; background: #f5f5f5; }}
    .container {{ max-width: 600px; margin: 20px auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }}
    .header {{ background: #003c7d; color: #fff; padding: 20px; text-align: center; }}
    .header h1 {{ margin: 0; font-size: 18px; }}
    .header p {{ margin: 5px 0 0; font-size: 12px; opacity: 0.9; }}
    .body {{ padding: 25px; }}
    .body p {{ font-size: 14px; line-height: 1.6; color: #333; }}
    .info-box {{ background: #e8f0fe; border-left: 4px solid #003c7d; padding: 15px; margin: 15px 0; border-radius: 4px; }}
    .info-box strong {{ display: block; font-size: 13px; color: #003c7d; }}
    .info-box span {{ font-size: 14px; color: #333; }}
    .footer {{ background: #f0f0f0; padding: 15px; text-align: center; font-size: 11px; color: #666; }}
    .button {{ display: inline-block; background: #003c7d; color: #fff; text-decoration: none; padding: 10px 20px; border-radius: 5px; font-size: 13px; margin-top: 15px; }}
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
      <p>Prezado(a) <strong>{responsavel}</strong>,</p>
      <p>
        A <strong>Divisão de Controle e Avaliação do SUS</strong> informa que a unidade de sa\u00fade
        sob sua responsabilidade <strong>ainda n\u00e3o possui profissionais cadastrados</strong> no
        sistema de Atualiza\u00e7\u00e3o Cadastral do CNES.
      </p>
      <div class="info-box">
        <strong>Unidade:</strong>
        <span>{cnes} — {nome_unidade}</span>
      </div>
      <p>
        <strong>Por que isso \u00e9 importante?</strong><br>
        O cadastro dos profissionais no CNES \u00e9 obrigat\u00f3rio para o funcionamento regular da unidade
        e para o repasse de recursos federais. Sem o cadastro, a unidade pode ficar sem
        financiamento do SUS.
      </p>
      <p>
        <strong>O que precisa ser feito:</strong><br>
        Acesse o sistema de Atualiza\u00e7\u00e3o Cadastral e cadastre todos os profissionais da sua unidade
        o mais breve poss\u00edvel.
      </p>
      <p style="text-align: center;">
        <a href="https://atualizacaoprofissionais-cnes.vercel.app" class="button">
          Acessar Sistema CNES
        </a>
      </p>
      <p>
        Em caso de d\u00favidas, entre em contato com a Divis\u00e3o de Controle e Avalia\u00e7\u00e3o do SUS.
      </p>
      <p>
        Atenciosamente,<br>
        <strong>Divis\u00e3o de Controle e Avalia\u00e7\u00e3o do SUS</strong><br>
        SEMUSA — Porto Velho/RO
      </p>
      <p style="font-size: 11px; color: #999; margin-top: 20px;">
        <em>Data: {data_atual}</em>
      </p>
    </div>
    <div class="footer">
      <p>SEMUSA - Secretaria Municipal de Sa\u00fade de Porto Velho</p>
      <p>Este \u00e9 um e-mail autom\u00e1tico. N\u00e3o responda a esta mensagem.</p>
    </div>
  </div>
</html>'''


def data_pt_br():
    """Retorna data formatada em português."""
    hoje = datetime.now()
    mes = MESES_PT[hoje.month - 1]
    return f'{hoje.day:02d} de {mes} de {hoje.year}'


def autenticar_zimbra():
    """Autentica no Zimbra e retorna o authToken."""
    response = _soap_request([
        _elem('AuthRequest', attrs={'xmlns': ZIMBRA_ACCOUNT_NS}, children=[
            _elem('account', attrs={'by': 'name'}, text=ZIMBRA_USERNAME),
            _elem('password', text=ZIMBRA_PASSWORD),
        ]),
    ])

    _check_soap_fault(response)

    # Extrai authToken (namespace pode variar)
    body = response.find(f'{{{SOAP_NS}}}Body')
    for el in body.iter():
        if el.tag.endswith('authToken') and el.text:
            return el.text.strip()

    raise Exception('authToken não encontrado na resposta do Zimbra')


def enviar_email_zimbra(destinatario, cnes, nome_unidade, responsavel, data_atual, auth_token):
    """Envia um e-mail via API SOAP do Zimbra."""
    html = build_html(responsavel, cnes, nome_unidade, data_atual)
    subject = f'[SEMUSA] Cadastro CNES — Unidade {nome_unidade} sem profissionais cadastrados'

    plain_text = (
        f'Prezado(a) {responsavel},\n\n'
        f'A Divisão de Controle e Avaliação do SUS informa que a unidade '
        f'{cnes} — {nome_unidade} sob sua responsabilidade ainda não possui '
        f'profissionais cadastrados no sistema de Atualização Cadastral do CNES.'
    )

    response = _soap_request(
        body_children=[
            _elem('SendMsgRequest', attrs={'xmlns': ZIMBRA_MAIL_NS}, children=[
                _elem('m', children=[
                    _elem('e', attrs={'t': 't', 'a': destinatario}),
                    _elem('su', text=subject),
                    # HTML + texto alternativo
                    _elem('mp', attrs={'ct': 'multipart/alternative'}, children=[
                        _elem('mp', attrs={'ct': 'text/plain'}, children=[
                            _elem('content', text=plain_text),
                        ]),
                        _elem('mp', attrs={'ct': 'text/html'}, children=[
                            _elem('content', text=html),
                        ]),
                    ]),
                ]),
            ]),
        ],
        header_children=[
            _elem('context', attrs={'xmlns': ZIMBRA_NS}, children=[
                _elem('authToken', text=auth_token),
            ]),
        ],
    )

    _check_soap_fault(response)
    return True


class handler(BaseHTTPRequestHandler):
    """Vercel Python serverless function handler."""

    def do_OPTIONS(self):
        """CORS preflight."""
        self.send_response(204)
        for key, value in CORS_HEADERS.items():
            self.send_header(key, value)
        self.end_headers()

    def do_POST(self):
        """Envia e-mail(s) via Zimbra SOAP API."""
        # Valida configuração
        erros_config = []
        if not ZIMBRA_URL:
            erros_config.append('ZIMBRA_URL')
        if not ZIMBRA_USERNAME:
            erros_config.append('ZIMBRA_USERNAME')
        if not ZIMBRA_PASSWORD:
            erros_config.append('ZIMBRA_PASSWORD')
        if not FROM_EMAIL:
            erros_config.append('FROM_EMAIL')

        if erros_config:
            self._send_json(500, {
                'success': False,
                'error': f'Variáveis de ambiente não configuradas: {", ".join(erros_config)}. '
                         f'Configure no Vercel > Settings > Environment Variables.'
            })
            return

        # Lê o body
        content_length = int(self.headers.get('Content-Length', 0))
        post_data = self.rfile.read(content_length)

        try:
            payload = json.loads(post_data)
        except json.JSONDecodeError:
            self._send_json(400, {'success': False, 'error': 'JSON inválido'})
            return

        data_atual = data_pt_br()

        try:
            # Autentica no Zimbra
            try:
                auth_token = autenticar_zimbra()
            except Exception as e:
                self._send_json(500, {
                    'success': False,
                    'error': f'Falha na autenticação Zimbra: {str(e)}',
                    'hint': 'Verifique ZIMBRA_USERNAME e ZIMBRA_PASSWORD nas variáveis de ambiente do Vercel.'
                })
                return

            tipo = payload.get('tipo', 'individual')

            if tipo == 'massivo' and 'destinatarios' in payload:
                destinatarios = payload['destinatarios']
                if not destinatarios:
                    self._send_json(400, {
                        'success': False,
                        'error': 'Nenhum destinatário informado.'
                    })
                    return

                resultados = []
                for dest in destinatarios:
                    try:
                        enviar_email_zimbra(
                            dest['destinatario'],
                            dest.get('cnes', ''),
                            dest.get('nome_unidade', ''),
                            dest.get('responsavel', 'Gestor(a)'),
                            data_atual,
                            auth_token,
                        )
                        resultados.append({
                            'destinatario': dest['destinatario'],
                            'cnes': dest.get('cnes', ''),
                            'nome_unidade': dest.get('nome_unidade', ''),
                            'success': True,
                        })
                    except Exception as e:
                        resultados.append({
                            'destinatario': dest['destinatario'],
                            'cnes': dest.get('cnes', ''),
                            'nome_unidade': dest.get('nome_unidade', ''),
                            'success': False,
                            'error': str(e),
                        })

                enviados = sum(1 for r in resultados if r['success'])
                erros = len(resultados) - enviados

                self._send_json(200, {
                    'success': True,
                    'enviados': enviados,
                    'erros': erros,
                    'total': len(destinatarios),
                    'detalhes': resultados,
                })

            else:
                destinatario = payload.get('destinatario', '')
                cnes = payload.get('cnes', '')
                nome_unidade = payload.get('nome_unidade', '')
                responsavel = payload.get('responsavel', 'Gestor(a)')

                if not destinatario or '@' not in destinatario:
                    self._send_json(400, {
                        'success': False,
                        'error': 'E-mail do destinatário inválido.'
                    })
                    return

                enviar_email_zimbra(
                    destinatario, cnes, nome_unidade, responsavel, data_atual, auth_token,
                )

                self._send_json(200, {
                    'success': True,
                    'message': f'E-mail enviado para {destinatario} via Zimbra',
                    'destinatario': destinatario,
                    'cnes': cnes,
                    'nome_unidade': nome_unidade,
                })

        except Exception as e:
            self._send_json(500, {
                'success': False,
                'error': str(e),
            })

    def _send_json(self, status_code, data):
        """Helper para responder JSON com CORS."""
        self.send_response(status_code)
        for key, value in CORS_HEADERS.items():
            self.send_header(key, value)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.end_headers()
        self.wfile.write(json.dumps(data, ensure_ascii=False).encode('utf-8'))
