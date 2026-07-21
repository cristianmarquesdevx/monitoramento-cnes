import Modal from './Modal';

const STYLE_ID = 'doc-modal-styles';

function injectStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const styles = document.createElement('style');
  styles.id = STYLE_ID;
  styles.textContent = `
  .doc-body {
    font-family: 'Inter', -apple-system, sans-serif;
    color: #1a1a2e;
    background: #f8f9fc;
    line-height: 1.7;
  }
  .doc-body .doc-section {
    background: #fff;
    border-radius: 12px;
    padding: 24px;
    margin-bottom: 20px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.06);
    border: 1px solid #e8ecf1;
  }
  .doc-body h2.doc-h2 {
    font-size: 1.3em;
    font-weight: 700;
    color: #003c7d;
    margin-bottom: 16px;
    padding-bottom: 8px;
    border-bottom: 3px solid #e8ecf1;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .doc-body h2.doc-h2 .step-num {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: #003c7d;
    color: #fff;
    font-size: 0.7em;
    font-weight: 700;
    flex-shrink: 0;
  }
  .doc-body h3 {
    font-size: 1em;
    font-weight: 600;
    color: #003c7d;
    margin: 16px 0 8px;
  }
  .doc-body h4 {
    font-size: 0.9em;
    font-weight: 600;
    color: #444;
    margin: 12px 0 6px;
  }
  .doc-body p {
    margin-bottom: 10px;
    color: #333;
    font-size: 0.9em;
  }
  .doc-body ul, .doc-body ol {
    margin: 8px 0 12px 18px;
  }
  .doc-body li {
    margin-bottom: 4px;
    color: #444;
    font-size: 0.88em;
  }
  .doc-body pre {
    background: #1a1a2e;
    color: #e8e8e8;
    border-radius: 8px;
    padding: 14px 16px;
    overflow-x: auto;
    font-family: 'JetBrains Mono', 'Fira Code', monospace;
    font-size: 0.78em;
    line-height: 1.5;
    margin: 10px 0;
  }
  .doc-body pre .comment { color: #6a9955; }
  .doc-body pre .string { color: #ce9178; }
  .doc-body pre .keyword { color: #569cd6; }
  .doc-body code {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.85em;
    background: #eef1f5;
    padding: 2px 6px;
    border-radius: 4px;
    color: #003c7d;
  }
  .doc-body table {
    width: 100%;
    border-collapse: collapse;
    margin: 12px 0;
    font-size: 0.85em;
  }
  .doc-body th {
    background: #f0f4fa;
    color: #003c7d;
    font-weight: 600;
    text-align: left;
    padding: 8px 10px;
    border: 1px solid #dde3ed;
  }
  .doc-body td {
    padding: 6px 10px;
    border: 1px solid #dde3ed;
  }
  .doc-body tr:nth-child(even) { background: #f8fafc; }
  .doc-body .info-box {
    background: #e8f4fd;
    border-left: 4px solid #003c7d;
    border-radius: 6px;
    padding: 12px 16px;
    margin: 12px 0;
    font-size: 0.88em;
  }
  .doc-body .success-box {
    background: #e6f7e6;
    border-left: 4px solid #28a745;
    border-radius: 6px;
    padding: 12px 16px;
    margin: 12px 0;
    font-size: 0.88em;
  }
  .doc-body .warn-box {
    background: #fff8e1;
    border-left: 4px solid #ffc107;
    border-radius: 6px;
    padding: 12px 16px;
    margin: 12px 0;
    font-size: 0.88em;
  }
  .doc-body .tag {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 10px;
    font-size: 0.7em;
    font-weight: 600;
  }
  .doc-body .tag.green { background: #d4edda; color: #155724; }
  .doc-body .tag.blue { background: #cce5ff; color: #004085; }
  .doc-body .tag.orange { background: #fff3cd; color: #856404; }
  .doc-body .tag.red { background: #f8d7da; color: #721c24; }
  .doc-body .status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    display: inline-block;
  }
  .doc-body .status-dot.green { background: #28a745; }
  .doc-body .flow {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    flex-wrap: wrap;
    margin: 16px 0;
    padding: 16px;
    background: #f8fafc;
    border-radius: 12px;
    border: 1px dashed #dde3ed;
  }
  .doc-body .flow .box {
    background: #003c7d;
    color: #fff;
    padding: 8px 14px;
    border-radius: 8px;
    font-size: 0.8em;
    font-weight: 500;
    text-align: center;
    min-width: 80px;
  }
  .doc-body .flow .box.green { background: #28a745; }
  .doc-body .flow .box.gray { background: #6c757d; }
  .doc-body .flow .arrow { color: #003c7d; font-size: 1.2em; font-weight: 700; }
  .doc-body .doc-cover {
    background: linear-gradient(135deg, #003c7d 0%, #0056a8 50%, #002b5c 100%);
    color: #fff;
    padding: 32px 24px;
    border-radius: 12px;
    text-align: center;
    margin-bottom: 20px;
  }
  .doc-body .doc-cover h1 {
    font-size: 1.6em;
    font-weight: 800;
    margin-bottom: 6px;
  }
  .doc-body .doc-cover h2 {
    font-size: 1em;
    font-weight: 400;
    opacity: 0.9;
    margin-bottom: 12px;
  }
  .doc-body .doc-cover .badge {
    display: inline-block;
    background: rgba(255,255,255,0.15);
    border: 1px solid rgba(255,255,255,0.3);
    border-radius: 14px;
    padding: 3px 10px;
    font-size: 0.7em;
    margin: 3px 2px;
  }
  .doc-body .doc-cover .meta {
    font-size: 0.75em;
    opacity: 0.7;
    border-top: 1px solid rgba(255,255,255,0.2);
    padding-top: 14px;
    margin-top: 14px;
  }
  .doc-body .doc-footer {
    text-align: center;
    margin-top: 24px;
    padding: 16px;
    border-top: 2px solid #003c7d;
  }
  .doc-body .doc-footer p {
    font-size: 0.78em;
    color: #666;
  }

  /* Responsivo: mobile */
  @media (max-width: 640px) {
    .doc-body .doc-section { padding: 14px; }
    .doc-body .doc-cover { padding: 20px 14px; }
    .doc-body .doc-cover h1 { font-size: 1.2em; }
    .doc-body .doc-cover h2 { font-size: 0.85em; }
    .doc-body table { font-size: 0.75em; }
    .doc-body th, .doc-body td { padding: 4px 6px; }
    .doc-body pre { padding: 10px 12px; font-size: 0.7em; }
    .doc-body .flow .box { min-width: 60px; padding: 6px 10px; font-size: 0.7em; }
    .doc-body code { font-size: 0.78em; }
    .doc-body .doc-h2 { font-size: 1.1em; }
    .doc-body h3 { font-size: 0.9em; }
    .doc-body h4 { font-size: 0.8em; }
    .doc-body p { font-size: 0.82em; }
    .doc-body ul, .doc-body ol { margin-left: 14px; }
    .doc-body li { font-size: 0.8em; }
    .doc-body .info-box,
    .doc-body .success-box,
    .doc-body .warn-box { padding: 8px 10px; font-size: 0.8em; }
  }`;
  document.head.appendChild(styles);
}

