export default function PrintFicha({ profissionais, unidade, dataEmissao, getCboDesc }) {
  if (!profissionais || profissionais.length === 0) return null;

  return (
    <div className="print-area" style={{ display: 'none' }}>
      {/* Header with logos */}
      <div className="print-header" style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '15px', borderBottom: '2px solid #003c7d', paddingBottom: '10px'
      }}>
        <div><img src="/logo_prefeitura.png" alt="Prefeitura" style={{ height: '55px' }} /></div>
        <div className="print-titulos" style={{ textAlign: 'center', flex: 1 }}>
          <h2 style={{ color: '#003c7d', fontSize: '16px', margin: 0, fontWeight: 'bold' }}>
            PREFEITURA DO MUNICÍPIO DE PORTO VELHO
          </h2>
          <h3 style={{ color: '#003c7d', fontSize: '12px', fontWeight: 'normal', margin: '2px 0' }}>
            SECRETARIA MUNICIPAL DE SAÚDE – SEMUSA
          </h3>
          <h3 style={{ color: '#003c7d', fontSize: '12px', fontWeight: 'normal', margin: '2px 0' }}>
            DIVISÃO DE CONTROLE E AVALIAÇÃO DO SUS
          </h3>
          <div className="print-titulo-bar" style={{
            background: '#003c7d', color: 'white', padding: '5px 0',
            fontWeight: 'bold', fontSize: '14px', textAlign: 'center', marginTop: '5px'
          }}>
            PLANILHA DE ATUALIZAÇÃO CADASTRAL DOS PROFISSIONAIS – CNES
          </div>
        </div>
        <div><img src="/logo_cnes.png" alt="CNES" style={{ height: '55px' }} /></div>
      </div>

      {/* Unit info */}
      <div className="print-unidade" style={{
        margin: '10px 0', fontSize: '13px', fontWeight: 'bold',
        borderBottom: '1px solid black', paddingBottom: '6px'
      }}>
        1. UNIDADE DE LOTAÇÃO<br />
        <span style={{ fontWeight: 'normal' }}>
          {unidade ? `${unidade.cnes} - ${unidade.nome_unidade}` : 'Todas as unidades'}
        </span>
        {dataEmissao && (
          <span style={{ float: 'right', fontWeight: 'normal', fontSize: '11px' }}>
            Emissão: {new Date(dataEmissao + 'T12:00:00').toLocaleDateString('pt-BR')}
          </span>
        )}
      </div>

      {/* Professionals table */}
      <div className="print-profissionais" style={{ marginTop: '8px' }}>
        <strong style={{ fontSize: '13px', display: 'block', marginBottom: '6px' }}>
          2. RELAÇÃO DOS PROFISSIONAIS
        </strong>
        <table style={{
          width: '100%', borderCollapse: 'collapse', fontSize: '9px', marginTop: '4px'
        }}>
          <thead>
            <tr>
              <th style={thStyle}>N°</th>
              <th style={thStyle}>Ação</th>
              <th style={thStyle}>Nome Completo</th>
              <th style={thStyle}>CPF</th>
              <th style={thStyle}>CBO</th>
              <th style={thStyle}>Conselho</th>
              <th style={thStyle}>N° Registro</th>
              <th style={thStyle}>UF</th>
              <th style={thStyle}>Cargo/Função</th>
              <th style={thStyle}>Tipo Vínculo</th>
              <th style={thStyle}>C.H.</th>
              <th style={thStyle}>Setor/Equipe</th>
            </tr>
          </thead>
          <tbody>
            {profissionais.map((p, index) => (
              <tr key={p.id}>
                <td style={tdStyle}>{index + 1}</td>
                <td style={tdStyle}>Inclusão</td>
                <td style={tdStyle}>{p.nome_profissional || ''}</td>
                <td style={tdStyle}>{p.cpf || ''}</td>
                <td style={tdStyle}>{getCboDesc ? getCboDesc(p.cbo) : p.cbo || ''}</td>
                <td style={tdStyle}>{p.conselho || ''}</td>
                <td style={tdStyle}>{p.registro || ''}</td>
                <td style={tdStyle}>{p.uf_conselho || ''}</td>
                <td style={tdStyle}>{p.cargo_funcao || ''}</td>
                <td style={tdStyle}>{p.tipo_vinculo || ''}</td>
                <td style={tdStyle}>{p.carga_horaria || ''}</td>
                <td style={tdStyle}>{p.setor_equipe || ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="print-rodape" style={{
        marginTop: '25px', fontSize: '10px', textAlign: 'center',
        borderTop: '1px solid #ccc', paddingTop: '12px', color: '#333'
      }}>
        <p style={{ margin: '3px 0', lineHeight: 1.4 }}>Desenvolvido por Cristian Marques</p>
        <p style={{ margin: '3px 0', lineHeight: 1.4 }}>SEMUSA - Secretaria Municipal de Saúde de Porto Velho</p>
        <p style={{ margin: '3px 0', lineHeight: 1.4, fontSize: '9px', color: '#555' }}>
          Avenida Campos Sales, 2283 - Centro - Porto Velho/RO - CEP: 76804-358
        </p>
        <p style={{ margin: '3px 0', lineHeight: 1.4, fontSize: '9px', color: '#555' }}>
          Telefone: (69) 3901-6126 | E-mail: gecav.semusa@portovelho.ro.gov.br
        </p>
        <p style={{ margin: '6px 0 0', lineHeight: 1.4, fontSize: '9px', color: '#777' }}>
          © 2026 - Todos os direitos reservados
        </p>
      </div>
    </div>
  );
}

const thStyle = {
  background: '#dbe5f1',
  border: '1px solid black',
  padding: '4px 3px',
  textAlign: 'center',
  fontWeight: 'bold',
  fontSize: '8.5px',
  whiteSpace: 'nowrap'
};

const tdStyle = {
  border: '1px solid black',
  padding: '3px 3px',
  textAlign: 'center',
  fontSize: '8.5px',
  wordBreak: 'break-word'
};
