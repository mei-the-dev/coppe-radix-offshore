import { useState } from 'react';
import './MetricsReport.css';
import { Card } from '../display';
import { Badge } from '../display';
import { IconDatabase, IconTrendingUp, IconAlertCircle, IconInfo, IconVessel, IconPort } from '../../assets/icons';

interface MetricsReportProps {}

export default function MetricsReport({}: MetricsReportProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    'executive-summary': true,
    'architecture': true,
    'operational-data': false,
    'cargo-modeling': false,
    'operational-constraints': false,
    'costs': false,
    'ai-integration': false,
    'optimization': false,
    'gaps': false,
    'conclusions': false,
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <div className="metrics-report">
      <div className="metrics-header">
        <h1>Relatório Analítico: Sistema de Dados para Otimização Logística Offshore da PRIO</h1>
        <p className="metrics-subtitle">
          Análise da estrutura de dados consolidada para modelagem matemática da logística offshore
        </p>
        <div className="metrics-meta">
          <Badge variant="info" size="sm">Versão 1.0</Badge>
          <Badge variant="info" size="sm">Janeiro 2026</Badge>
          <Badge variant="info" size="sm">25+ páginas</Badge>
        </div>
      </div>

      {/* SUMÁRIO EXECUTIVO */}
      <Card className="metrics-section">
        <div
          className="metrics-section-header"
          onClick={() => toggleSection('executive-summary')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && toggleSection('executive-summary')}
        >
          <div className="metrics-section-title">
            <IconInfo size={24} />
            <h2>SUMÁRIO EXECUTIVO</h2>
          </div>
          <span className="metrics-section-toggle">
            {expandedSections['executive-summary'] ? '▼' : '▶'}
          </span>
        </div>

        {expandedSections['executive-summary'] && (
          <div className="metrics-section-content">
            <p>Este relatório analisa a estrutura de dados consolidada para modelagem matemática da logística offshore da PRIO S.A., integrando três fontes principais: inventário de dados operacionais, contexto empresarial detalhado e esquema de banco de dados PostgreSQL.</p>

            <div className="highlights-grid">
              <div className="highlight-card">
                <strong>14 categorias principais</strong> de dados estruturados cobrindo toda cadeia logística
              </div>
              <div className="highlight-card">
                <strong>Schema de banco de dados</strong> com 40+ tabelas inter-relacionadas
              </div>
              <div className="highlight-card">
                <strong>Portfolio operacional</strong> de 4 FPSOs e múltiplas plataformas fixas
              </div>
              <div className="highlight-card">
                <strong>Produção projetada 2026:</strong> ~200.000-215.000 bpd
              </div>
              <div className="highlight-card">
                <strong>Investimento em contratos marítimos:</strong> ~$100 milhões (Solstad Offshore)
              </div>
              <div className="highlight-card">
                <strong>Inovação tecnológica:</strong> IA preditiva implementada em todas unidades (Shape Digital)
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* 1. ARQUITETURA DO SISTEMA DE DADOS */}
      <Card className="metrics-section">
        <div
          className="metrics-section-header"
          onClick={() => toggleSection('architecture')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && toggleSection('architecture')}
        >
          <div className="metrics-section-title">
            <IconDatabase size={24} />
            <h2>1. ARQUITETURA DO SISTEMA DE DADOS</h2>
          </div>
          <span className="metrics-section-toggle">
            {expandedSections['architecture'] ? '▼' : '▶'}
          </span>
        </div>

        {expandedSections['architecture'] && (
          <div className="metrics-section-content">
            <div className="metrics-subsection">
              <h3>1.1 Visão Geral da Estrutura</h3>
              <p>O sistema de dados está organizado em <strong>7 domínios principais</strong>, refletindo a arquitetura do schema PostgreSQL:</p>

              <div className="domain-flow">
                <div className="domain-box">DOMÍNIO DE REDE<br/>Bases de suprimento, Instalações offshore, Matriz de distâncias</div>
                <div className="flow-arrow">↓</div>
                <div className="domain-box">DOMÍNIO DE FROTA<br/>Embarcações, Compartimentos, Cronogramas</div>
                <div className="flow-arrow">↓</div>
                <div className="domain-box">DOMÍNIO DE CARGAS<br/>15+ tipos de carga, Perfis de consumo, Demandas</div>
                <div className="flow-arrow">↓</div>
                <div className="domain-box">DOMÍNIO DE OPERAÇÕES<br/>Viagens, Manifestos, Janelas operacionais</div>
                <div className="flow-arrow">↓</div>
                <div className="domain-box">DOMÍNIO AMBIENTAL<br/>Previsões meteorológicas, Padrões sazonais</div>
                <div className="flow-arrow">↓</div>
                <div className="domain-box">DOMÍNIO DE CUSTOS<br/>Charter, Combustível, Penalidades</div>
                <div className="flow-arrow">↓</div>
                <div className="domain-box">DOMÍNIO DE OTIMIZAÇÃO<br/>Execuções de modelos, KPIs, Soluções</div>
              </div>
            </div>

            <div className="metrics-subsection">
              <h3>1.2 Tecnologias e Extensões</h3>
              <div className="tech-grid">
                <div className="tech-card">
                  <h4>PostGIS</h4>
                  <p>Dados geográficos com índices GIST para cálculos espaciais eficientes</p>
                  <ul>
                    <li>Coordenadas de bases e instalações (WGS84)</li>
                    <li>Cálculos de distância e rotas</li>
                    <li>Posicionamento atual de embarcações</li>
                  </ul>
                </div>
                <div className="tech-card">
                  <h4>TimescaleDB</h4>
                  <p>Séries temporais para dados meteorológicos</p>
                  <ul>
                    <li>Chunks de 7 dias para otimização</li>
                    <li>Previsões com múltiplos horizontes</li>
                    <li>Retenção e agregação automática</li>
                  </ul>
                </div>
                <div className="tech-card">
                  <h4>pg_trgm</h4>
                  <p>Busca textual fuzzy para nomes de embarcações e instalações</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* 2. DADOS OPERACIONAIS CONSOLIDADOS */}
      <Card className="metrics-section">
        <div
          className="metrics-section-header"
          onClick={() => toggleSection('operational-data')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && toggleSection('operational-data')}
        >
          <div className="metrics-section-title">
            <IconPort size={24} />
            <h2>2. DADOS OPERACIONAIS CONSOLIDADOS</h2>
          </div>
          <span className="metrics-section-toggle">
            {expandedSections['operational-data'] ? '▼' : '▶'}
          </span>
        </div>

        {expandedSections['operational-data'] && (
          <div className="metrics-section-content">
            <div className="metrics-subsection">
              <h3>2.1 Infraestrutura de Rede</h3>
              <h4>Porto do Açu - Hub Logístico Central</h4>

              <div className="table-container">
                <table className="metrics-table">
                  <thead>
                    <tr>
                      <th>Parâmetro</th>
                      <th>Valor</th>
                      <th>Implicação Operacional</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Calado máximo</td>
                      <td>7,9 m</td>
                      <td>Limita classe de PSV</td>
                    </tr>
                    <tr>
                      <td>Comprimento máximo</td>
                      <td>97 m</td>
                      <td>Restringe large PSVs</td>
                    </tr>
                    <tr>
                      <td>Capacidade deadweight</td>
                      <td>5.513 t</td>
                      <td>Limite de carga</td>
                    </tr>
                    <tr>
                      <td>Operação</td>
                      <td>24/7</td>
                      <td>Flexibilidade total</td>
                    </tr>
                    <tr>
                      <td>Turnaround time</td>
                      <td>6-12h (média 8h)</td>
                      <td>Planejamento de viagens</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="info-box">
                <h4>Custos Portuários (por chamada):</h4>
                <ul>
                  <li>Mínimo: $4.000</li>
                  <li>Típico: $6.500-8.500</li>
                  <li>Máximo: $12.000+</li>
                </ul>
              </div>

              <h4>Matriz de Distâncias - Rede Offshore</h4>
              <div className="table-container">
                <table className="metrics-table">
                  <thead>
                    <tr>
                      <th>Rota</th>
                      <th>Distância (NM)</th>
                      <th>Tempo @12kt</th>
                      <th>Tempo @14kt</th>
                      <th>Custo Combustível*</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Porto do Açu → Peregrino</td>
                      <td>46</td>
                      <td>3,8h</td>
                      <td>3,3h</td>
                      <td>$4.680-6.240</td>
                    </tr>
                    <tr>
                      <td>Porto do Açu → Polvo/Bravo</td>
                      <td>70</td>
                      <td>5,8h</td>
                      <td>5,0h</td>
                      <td>$6.300-8.400</td>
                    </tr>
                    <tr>
                      <td>Porto do Açu → Valente (Frade)</td>
                      <td>67</td>
                      <td>5,6h</td>
                      <td>4,8h</td>
                      <td>$5.820-7.760</td>
                    </tr>
                    <tr>
                      <td>Porto do Açu → Forte (Albacora)</td>
                      <td>75</td>
                      <td>6,3h</td>
                      <td>5,4h</td>
                      <td>$6.300-8.400</td>
                    </tr>
                    <tr>
                      <td>Peregrino ↔ Polvo</td>
                      <td>15</td>
                      <td>1,3h</td>
                      <td>1,1h</td>
                      <td>Consolidação</td>
                    </tr>
                    <tr>
                      <td>Polvo ↔ Bravo</td>
                      <td>5,9</td>
                      <td>0,5h</td>
                      <td>0,4h</td>
                      <td>Tieback</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="table-note">*Valores para viagem roundtrip, PSV padrão</p>
            </div>

            <div className="metrics-subsection">
              <h3>2.2 Portfolio de Instalações</h3>
              <div className="installations-grid">
                <div className="installation-card">
                  <h4>FPSO Bravo (Tubarão Martelo)</h4>
                  <ul>
                    <li>Produção: 15.000-16.000 boe/d</li>
                    <li>Armazenamento: ~600.000 barris</li>
                    <li>Distância: 70 NM de Porto do Açu</li>
                    <li>Viagens: 2-3/semana (normal), 3-4/semana (perfuração)</li>
                  </ul>
                </div>
                <div className="installation-card">
                  <h4>FPSO Valente (Frade + Wahoo)</h4>
                  <ul>
                    <li>Produção atual: 38.300 bpd (Frade)</li>
                    <li>Produção adicional 2026: ~40.000 bpd (Wahoo)</li>
                    <li>Capacidade: 100.000 bpd</li>
                    <li>Armazenamento: 1,6 milhões barris</li>
                  </ul>
                </div>
                <div className="installation-card">
                  <h4>FPSO Forte (Albacora Leste)</h4>
                  <ul>
                    <li>Capacidade: 180.000 bpd processamento</li>
                    <li>Produção atual: 22.000 bpd</li>
                    <li>Armazenamento: &gt;1 milhão barris</li>
                    <li>Viagens requeridas: 3/semana</li>
                  </ul>
                </div>
                <div className="installation-card">
                  <h4>Complexo Peregrino</h4>
                  <ul>
                    <li>Produção total: ~100.000 bpd</li>
                    <li>Share PRIO: 38.200 bpd (40%, aumentando para 100%)</li>
                    <li>Infraestrutura: 4 instalações</li>
                    <li>Distância: 46 NM de Porto do Açu</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="metrics-subsection">
              <h3>2.3 Frota de Embarcações</h3>
              <p><strong>Contratos Solstad (~$100M combinados):</strong></p>
              <div className="fleet-grid">
                <div className="fleet-card">
                  <h4>CSV Normand Pioneer</h4>
                  <p>Charter: $35.000-50.000/dia</p>
                  <p>Deck cargo: 3.500-4.500 t</p>
                </div>
                <div className="fleet-card">
                  <h4>WSV Normand Carioca</h4>
                  <p>Charter: $25.000-35.000/dia</p>
                  <p>Contrato até: Dezembro 2027</p>
                </div>
                <div className="fleet-card">
                  <h4>PSV Padrão (UT 755)</h4>
                  <p>Charter: $8.000-15.000/dia</p>
                  <p>Deck cargo: 2.450 t</p>
                  <p>4-6 embarcações</p>
                </div>
                <div className="fleet-card">
                  <h4>PSV Grande (UT 874)</h4>
                  <p>Charter: $12.000-25.000/dia</p>
                  <p>Deck cargo: 2.800-3.200 t</p>
                  <p>2-3 embarcações</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* 3. MODELAGEM DE CARGAS E DEMANDA */}
      <Card className="metrics-section">
        <div
          className="metrics-section-header"
          onClick={() => toggleSection('cargo-modeling')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && toggleSection('cargo-modeling')}
        >
          <div className="metrics-section-title">
            <IconVessel size={24} />
            <h2>3. MODELAGEM DE CARGAS E DEMANDA</h2>
          </div>
          <span className="metrics-section-toggle">
            {expandedSections['cargo-modeling'] ? '▼' : '▶'}
          </span>
        </div>

        {expandedSections['cargo-modeling'] && (
          <div className="metrics-section-content">
            <div className="metrics-subsection">
              <h3>3.1 Catálogo de Cargas (15+ tipos)</h3>
              <div className="cargo-categories">
                <div className="cargo-category">
                  <h4>A. Cargas Líquidas</h4>
                  <ul>
                    <li><strong>Diesel Marítimo:</strong> Densidade 850 kg/m³, Estoque segurança ANP: 48h</li>
                    <li><strong>Água Potável:</strong> Segregação crítica - Incompatível com TODOS outros líquidos</li>
                    <li><strong>Lama de Perfuração:</strong> OBM (1.200-1.400 kg/m³), WBM (1.100-1.300 kg/m³)</li>
                    <li><strong>Metanol:</strong> Maior tempo limpeza: 8 horas (de/para qualquer outro líquido)</li>
                  </ul>
                </div>
                <div className="cargo-category">
                  <h4>B. Cargas de Granel Seco</h4>
                  <ul>
                    <li><strong>Cimento:</strong> Densidade 1.500 kg/m³, Sistema pneumático (50-100 m³/h)</li>
                    <li><strong>Barita:</strong> Densidade 2.500-4.200 kg/m³ (limitação por peso!)</li>
                    <li><strong>Bentonita:</strong> Densidade 600-800 kg/m³</li>
                  </ul>
                </div>
                <div className="cargo-category">
                  <h4>C. Carga de Convés</h4>
                  <ul>
                    <li><strong>Tubos de Perfuração:</strong> 5-15 t/tubo, Carga típica: 200-800 t/viagem</li>
                    <li><strong>Containers ISO:</strong> 20 ft: 10-15 t, 40 ft: 15-20 t</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="metrics-subsection">
              <h3>3.3 Matriz de Compatibilidade</h3>
              <p>Tabela <code>cargo_incompatibility</code> define tempos de limpeza:</p>
              <div className="table-container">
                <table className="metrics-table compatibility-table">
                  <thead>
                    <tr>
                      <th></th>
                      <th>Diesel</th>
                      <th>Água</th>
                      <th>OBM</th>
                      <th>WBM</th>
                      <th>Metanol</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><strong>Diesel</strong></td>
                      <td>0</td>
                      <td>4</td>
                      <td>0</td>
                      <td>2</td>
                      <td>8</td>
                    </tr>
                    <tr>
                      <td><strong>Água</strong></td>
                      <td>4</td>
                      <td>0</td>
                      <td>6</td>
                      <td>4</td>
                      <td>8</td>
                    </tr>
                    <tr>
                      <td><strong>OBM</strong></td>
                      <td>0</td>
                      <td>6</td>
                      <td>0</td>
                      <td>6</td>
                      <td>8</td>
                    </tr>
                    <tr>
                      <td><strong>WBM</strong></td>
                      <td>2</td>
                      <td>4</td>
                      <td>6</td>
                      <td>0</td>
                      <td>8</td>
                    </tr>
                    <tr>
                      <td><strong>Metanol</strong></td>
                      <td>8</td>
                      <td>8</td>
                      <td>8</td>
                      <td>8</td>
                      <td>0</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p><strong>Implicações:</strong> Metanol requer sempre 8 horas limpeza. Diesel e Base Oil são compatíveis (0 horas). Água é crítica (4-6 horas de/para maioria).</p>
            </div>
          </div>
        )}
      </Card>

      {/* 4. RESTRIÇÕES OPERACIONAIS E AMBIENTAIS */}
      <Card className="metrics-section">
        <div
          className="metrics-section-header"
          onClick={() => toggleSection('operational-constraints')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && toggleSection('operational-constraints')}
        >
          <div className="metrics-section-title">
            <IconAlertCircle size={24} />
            <h2>4. RESTRIÇÕES OPERACIONAIS E AMBIENTAIS</h2>
          </div>
          <span className="metrics-section-toggle">
            {expandedSections['operational-constraints'] ? '▼' : '▶'}
          </span>
        </div>

        {expandedSections['operational-constraints'] && (
          <div className="metrics-section-content">
            <div className="metrics-subsection">
              <h3>4.1 Limites Climáticos por Operação</h3>
              <div className="table-container">
                <table className="metrics-table">
                  <thead>
                    <tr>
                      <th>Operação</th>
                      <th>Hs máx</th>
                      <th>Vento máx</th>
                      <th>Corrente máx</th>
                      <th>Visibilidade mín</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Carregamento líquidos (porto)</td>
                      <td>2,0m</td>
                      <td>20 m/s</td>
                      <td>1,5 kt</td>
                      <td>0,5 NM</td>
                    </tr>
                    <tr>
                      <td><strong>Trânsito PSV</strong></td>
                      <td><strong>4,5m</strong></td>
                      <td><strong>30 m/s</strong></td>
                      <td>-</td>
                      <td><strong>0,5 NM</strong></td>
                    </tr>
                    <tr>
                      <td><strong>Granel seco</strong></td>
                      <td><strong>2,5m</strong></td>
                      <td><strong>15 m/s</strong></td>
                      <td><strong>2,0 kt</strong></td>
                      <td>-</td>
                    </tr>
                    <tr>
                      <td><strong>Operações guindaste</strong></td>
                      <td><strong>2,5m</strong></td>
                      <td><strong>15 m/s</strong></td>
                      <td><strong>2,0 kt</strong></td>
                      <td><strong>1,0 NM</strong></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="metrics-subsection">
              <h3>4.2 Estatísticas Climáticas - Bacia de Campos</h3>
              <div className="weather-stats">
                <div className="weather-stat-card">
                  <h4>Distribuição Anual de Hs</h4>
                  <ul>
                    <li><strong>Hs &lt;2m:</strong> 50-60% do tempo (condições boas)</li>
                    <li><strong>Hs 2-3m:</strong> 25-30% (moderadas)</li>
                    <li><strong>Hs 3-4m:</strong> 10-15% (ruins)</li>
                    <li><strong>Hs &gt;4m:</strong> 5-10% (severas, operações suspensas)</li>
                  </ul>
                </div>
                <div className="weather-stat-card">
                  <h4>Variação Sazonal</h4>
                  <ul>
                    <li><strong>Verão (Dez-Mar):</strong> Hs média 1,5-2,0 m, Workability ~65%</li>
                    <li><strong>Inverno (Jun-Ago):</strong> Hs média 2,0-2,5 m, Workability ~40%</li>
                    <li><strong>Transição:</strong> Hs média 1,8-2,2 m, Workability ~55%</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* 5. ESTRUTURA DE CUSTOS */}
      <Card className="metrics-section">
        <div
          className="metrics-section-header"
          onClick={() => toggleSection('costs')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && toggleSection('costs')}
        >
          <div className="metrics-section-title">
            <IconTrendingUp size={24} />
            <h2>5. ESTRUTURA DE CUSTOS E ECONOMIA OPERACIONAL</h2>
          </div>
          <span className="metrics-section-toggle">
            {expandedSections['costs'] ? '▼' : '▶'}
          </span>
        </div>

        {expandedSections['costs'] && (
          <div className="metrics-section-content">
            <div className="metrics-subsection">
              <h3>5.1 Hierarquia de Custos</h3>
              <div className="cost-hierarchy">
                <div className="cost-level">CUSTO TOTAL DE VIAGEM</div>
                <div className="cost-branch">
                  <div className="cost-item">CUSTOS FIXOS (Charter)</div>
                  <div className="cost-detail">Standard PSV: $8.000-15.000/dia</div>
                  <div className="cost-detail">Large PSV DP2: $12.000-22.000/dia</div>
                  <div className="cost-detail">CSV: $35.000-50.000/dia</div>
                </div>
                <div className="cost-branch">
                  <div className="cost-item">CUSTOS VARIÁVEIS (Combustível)</div>
                  <div className="cost-detail">MGO: $600-800/tonelada</div>
                  <div className="cost-detail">Trânsito: 15-22 t/dia</div>
                </div>
                <div className="cost-branch">
                  <div className="cost-item">CUSTOS PORTUÁRIOS (Porto do Açu)</div>
                  <div className="cost-detail">TOTAL: $4.000-12.000/chamada</div>
                </div>
                <div className="cost-branch">
                  <div className="cost-item">CUSTOS OFFSHORE</div>
                  <div className="cost-detail">TOTAL: $1.500-5.500/viagem</div>
                </div>
                <div className="cost-branch highlight">
                  <div className="cost-item">PENALIDADES</div>
                  <div className="cost-detail">Perda produção: <strong>$218.600/hora</strong> (rede total)</div>
                </div>
              </div>
            </div>

            <div className="metrics-subsection">
              <h3>5.3 Custo de Perda de Produção - O Maior Risco</h3>
              <div className="production-loss-card highlight">
                <h4>Perda de Produção por Stockout de Diesel/Água</h4>
                <div className="table-container">
                  <table className="metrics-table">
                    <thead>
                      <tr>
                        <th>Instalação</th>
                        <th>Produção (bpd)</th>
                        <th>Perda Diária</th>
                        <th>Perda Horária</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>FPSO Valente</td>
                        <td>38.300</td>
                        <td>$1.838.400</td>
                        <td>$76.600</td>
                      </tr>
                      <tr>
                        <td>FPSO Forte</td>
                        <td>22.000</td>
                        <td>$1.056.000</td>
                        <td>$44.000</td>
                      </tr>
                      <tr>
                        <td>FPSO Peregrino</td>
                        <td>38.200</td>
                        <td>$1.833.600</td>
                        <td>$76.400</td>
                      </tr>
                      <tr>
                        <td>Cluster Polvo/TBMT</td>
                        <td>10.800</td>
                        <td>$518.400</td>
                        <td>$21.600</td>
                      </tr>
                      <tr className="total-row">
                        <td><strong>REDE TOTAL</strong></td>
                        <td><strong>~109.300</strong></td>
                        <td><strong>$5.246.400</strong></td>
                        <td><strong>$218.600</strong></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="critical-note">
                  <p><strong>Implicação crítica:</strong> Custo de stockout &gt;&gt; Custo de entrega</p>
                  <p>Uma única hora de parada de produção ($218.600) equivale a:</p>
                  <ul>
                    <li>10 viagens completas para Peregrino</li>
                    <li>7 viagens para Albacora Leste</li>
                    <li>5 viagens de campanha de perfuração</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="metrics-subsection">
              <h3>5.4 Schema de Custos</h3>
              <div className="code-block">
                <pre><code>{`CREATE TABLE cost_structures (
    vessel_id VARCHAR(50),
    effective_from DATE,
    effective_to DATE,
    charter_rate_daily_usd DECIMAL(12,2),
    fuel_price_per_tonne_usd DECIMAL(10,2),
    ...
)`}</code></pre>
              </div>
              <p>Permite histórico de preços, contratos com datas de validade, cenários de sensibilidade</p>
            </div>
          </div>
        )}
      </Card>

      {/* 6. INTEGRAÇÃO COM IA */}
      <Card className="metrics-section">
        <div
          className="metrics-section-header"
          onClick={() => toggleSection('ai-integration')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && toggleSection('ai-integration')}
        >
          <div className="metrics-section-title">
            <IconTrendingUp size={24} />
            <h2>6. INTEGRAÇÃO COM IA E INOVAÇÃO TECNOLÓGICA</h2>
          </div>
          <span className="metrics-section-toggle">
            {expandedSections['ai-integration'] ? '▼' : '▶'}
          </span>
        </div>

        {expandedSections['ai-integration'] && (
          <div className="metrics-section-content">
            <div className="metrics-subsection">
              <h3>6.1 Plataforma Shape Digital</h3>
              <p>Em outubro de 2025, PRIO implementou sistema de IA preditiva da Shape Digital em <strong>todas as unidades</strong>:</p>

              <div className="info-box">
                <h4>Shape Lighthouse Platform:</h4>
                <ul>
                  <li><strong>200+ modelos</strong> de predição de falhas</li>
                  <li>Maior biblioteca de algoritmos offshore do setor</li>
                  <li>Manutenção preditiva para ativos críticos</li>
                  <li>Detecção proativa de anomalias</li>
                </ul>
              </div>

              <div className="metrics-grid">
                <div className="metric-card">
                  <h4>Deployment</h4>
                  <ul>
                    <li>FPSO Forte (Albacora Leste)</li>
                    <li>FPSO Valente (Frade)</li>
                    <li>FPSO Bravo (Tubarão Martelo)</li>
                    <li>Plataforma Polvo A</li>
                  </ul>
                </div>
                <div className="metric-card">
                  <h4>Benefícios</h4>
                  <ul>
                    <li>Redução de downtime não planejado</li>
                    <li>Otimização de cronogramas de manutenção</li>
                    <li>Melhor planejamento logístico (menos emergências)</li>
                    <li>Redução de risco de vazamentos</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="metrics-subsection">
              <h3>6.2 Implicações para Modelo Logístico</h3>
              <p>A IA preditiva <strong>afeta diretamente</strong> a modelagem logística:</p>
              <ol>
                <li>
                  <strong>Redução de Demandas Emergenciais</strong>
                  <ul>
                    <li>Histórico: 1-3 emergências/semana</li>
                    <li>Esperado: Redução de 30-50% com manutenção preditiva</li>
                  </ul>
                </li>
                <li>
                  <strong>Maior Previsibilidade de Manutenção</strong>
                  <ul>
                    <li>Janelas de manutenção planejadas com antecedência</li>
                    <li>Sincronização com campanhas de suprimento</li>
                  </ul>
                </li>
                <li>
                  <strong>Integração Potencial</strong>
                  <ul>
                    <li>API Shape Digital → Sistema logístico</li>
                    <li>Previsões de manutenção → Input para IRP</li>
                  </ul>
                </li>
              </ol>
            </div>
          </div>
        )}
      </Card>

      {/* 7. DOMÍNIO DE OTIMIZAÇÃO */}
      <Card className="metrics-section">
        <div
          className="metrics-section-header"
          onClick={() => toggleSection('optimization')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && toggleSection('optimization')}
        >
          <div className="metrics-section-title">
            <IconTrendingUp size={24} />
            <h2>7. DOMÍNIO DE OTIMIZAÇÃO - FRAMEWORK DE MODELAGEM</h2>
          </div>
          <span className="metrics-section-toggle">
            {expandedSections['optimization'] ? '▼' : '▶'}
          </span>
        </div>

        {expandedSections['optimization'] && (
          <div className="metrics-section-content">
            <div className="metrics-subsection">
              <h3>7.1 Arquitetura de Otimização</h3>
              <p>O schema define estrutura completa para <strong>execução e análise</strong> de modelos matemáticos:</p>
              <div className="tree-diagram">
                <div className="tree-node">CICLO DE OTIMIZAÇÃO</div>
                <div className="tree-branch">
                  <div className="tree-node">1. OPTIMIZATION_RUNS</div>
                  <div className="tree-leaf">Horizonte de planejamento, Solver utilizado, Status</div>
                </div>
                <div className="tree-branch">
                  <div className="tree-node">2. OPTIMIZATION_SCENARIOS</div>
                  <div className="tree-leaf">Cenários "what-if", Parâmetros variados</div>
                </div>
                <div className="tree-branch">
                  <div className="tree-node">3. SOLUTIONS</div>
                  <div className="tree-leaf">Custo total, Distância total, Utilização de frota</div>
                </div>
                <div className="tree-branch">
                  <div className="tree-node">4. SOLUTION_TRIPS</div>
                </div>
                <div className="tree-branch">
                  <div className="tree-node">5. UNMET_DEMANDS</div>
                </div>
                <div className="tree-branch">
                  <div className="tree-node">6. KPIs</div>
                  <div className="tree-leaf">Utilização de frota, On-time delivery rate, etc.</div>
                </div>
              </div>
            </div>

            <div className="metrics-subsection">
              <h3>7.4 KPIs de Performance</h3>
              <div className="table-container">
                <table className="metrics-table">
                  <thead>
                    <tr>
                      <th>KPI</th>
                      <th>Fórmula/Definição</th>
                      <th>Meta Típica</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><strong>Vessel Utilization</strong></td>
                      <td>Tempo produtivo / Tempo total</td>
                      <td>75-85%</td>
                    </tr>
                    <tr>
                      <td><strong>On-Time Delivery Rate</strong></td>
                      <td>Entregas no prazo / Total entregas</td>
                      <td>&gt;95%</td>
                    </tr>
                    <tr>
                      <td><strong>Cost per Tonne</strong></td>
                      <td>Custo total / Toneladas entregues</td>
                      <td>$80-120/t</td>
                    </tr>
                    <tr>
                      <td><strong>Fuel Efficiency</strong></td>
                      <td>Toneladas fuel / NM percorridas</td>
                      <td>&lt;0,15 t/NM</td>
                    </tr>
                    <tr>
                      <td><strong>Weather Delay Rate</strong></td>
                      <td>Horas atraso clima / Horas totais</td>
                      <td>&lt;10%</td>
                    </tr>
                    <tr>
                      <td><strong>Emergency Response Time</strong></td>
                      <td>Tempo médio resposta emergência</td>
                      <td>&lt;8 horas</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* 8. ANÁLISE DE GAPS */}
      <Card className="metrics-section">
        <div
          className="metrics-section-header"
          onClick={() => toggleSection('gaps')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && toggleSection('gaps')}
        >
          <div className="metrics-section-title">
            <IconAlertCircle size={24} />
            <h2>8. ANÁLISE DE GAPS E RECOMENDAÇÕES</h2>
          </div>
          <span className="metrics-section-toggle">
            {expandedSections['gaps'] ? '▼' : '▶'}
          </span>
        </div>

        {expandedSections['gaps'] && (
          <div className="metrics-section-content">
            <div className="metrics-subsection">
              <h3>8.1 Dados Completos vs. Templates de Coleta</h3>
              <div className="table-container">
                <table className="metrics-table">
                  <thead>
                    <tr>
                      <th>Categoria</th>
                      <th>Status</th>
                      <th>Gap</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><strong>Distâncias e Rotas</strong></td>
                      <td><Badge variant="success" size="sm">✅ Completo</Badge></td>
                      <td>9 rotas principais documentadas</td>
                    </tr>
                    <tr>
                      <td><strong>Instalações</strong></td>
                      <td><Badge variant="warning" size="sm">⚠️ Parcial</Badge></td>
                      <td>Consumos especificados, faltam capacidades exatas</td>
                    </tr>
                    <tr>
                      <td><strong>Frota</strong></td>
                      <td><Badge variant="warning" size="sm">⚠️ Estimado</Badge></td>
                      <td>Composição estimada, faltam especificações exatas</td>
                    </tr>
                    <tr>
                      <td><strong>Tipos de Carga</strong></td>
                      <td><Badge variant="success" size="sm">✅ Completo</Badge></td>
                      <td>15+ tipos catalogados com detalhes</td>
                    </tr>
                    <tr>
                      <td><strong>Custos</strong></td>
                      <td><Badge variant="success" size="sm">✅ Completo</Badge></td>
                      <td>Estrutura detalhada com ranges de mercado</td>
                    </tr>
                    <tr>
                      <td><strong>Clima</strong></td>
                      <td><Badge variant="success" size="sm">✅ Completo</Badge></td>
                      <td>Estatísticas históricas e limites operacionais</td>
                    </tr>
                    <tr>
                      <td><strong>Demanda</strong></td>
                      <td><Badge variant="warning" size="sm">⚠️ Parcial</Badge></td>
                      <td>Padrões gerais, faltam 12 meses histórico real</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="metrics-subsection">
              <h3>8.2 Prioridades de Coleta de Dados</h3>

              <div className="priority-section">
                <h4 className="priority-critical">PRIORIDADE 1 - CRÍTICO</h4>
                <p className="priority-description">Sem isso, modelo não funciona</p>
                <ol>
                  <li>Capacidades exatas de armazenamento por instalação e carga</li>
                  <li>Níveis atuais de inventário</li>
                  <li>Especificações exatas da frota contratada</li>
                  <li>Taxas de charter confirmadas</li>
                </ol>
              </div>

              <div className="priority-section">
                <h4 className="priority-high">PRIORIDADE 2 - ALTA</h4>
                <p className="priority-description">Melhora significativamente o modelo</p>
                <ol start={5}>
                  <li>Histórico de consumo (12 meses)</li>
                  <li>Histórico de viagens (6-12 meses)</li>
                  <li>Cronograma de campanhas de perfuração 2026</li>
                  <li>Previsões meteorológicas operacionais</li>
                </ol>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* 9. CONCLUSÕES – card commented out
      <Card className="metrics-section">
        <div
          className="metrics-section-header"
          onClick={() => toggleSection('conclusions')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && toggleSection('conclusions')}
        >
          <div className="metrics-section-title">
            <IconInfo size={24} />
            <h2>9. CONCLUSÕES E PRÓXIMOS PASSOS</h2>
          </div>
          <span className="metrics-section-toggle">
            {expandedSections['conclusions'] ? '▼' : '▶'}
          </span>
        </div>

        {expandedSections['conclusions'] && (
          <div className="metrics-section-content">
            <div className="metrics-subsection">
              <h3>9.1 Principais Achados</h3>
              <div className="findings-grid">
                <div className="finding-card">
                  <h4>1. Estrutura de Dados Robusta</h4>
                  <p>O schema PostgreSQL fornecido é <strong>extremamente bem projetado</strong> e cobre todos os domínios necessários para modelagem IRP complexa.</p>
                </div>
                <div className="finding-card">
                  <h4>2. Dados Operacionais Ricos mas Parciais</h4>
                  <p>O inventário de dados é <strong>abrangente conceitualmente</strong>, mas muitos valores são estimativas ou templates para coleta.</p>
                </div>
                <div className="finding-card">
                  <h4>3. Contexto Empresarial Favorável</h4>
                  <p>PRIO está em <strong>posição ideal</strong> para implementar otimização logística avançada.</p>
                </div>
                <div className="finding-card highlight">
                  <h4>4. Custos de Falha Altíssimos</h4>
                  <p>Com <strong>$5,2M/dia</strong> de perda potencial por parada de produção, investimento em otimização logística tem ROI claro.</p>
                </div>
                <div className="finding-card">
                  <h4>5. Complexidade Gerenciável</h4>
                  <p>A rede é <strong>relativamente compacta</strong>: 1 base, 4-5 clusters, 6-9 embarcações, distâncias 46-75 NM.</p>
                </div>
              </div>
            </div>

            <div className="metrics-subsection">
              <h3>9.2 Roadmap Sugerido</h3>
              <div className="roadmap">
                <div className="roadmap-quarter">
                  <h4>Q1 2026: Fundação</h4>
                  <ul>
                    <li>☐ Coletar dados PRIORIDADE 1 (inventário, frota)</li>
                    <li>☐ Popular banco de dados com dados reais</li>
                    <li>☐ Implementar modelo IRP determinístico base</li>
                    <li>☐ Validar com dados históricos (backtesting)</li>
                  </ul>
                </div>
                <div className="roadmap-quarter">
                  <h4>Q2 2026: Refinamento</h4>
                  <ul>
                    <li>☐ Coletar histórico de 12 meses (consumo, viagens)</li>
                    <li>☐ Calibrar modelo com dados reais</li>
                    <li>☐ Adicionar incertezas (demanda, clima)</li>
                    <li>☐ Testes piloto com cenários 2026</li>
                  </ul>
                </div>
                <div className="roadmap-quarter">
                  <h4>Q3 2026: Produção</h4>
                  <ul>
                    <li>☐ Integrar com sistemas operacionais PRIO</li>
                    <li>☐ Conectar previsões meteorológicas</li>
                    <li>☐ Dashboard de monitoramento</li>
                    <li>☐ Re-otimização semanal automatizada</li>
                  </ul>
                </div>
                <div className="roadmap-quarter">
                  <h4>Q4 2026: Expansão</h4>
                  <ul>
                    <li>☐ Machine learning para previsões</li>
                    <li>☐ Integração Shape Digital (manutenção)</li>
                    <li>☐ Otimização de offloading (outbound)</li>
                    <li>☐ Planejamento estratégico (novos tiebacks)</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="metrics-subsection">
              <h3>9.3 Valor Esperado</h3>
              <div className="value-grid">
                <div className="value-card">
                  <h4>Redução de Custos Operacionais: 5-15%</h4>
                  <ul>
                    <li>Melhor utilização de frota</li>
                    <li>Rotas otimizadas (menos NM)</li>
                    <li>Consolidação de cargas</li>
                  </ul>
                  <p className="value-amount">Economia estimada: <strong>$2-6M/ano</strong></p>
                </div>
                <div className="value-card">
                  <h4>Redução de Riscos</h4>
                  <ul>
                    <li>Menos stockouts (aumento confiabilidade)</li>
                    <li>Melhor preparação para clima adverso</li>
                    <li>Visibilidade antecipada de gaps</li>
                  </ul>
                  <p className="value-amount">Valor de prevenção: <strong>$10-20M/ano</strong></p>
                </div>
                <div className="value-card highlight">
                  <h4>ROI Conservador</h4>
                  <ul>
                    <li>Investimento: $500k-1M</li>
                    <li>Retorno anual: $12-26M</li>
                  </ul>
                  <p className="value-amount roi">ROI: <strong>1.200-2.600%</strong></p>
                  <p className="value-amount">Payback: <strong>&lt; 2 meses</strong></p>
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>
      */}
    </div>
  );
}