injectStyles();

export default function DocumentationModal({ isOpen, onClose }) {
  // Injeta estilos apenas uma vez (com ID único para evitar duplicatas)
  injectStyles();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="📖 Documentação Técnica — Integração Zimbra SOAP API" maxWidth="max-w-[1000px]">
      <div className="doc-body">

        {/* Cover */}
        <div className="doc-cover">
          <h1>🏛️ Integração Zimbra SOAP API</h1>
          <h2>Sistema de Atualização Cadastral dos Profissionais — CNES / SEMUSA</h2>
          <p>
            <span className="badge">🔧 Python 3.12</span>
            <span className="badge">🌐 Vercel Serverless</span>
            <span className="badge">📨 Zimbra SOAP API</span>
            <span className="badge">⚡ React + Vite</span>
          </p>
          <p style={{ fontSize: '0.85em', opacity: 0.9 }}>Substituição do serviço Brevo (Sendinblue) por envio direto via servidor Zimbra da Prefeitura de Porto Velho</p>
          <div className="meta">
            SEMUSA — Secretaria Municipal de Saúde de Porto Velho/RO<br />
            Julho de 2026
          </div>
        </div>

        {/* 1. Problema */}
        <div className="doc-section">
          <h2 className="doc-h2"><span className="step-num">1</span> O Problema</h2>
          <p>O sistema precisava enviar e-mails para gestores de unidades de saúde que não possuíam profissionais cadastrados no CNES. Três abordagens foram tentadas:</p>
          <table>
            <thead>
              <tr><th>Abordagem</th><th>Problema</th></tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Brevo + Gmail</strong> <span className="tag orange">FUNCIONAVA PARCIAL</span></td>
                <td>A API aceitava os e-mails, mas iam para a <strong>caixa de SPAM</strong> dos destinatários por usar Gmail como remetente</td>
              </tr>
              <tr>
                <td><strong>Brevo + Domínio do Governo</strong> <span className="tag red">BLOQUEADO</span></td>
                <td>Exigia autenticação de domínio com <strong>registros DNS</strong> (SPF, DKIM, DMARC) — sem acesso ao DNS</td>
              </tr>
              <tr>
                <td><strong>SMTP Direto</strong> <span className="tag red">BLOQUEADO</span></td>
                <td>Portas 25, 587 e 465 do servidor do governo bloqueadas externamente</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 2. Descoberta */}
        <div className="doc-section">
          <h2 className="doc-h2"><span className="step-num">2</span> A Descoberta: Zimbra</h2>
          <p>Ao acessar a URL do webmail informada pelo usuário, descobriu-se que o sistema de e-mail da prefeitura era o <strong>Zimbra</strong> — uma plataforma de código aberto amplamente utilizada em governos brasileiros.</p>
          <div className="info-box">
            <strong>🔍 Informações obtidas via DNS:</strong><br /><br />
            <table>
              <tbody>
                <tr><td><strong>MX Record</strong></td><td><code>webmail.portovelho.ro.gov.br</code></td></tr>
                <tr><td><strong>Webmail</strong></td><td><code>https://webmail.portovelho.ro.gov.br</code></td></tr>
                <tr><td><strong>Plataforma</strong></td><td>Zimbra Web Client (c) 2005-2021 Synacor, Inc.</td></tr>
                <tr><td><strong>SPF Record</strong></td><td><code style={{fontSize:'0.75em'}}>v=spf1 a mx ip4:186.219.241.70 ip4:186.219.241.68 include:_spf.google.com include:_spf.maxx.mobi include:spf.protection.outlook.com -all</code></td></tr>
              </tbody>
            </table>
          </div>
          <p>A página de login do Zimbra estava acessível na <strong>porta 443 (HTTPS)</strong> — mesma porta usada para navegar na internet, nunca bloqueada em firewalls corporativos.</p>
        </div>

        {/* 3. Solução */}
        <div className="doc-section">
          <h2 className="doc-h2"><span className="step-num">3</span> A Solução: API SOAP do Zimbra</h2>
          <p>O Zimbra expõe uma <strong>API SOAP</strong> completa que permite enviar e-mails programaticamente via HTTPS. O fluxo é simples:</p>

          <div className="flow">
            <div className="box">Frontend React</div>
            <span className="arrow">→</span>
            <div className="box">Python (Vercel)</div>
            <span className="arrow">→</span>
            <div className="box green">Zimbra SOAP API</div>
            <span className="arrow">→</span>
            <div className="box">📬 E-mail Enviado!</div>
          </div>

          <div className="flow" style={{ flexDirection: 'column', gap: '2px', background: 'transparent', border: 'none' }}>
            <div style={{ fontSize: '0.78em', color: '#666', marginBottom: '4px' }}><em>Se o Zimbra falhar, o sistema cai no fallback:</em></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <span style={{ fontSize: '0.8em' }}>⚠️ Zimbra offline</span>
              <span className="arrow">→</span>
              <div className="box gray">Python → Brevo API</div>
              <span className="arrow">→</span>
              <div className="box green">📨 E-mail via Gmail!</div>
            </div>
          </div>

          <h3>Como funciona a API SOAP</h3>
          <p>São necessárias duas chamadas:</p>

          <h4>1. Autenticação — <code>AuthRequest</code></h4>
          <p>Envia e-mail e senha para o Zimbra. O servidor valida e retorna um <strong>token de autenticação</strong> (<code>authToken</code>).</p>
          <pre>
{`POST /service/soap/
Content-Type: text/xml

<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <AuthRequest xmlns="urn:zimbraAccount">
      <account by="name">gecav.semusa@portovelho.ro.gov.br</account>
      <password>********</password>
    </AuthRequest>
  </soap:Body>
</soap:Envelope>`}
          </pre>

          <h4>2. Envio — <code>SendMsgRequest</code></h4>
          <p>Usa o token para enviar o e-mail com HTML + texto alternativo.</p>
          <pre>
{`<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Header>
    <context xmlns="urn:zimbra">
      <authToken>TOKEN_AQUI</authToken>
    </context>
  </soap:Header>
  <soap:Body>
    <SendMsgRequest xmlns="urn:zimbraMail">
      <m>
        <e t="t" a="destinatario@email.com"/>
        <su>[SEMUSA] Cadastro CNES...</su>
        <mp ct="multipart/alternative">
          <mp ct="text/plain">
            <content>Prezado(a)...</content>
          </mp>
          <mp ct="text/html">
            <content><html>...</html></content>
          </mp>
        </mp>
      </m>
    </SendMsgRequest>
  </soap:Body>
</soap:Envelope>`}
          </pre>

          <div className="info-box">
            <strong>💡 Por que SOAP e não REST?</strong> O Zimbra foi criado antes do REST se popularizar. Sua API nativa é SOAP, que apesar de mais verbosa (XML), é extremamente estável e bem documentada.
          </div>
        </div>

        {/* 4. Arquitetura */}
        <div className="doc-section">
          <h2 className="doc-h2"><span className="step-num">4</span> Arquitetura do Sistema</h2>
          <p>O Vercel, onde o frontend React já estava hospedado, suporta <strong>Python Serverless Functions</strong> — funções que rodam sob demanda na nuvem. Basta criar um arquivo <code>.py</code> na pasta <code>api/</code> que o Vercel automaticamente o expõe como endpoint HTTP.</p>

          <h3>Estrutura de arquivos</h3>
          <pre>
{`monitoramento-cnes/
├── api/
│   └── send-email.py        ← Função Python (Zimbra SOAP)
├── requirements.txt          ← Vazio (built-in libraries)
├── vercel.json               ← Config atualizada (Python + Vite)
└── src/components/
    └── UnidadesSemCadastroModal.jsx  ← Frontend com fallback`}
          </pre>
        </div>

        {/* 5. Implementação */}
        <div className="doc-section">
          <h2 className="doc-h2"><span className="step-num">5</span> Implementação Técnica</h2>

          <h3>Variáveis de Ambiente (Vercel)</h3>
          <table>
            <thead>
              <tr><th>Variável</th><th>Valor</th><th>Finalidade</th></tr>
            </thead>
            <tbody>
              <tr><td><code>ZIMBRA_URL</code></td><td><code>https://webmail.portovelho.ro.gov.br</code></td><td>URL base do servidor Zimbra</td></tr>
              <tr><td><code>ZIMBRA_USERNAME</code></td><td><code>gecav.semusa@portovelho.ro.gov.br</code></td><td>Login para autenticação</td></tr>
              <tr><td><code>ZIMBRA_PASSWORD</code></td><td><code>********</code> (criptografada)</td><td>Senha do e-mail</td></tr>
              <tr><td><code>FROM_EMAIL</code></td><td><code>gecav.semusa@portovelho.ro.gov.br</code></td><td>Remetente do e-mail</td></tr>
              <tr><td><code>FROM_NAME</code></td><td><code>SEMUSA - Divisão de Controle e Avaliação do SUS</code></td><td>Nome exibido no remetente</td></tr>
            </tbody>
          </table>

          <h3>Funções do Python</h3>
          <table>
            <thead>
              <tr><th>Função</th><th>Descrição</th></tr>
            </thead>
            <tbody>
              <tr><td><code>_soap_request()</code></td><td>Envia XML SOAP para o Zimbra e retorna resposta parseada</td></tr>
              <tr><td><code>autenticar_zimbra()</code></td><td>Faz <code>AuthRequest</code> → retorna <code>authToken</code></td></tr>
              <tr><td><code>enviar_email_zimbra()</code></td><td>Faz <code>SendMsgRequest</code> com o token + HTML do e-mail</td></tr>
              <tr><td><code>build_html()</code></td><td>Gera template HTML institucional completo</td></tr>
              <tr><td><code>_check_soap_fault()</code></td><td>Verifica se resposta SOAP contém erro</td></tr>
              <tr><td><code>handler.do_POST()</code></td><td>Recebe POST do frontend e coordena o fluxo</td></tr>
            </tbody>
          </table>

          <h3>Fallback: Frontend React</h3>
          <p>No arquivo <code>UnidadesSemCadastroModal.jsx</code>, o envio ocorre em duas etapas:</p>
          <pre>
{`async function enviarComFallback(payload) {
  // 1. Tenta Zimbra primeiro
  try {
    return await tentarEnviarZimbra(payload);
  } catch (e) {
    // 2. Se falhar, usa Brevo (Gmail)
    return await tentarEnviarBrevo(payload);
  }
}`}
          </pre>
        </div>

        {/* 6. Código */}
        <div className="doc-section">
          <h2 className="doc-h2"><span className="step-num">6</span> Análise do Código</h2>
          <p>Principais decisões técnicas tomadas durante a implementação:</p>
          <table>
            <thead>
              <tr><th>Decisão</th><th>Motivo</th></tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>SOAP 1.1</strong></td>
                <td>Zimbras mais antigos (2005-2021) preferem SOAP 1.1. SOAP 1.2 poderia falhar silenciosamente</td>
              </tr>
              <tr>
                <td><strong>XML via <code>ElementTree</code></strong> (built-in)</td>
                <td>Evita dependências externas. Toda máquina Python tem ElementTree</td>
              </tr>
              <tr>
                <td><strong>Sem escape manual de HTML</strong></td>
                <td>O <code>ElementTree.text</code> já escapa automaticamente &lt;, &gt; e &amp; para XML</td>
              </tr>
              <tr>
                <td><strong><code>multipart/alternative</code></strong> com texto + HTML</td>
                <td>Garante legibilidade em qualquer cliente de e-mail</td>
              </tr>
              <tr>
                <td><strong>Timeout de 30s</strong></td>
                <td>Limite seguro para funções serverless sem estourar o tempo do Vercel</td>
              </tr>
              <tr>
                <td><strong>Auth token SEM cache</strong></td>
                <td>Autentica a cada requisição. Cache poderia expirar e causar erros silenciosos</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 7. Deploy */}
        <div className="doc-section">
          <h2 className="doc-h2"><span className="step-num">7</span> Deploy e Configuração</h2>
          <h3>Comandos executados</h3>
          <pre>
{`# 1. Link do projeto ao Vercel
vercel link --project monitoramento-cnes

# 2. Configurar variáveis de ambiente
vercel env add ZIMBRA_URL production
vercel env add ZIMBRA_USERNAME production
vercel env add ZIMBRA_PASSWORD production  ← criptografada
vercel env add FROM_EMAIL production
vercel env add FROM_NAME production

# 3. Deploy para produção
vercel deploy --prod --yes`}
          </pre>
        </div>

        {/* 8. Resultados */}
        <div className="doc-section">
          <h2 className="doc-h2"><span className="step-num">8</span> Resultados e Testes</h2>

          <div className="success-box">
            <strong>✅ Teste de Integração — SUCESSO!</strong><br /><br />
            Resposta da API Zimbra:<br />
            <code style={{ fontSize: '0.95em', background: 'transparent', color: '#155724', wordBreak: 'break-all' }}>
              {'{"success": true, "message": "E-mail enviado para teste@teste.com via Zimbra"}'}
            </code>
          </div>

          <h3>Benefícios da Solução</h3>
          <table>
            <thead>
              <tr><th></th><th>Benefício</th><th>Detalhes</th></tr>
            </thead>
            <tbody>
              <tr>
                <td><span className="status-dot green"></span></td>
                <td><strong>Domínio oficial</strong></td>
                <td>E-mails enviados de <code>gecav.semusa@portovelho.ro.gov.br</code> — sem SPAM</td>
              </tr>
              <tr>
                <td><span className="status-dot green"></span></td>
                <td><strong>Zero configuração de DNS</strong></td>
                <td>Usa a mesma autenticação do webmail (e-mail + senha)</td>
              </tr>
              <tr>
                <td><span className="status-dot green"></span></td>
                <td><strong>Sem dependências externas</strong></td>
                <td>Não precisa de Brevo, SendGrid, ou qualquer serviço terceiro</td>
              </tr>
              <tr>
                <td><span className="status-dot green"></span></td>
                <td><strong>Funciona de qualquer lugar</strong></td>
                <td>HTTPS na porta 443 — nunca bloqueada em firewalls</td>
              </tr>
              <tr>
                <td><span className="status-dot green"></span></td>
                <td><strong>Fallback automático</strong></td>
                <td>Se Zimbra falhar, usa Brevo (Gmail) como contingência</td>
              </tr>
              <tr>
                <td><span className="status-dot green"></span></td>
                <td><strong>Custo zero</strong></td>
                <td>Bibliotecas padrão Python + Vercel Hobby (grátis)</td>
              </tr>
            </tbody>
          </table>

          <h3>Stack Tecnológica Final</h3>
          <table>
            <thead>
              <tr><th>Tecnologia</th><th>Função</th></tr>
            </thead>
            <tbody>
              <tr><td>React 19 + Vite 8</td><td>Frontend da aplicação</td></tr>
              <tr><td>Tailwind CSS 4</td><td>Estilização</td></tr>
              <tr><td>Supabase</td><td>Banco de dados + Autenticação</td></tr>
              <tr><td>Python 3.12</td><td>Função Serverless (Zimbra SOAP)</td></tr>
              <tr><td>Vercel</td><td>Hospedagem (Frontend + API Python)</td></tr>
              <tr><td>Zimbra SOAP API</td><td>Envio de e-mails via servidor do governo</td></tr>
              <tr><td>Brevo API (fallback)</td><td>Contingência caso Zimbra esteja offline</td></tr>
            </tbody>
          </table>

          <div className="warn-box">
            <strong>⚠️ Recomendação de Segurança:</strong> A senha do e-mail <code>gecav.semusa@portovelho.ro.gov.br</code> foi utilizada durante a configuração. Recomenda-se trocá-la por uma nova após a conclusão da integração.
          </div>

          <div className="doc-footer">
            <p>
              Documentação gerada em Julho de 2026<br />
              SEMUSA — Secretaria Municipal de Saúde de Porto Velho/RO<br />
              Divisão de Controle e Avaliação do SUS (GECAV)
            </p>
          </div>
        </div>

      </div>
    </Modal>
  );
}
