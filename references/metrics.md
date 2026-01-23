# Relatório Analítico: Sistema de Dados para Otimização Logística Offshore da PRIO
**Data:** Janeiro 2026
**Preparado por:** Claude (Anthropic)
**Versão:** 1.0

---

## SUMÁRIO EXECUTIVO

Este relatório analisa a estrutura de dados consolidada para modelagem matemática da logística offshore da PRIO S.A., integrando três fontes principais: inventário de dados operacionais, contexto empresarial detalhado e esquema de banco de dados PostgreSQL. O sistema apresentado fornece base robusta para implementação de modelos de Problema de Roteamento de Inventário (IRP) e otimização de redes logísticas marítimas.

**Principais Destaques:**

- **14 categorias principais** de dados estruturados cobrindo toda cadeia logística
- **Schema de banco de dados** com 40+ tabelas inter-relacionadas
- **Portfolio operacional** de 4 FPSOs e múltiplas plataformas fixas
- **Produção projetada 2026:** ~200.000-215.000 bpd
- **Investimento em contratos marítimos:** ~$100 milhões (Solstad Offshore)
- **Inovação tecnológica:** IA preditiva implementada em todas unidades (Shape Digital)

---

## 1. ARQUITETURA DO SISTEMA DE DADOS

### 1.1 Visão Geral da Estrutura

O sistema de dados está organizado em **7 domínios principais**, refletindo a arquitetura do schema PostgreSQL:

```
┌─────────────────────────────────────────────────────────────┐
│                    DOMÍNIO DE REDE                          │
│  - Bases de suprimento (Macaé)                              │
│  - Instalações offshore (4 FPSOs, plataformas)              │
│  - Matriz de distâncias (9 rotas principais)                │
│  - Capacidades de armazenamento por instalação              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    DOMÍNIO DE FROTA                         │
│  - Embarcações (6-9 PSVs, 1 CSV, 1 WSV)                    │
│  - Compartimentos e tanques                                 │
│  - Compatibilidade de cargas                                │
│  - Cronogramas e disponibilidade                            │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    DOMÍNIO DE CARGAS                        │
│  - 15+ tipos de carga (líquidos, granel, deck)             │
│  - Perfis de consumo por instalação                         │
│  - Demandas e pedidos                                       │
│  - Incompatibilidades e limpeza                             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  DOMÍNIO DE OPERAÇÕES                       │
│  - Viagens e waypoints                                      │
│  - Manifestos de carga                                      │
│  - Janelas operacionais                                     │
│  - Atrasos e restrições                                     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  DOMÍNIO AMBIENTAL                          │
│  - Previsões meteorológicas (TimescaleDB)                  │
│  - Padrões sazonais                                         │
│  - Janelas climáticas                                       │
│  - Fatores de workability                                   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   DOMÍNIO DE CUSTOS                         │
│  - Estruturas de charter ($8k-50k/dia)                     │
│  - Combustível (~$700/tonelada)                             │
│  - Custos portuários e offshore                             │
│  - Penalidades e perdas de produção                         │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                 DOMÍNIO DE OTIMIZAÇÃO                       │
│  - Execuções de modelos matemáticos                         │
│  - Cenários e soluções                                      │
│  - KPIs e métricas de performance                           │
│  - Demandas não atendidas                                   │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Tecnologias e Extensões

O schema utiliza recursos avançados do PostgreSQL:

**PostGIS:** Dados geográficos com índices GIST para cálculos espaciais eficientes
- Coordenadas de bases e instalações (WGS84)
- Cálculos de distância e rotas
- Posicionamento atual de embarcações

**TimescaleDB:** Séries temporais para dados meteorológicos
- Chunks de 7 dias para otimização
- Previsões com múltiplos horizontes
- Retenção e agregação automática

**pg_trgm:** Busca textual fuzzy para nomes de embarcações e instalações

---

## 2. DADOS OPERACIONAIS CONSOLIDADOS

### 2.1 Infraestrutura de Rede

#### Porto de Macaé - Hub Logístico Central

**Especificações Técnicas:**
| Parâmetro | Valor | Implicação Operacional |
|-----------|-------|------------------------|
| Calado máximo | 7,9 m | Limita classe de PSV |
| Comprimento máximo | 97 m | Restringe large PSVs |
| Capacidade deadweight | 5.513 t | Limite de carga |
| Operação | 24/7 | Flexibilidade total |
| Turnaround time | 6-12h (média 8h) | Planejamento de viagens |

**Custos Portuários (por chamada):**
- Mínimo: $4.000
- Típico: $6.500-8.500
- Máximo: $12.000+

**Fases Operacionais Detalhadas:**
1. **Atracação:** 30-60 min (±15 min variabilidade)
2. **Líquidos:** 2-4h (100-200 m³/h)
3. **Granel seco:** 1-3h (50-100 m³/h pneumático)
4. **Deck cargo:** 3-6h (15-30 min/lift)
5. **Documentação:** 30-60 min

#### Matriz de Distâncias - Rede Offshore

| Rota | Distância (NM) | Tempo @12kt | Tempo @14kt | Custo Combustível* |
|------|----------------|-------------|-------------|-------------------|
| Macaé → Peregrino | 46 | 3,8h | 3,3h | $4.680-6.240 |
| Macaé → Polvo/Bravo | 70 | 5,8h | 5,0h | $6.300-8.400 |
| Macaé → Valente (Frade) | 67 | 5,6h | 4,8h | $5.820-7.760 |
| Macaé → Forte (Albacora) | 75 | 6,3h | 5,4h | $6.300-8.400 |
| Peregrino ↔ Polvo | 15 | 1,3h | 1,1h | Consolidação |
| Polvo ↔ Bravo | 5,9 | 0,5h | 0,4h | Tieback |

*Valores para viagem roundtrip, PSV padrão

**Oportunidades de Otimização Identificadas:**

1. **Cluster Polvo-Bravo:** Distância de apenas 11 km (tieback subsea) permite atendimento conjunto em única viagem
2. **Consolidação Peregrino-Polvo:** 28 km de separação viabiliza consolidação de cargas de óleo para offloading
3. **Cluster Peregrino (FPSO + 3 plataformas):** Rota sequencial com <5 km entre instalações

### 2.2 Portfolio de Instalações

#### FPSO Bravo (Tubarão Martelo)
```yaml
Produção: 15.000-16.000 boe/d (cluster com Polvo)
Armazenamento: ~600.000 barris
Distância: 70 NM de Macaé
Integração: 11 km tieback desde Polvo A

Demanda Semanal Normal:
  - Diesel: 500 m³
  - Água: 400 m³
  - Químicos: 100 m³
  - Deck cargo: 150 t

Viagens requeridas: 2-3/semana (normal), 3-4/semana (perfuração)
```

#### FPSO Valente (Frade + Wahoo em desenvolvimento)
```yaml
Produção atual: 38.300 bpd (Frade)
Produção adicional 2026: ~40.000 bpd (Wahoo)
Capacidade processamento: 100.000 bpd
Armazenamento: 1,6 milhões barris
Profundidade: 1.200 m

Demanda Normal:
  - Diesel: 45 m³/dia → 350 m³/semana
  - Água: 35 m³/dia → 250 m³/semana
  - Químicos: 100 m³/semana
  - Deck cargo: 150 t/semana

Campanha Perfuração Wahoo (2026):
  - Lama OBM: 800 m³/semana
  - Granel seco: 200 m³/semana
  - Tubos perfuração: 200-400 t/semana
  - Viagens: 4-5/semana (vs 2 normal)
```

#### FPSO Forte (Albacora Leste)
```yaml
Capacidade: 180.000 bpd processamento, 6M m³/dia gás
Produção atual: 22.000 bpd
Armazenamento: >1 milhão barris
DWT: 248.520 t

Desenvolvimento 2026: Tieback norte 12 km
Viagens requeridas: 3/semana
```

#### Complexo Peregrino (FPSO + Plataformas A, B, C)
```yaml
Produção total: ~100.000 bpd
Share PRIO: 38.200 bpd (40%, aumentando para 100%)
Infraestrutura: 4 instalações
Distância: 46 NM de Macaé
Óleo: API 14° (pesado, mercado asiático)

Demanda Total Cluster:
  - Diesel: 800 m³/semana
  - Água: 600 m³/semana
  - Químicos: 190 m³/semana
  - Deck cargo: 340 t/semana

Padrão entrega: Rota sequencial FPSO→A→B→C
Tempo total cluster: 8-10 horas
```

### 2.3 Frota de Embarcações

#### Composição Estimada da Frota

**Contratos Solstad (~$100M combinados):**

1. **CSV Normand Pioneer** - Vessel especializado
   - Charter: $35.000-50.000/dia
   - Capacidades: Trenching, pipe-laying, ROV, anchor handling
   - Deck cargo: 3.500-4.500 t
   - Aplicação: Tiebacks Wahoo e Albacora Norte

2. **WSV Normand Carioca** - Well Stimulation
   - Charter: $25.000-35.000/dia
   - Contrato até: Dezembro 2027
   - Cliente primário: Equinor (Bacalhau)

3. **PSV Padrão (UT 755 type)** - 4-6 embarcações
   - Charter: $8.000-15.000/dia
   - Deck cargo: 2.450 t
   - Tanques: 994 m³ diesel, 812 m³ água, 2.500 m³ lama
   - Velocidade: 13 kt (operacional)
   - Consumo: 15-18 t/dia trânsito

4. **PSV Grande (UT 874 type)** - 2-3 embarcações
   - Charter: $12.000-22.000/dia (DP2), $15.000-25.000 (DP3)
   - Deck cargo: 2.800-3.200 t
   - Tanques: 3.000-3.500 m³ lama, 1.200-1.500 m³ diesel
   - Consumo: 18-22 t/dia trânsito

#### Estrutura de Dados no Schema

O schema `vessels` captura:
- **Especificações físicas:** LOA, beam, draught, capacidades
- **Performance:** Velocidades de serviço, consumo por modo operacional
- **Posicionamento dinâmico:** Classe DP1/DP2/DP3
- **Status operacional:** Available, InUse, Maintenance, Drydock
- **Localização atual:** Coordenadas geográficas (PostGIS)

Tabela `vessel_compartments` detalha:
- Tanques líquidos individuais com capacidades
- Espaço de deck disponível
- Compartimentos de granel seco
- Estado atual (carga, nível de enchimento, última limpeza)

Matriz `compartment_compatibility` define:
- Quais cargas podem usar cada compartimento
- Tempo de limpeza entre produtos (0-8 horas)
- Restrições de segregação

---

## 3. MODELAGEM DE CARGAS E DEMANDA

### 3.1 Catálogo de Cargas (15+ tipos)

#### A. Cargas Líquidas

**Diesel Marítimo:**
- Densidade: 850 kg/m³
- Taxa transferência: 100-150 m³/h (porto), 80-120 m³/h (offshore)
- Consumo típico: 10-100 m³/dia por instalação
- Estoque segurança ANP: 48h de consumo
- Compatibilidade: Base oil (sem limpeza), incompatível com água (4h limpeza)

**Água Potável:**
- Densidade: 1.000 kg/m³
- Taxa transferência: 100-200 m³/h
- Consumo: 5-80 m³/dia por instalação
- Estoque segurança ANP: 36h de consumo
- **Segregação crítica:** Incompatível com TODOS outros líquidos

**Lama de Perfuração:**
- OBM (Oil-Based Mud): 1.200-1.400 kg/m³
- WBM (Water-Based Mud): 1.100-1.300 kg/m³
- Demanda: 0 (normal) → 800-1.200 m³/semana (perfuração)
- Limpeza tanque OBM→WBM: 6 horas

**Metanol:**
- Densidade: 792 kg/m³
- Aplicação: Inibidor de hidrato
- **Maior tempo limpeza:** 8 horas (de/para qualquer outro líquido)
- Demanda: Sazonal (maior no inverno)

#### B. Cargas de Granel Seco

**Cimento:**
- Densidade aparente: 1.500 kg/m³
- Sistema: Pneumático (50-100 m³/h)
- Demanda: Campanhas perfuração (150-300 m³/semana)
- Restrição climática: Chuva suspende operações

**Barita:**
- Densidade: 2.500-4.200 kg/m³ (**limitação por peso!**)
- Aplicação: Densificante para lama
- 100 m³ = 250-1.260 toneladas

**Bentonita:**
- Densidade: 600-800 kg/m³
- Aplicação: Viscosificante para WBM

#### C. Carga de Convés

**Tubos de Perfuração:**
- Dimensões: 40 ft × 5" típico
- Peso: 5-15 t/tubo
- Carga típica: 200-800 t/viagem
- Tempo handling: 15-25 min/lift
- Restrições: Vento <15 m/s, Hs <2,5m

**Containers ISO:**
- 20 ft: 10-15 t carregado
- 40 ft: 15-20 t carregado
- Demanda: 4-10 containers/semana por FPSO grande
- Tempo: 10-20 min/container

### 3.2 Perfis de Demanda no Schema

O schema implementa modelagem sofisticada de demanda através de múltiplas tabelas:

#### `consumption_profiles` - Baseline de Consumo
```sql
CREATE TABLE consumption_profiles (
    installation_id VARCHAR(50),
    cargo_type_id VARCHAR(50),
    daily_consumption DECIMAL(12,2),
    variability_std_dev DECIMAL(12,2),
    scenario_normal_factor DECIMAL(5,3) DEFAULT 1.0,
    scenario_drilling_factor DECIMAL(5,3) DEFAULT 1.5,
    scenario_workover_factor DECIMAL(5,3) DEFAULT 1.2,
    ...
)
```

**Fatores de Cenário:**
- Normal: 1,0x
- Perfuração: 1,5-2,0x (50-100% aumento)
- Workover: 1,2-1,5x
- Baixa atividade: 0,6-0,8x

#### `consumption_weekly_pattern` - Sazonalidade Semanal
Captura variações por dia da semana (0-6)

#### `consumption_monthly_pattern` - Sazonalidade Anual
Índices mensais, exemplo:
- Janeiro: 1,1 (10% acima média - verão, maior atividade)
- Julho: 0,9 (10% abaixo - inverno, menor atividade)

#### `demands` - Pedidos Específicos
```sql
CREATE TABLE demands (
    installation_id VARCHAR(50),
    cargo_type_id VARCHAR(50),
    quantity DECIMAL(12,2),
    earliest_delivery TIMESTAMP,
    latest_delivery TIMESTAMP,
    priority VARCHAR(20), -- Critical, High, Normal, Low
    scenario VARCHAR(50), -- Normal, Drilling, Workover, Emergency
    penalty_late_per_day DECIMAL(12,2),
    ...
)
```

### 3.3 Matriz de Compatibilidade

Tabela `cargo_incompatibility` define tempos de limpeza:

```
         | Diesel | Água | OBM | WBM | Brine | Metanol | Químicos | BaseOil
---------|--------|------|-----|-----|-------|---------|----------|--------
Diesel   |   0    |  4   |  0  |  2  |   2   |    8    |    3     |   0
Água     |   4    |  0   |  6  |  4  |   1   |    8    |    4     |   6
OBM      |   0    |  6   |  0  |  6  |   4   |    8    |    4     |   0
WBM      |   2    |  4   |  6  |  0  |   2   |    8    |    4     |   4
Metanol  |   8    |  8   |  8  |  8  |   8   |    0    |    8     |   8
```

**Implicações para otimização:**
- Metanol requer **sempre** 8 horas limpeza
- Diesel e Base Oil são compatíveis (0 horas)
- Água é crítica (4-6 horas de/para maioria)

---

## 4. RESTRIÇÕES OPERACIONAIS E AMBIENTAIS

### 4.1 Limites Climáticos por Operação

| Operação | Hs máx | Vento máx | Corrente máx | Visibilidade mín |
|----------|--------|-----------|--------------|-----------------|
| Carregamento líquidos (porto) | 2,0m | 20 m/s | 1,5 kt | 0,5 NM |
| Deck cargo (porto) | 2,5m | 18 m/s | 1,5 kt | 1,0 NM |
| **Trânsito PSV** | **4,5m** | **30 m/s** | - | **0,5 NM** |
| Aproximação plataforma | 3,0m | 20 m/s | 2,0 kt | 1,0 NM |
| Descarga líquidos offshore | 3,0m | 18 m/s | 2,0 kt | - |
| **Granel seco** | **2,5m** | **15 m/s** | **2,0 kt** | - |
| **Operações guindaste** | **2,5m** | **15 m/s** | **2,0 kt** | **1,0 NM** |
| Offloading tanker | 3,5m | 18 m/s | 2,5 kt | 2,0 NM |

**Operações mais restritivas:**
1. Granel seco e guindaste: Hs <2,5m, vento <15 m/s
2. Chuva suspende carregamento de cimento (sensibilidade umidade)

### 4.2 Estatísticas Climáticas - Bacia de Campos

#### Distribuição Anual de Hs
- **Hs <2m:** 50-60% do tempo (condições boas)
- **Hs 2-3m:** 25-30% (moderadas)
- **Hs 3-4m:** 10-15% (ruins)
- **Hs >4m:** 5-10% (severas, operações suspensas)

#### Variação Sazonal
```yaml
Verão (Dez-Mar):
  - Hs média: 1,5-2,0 m
  - Condições boas: 65-70%
  - Workability guindaste: ~65%

Inverno (Jun-Ago):
  - Hs média: 2,0-2,5 m
  - Condições boas: 40-50%
  - Workability guindaste: ~40%
  - Maior incidência frentes frias

Transição (Abr-Mai, Set-Nov):
  - Hs média: 1,8-2,2 m
  - Condições boas: 55-60%
  - Workability: ~55%
```

#### Modelo de Atrasos

**Frequência:** 10-15% das operações offshore
**Duração:**
- Média: 4-8 horas
- Distribuição: Lognormal(μ=1,5, σ=0,8)
- Máximo observado: 48+ horas

**Por tipo de operação:**
- Guindaste: 15-20% taxa de atraso
- Líquidos: 8-12%
- Trânsito: 5-8%

**Sazonalidade:**
- Verão: 8% taxa
- Inverno: 18% taxa

### 4.3 Implementação no Schema

#### `weather_forecasts` - Hypertable TimescaleDB
```sql
CREATE TABLE weather_forecasts (
    location_id VARCHAR(50),
    timestamp TIMESTAMPTZ,
    forecast_horizon_h INTEGER,
    wave_height_mean_m DECIMAL(5,2),
    wind_speed_mean_ms DECIMAL(5,2),
    current_speed_kts DECIMAL(5,2),
    visibility_nm DECIMAL(5,2),
    weather_state VARCHAR(20), -- Good, Moderate, Rough, Severe
    ...
)
```

**Chunks de 7 dias** otimizam queries de previsão

#### `weather_windows` - Janelas Operacionais
Pré-calcula períodos adequados para cada tipo de operação:
```sql
CREATE TABLE weather_windows (
    location_id VARCHAR(50),
    operation_type VARCHAR(50),
    start_time TIMESTAMPTZ,
    end_time TIMESTAMPTZ,
    duration_h DECIMAL(6,2),
    confidence DECIMAL(5,4),
    suitable BOOLEAN
)
```

#### `seasonal_patterns` - Padrões Históricos
Distribuições mensais de Hs por localização para planejamento tático

---

## 5. ESTRUTURA DE CUSTOS E ECONOMIA OPERACIONAL

### 5.1 Hierarquia de Custos

```
CUSTO TOTAL DE VIAGEM
│
├── CUSTOS FIXOS (Charter)
│   ├── Standard PSV: $8.000-15.000/dia
│   ├── Large PSV DP2: $12.000-22.000/dia
│   ├── Large PSV DP3: $15.000-25.000/dia
│   ├── CSV: $35.000-50.000/dia
│   └── WSV: $25.000-35.000/dia
│
├── CUSTOS VARIÁVEIS (Combustível)
│   ├── MGO: $600-800/tonelada
│   ├── Trânsito: 15-22 t/dia (classe embarcação)
│   ├── DP operations: 3-7 t/dia
│   └── Porto: 2-4 t/dia
│
├── CUSTOS PORTUÁRIOS (Macaé)
│   ├── Taxas base: $500-1.500
│   ├── Pilotagem: $600-800
│   ├── Agenciamento: $200-500
│   ├── Handling líquidos: $5-10/m³
│   ├── Handling deck: $15-30/t
│   ├── Handling granel: $8-15/m³
│   └── TOTAL: $4.000-12.000/chamada
│
├── CUSTOS OFFSHORE
│   ├── Guindaste: $500-1.000/hora
│   ├── Tempo típico: 3-5 horas
│   └── TOTAL: $1.500-5.500/viagem
│
└── PENALIDADES (se aplicável)
    ├── Atraso diesel: $10.000-20.000/dia
    ├── Atraso água: $8.000-15.000/dia
    ├── Lama (perfuração parada): $5.000-10.000/hora
    └── Perda produção: $218.600/hora (rede total)
```

### 5.2 Exemplos de Custos por Viagem

#### Viagem 1: Peregrino (46 NM)
```yaml
Embarcação: Standard PSV
Carga: 400 m³ líquidos + 100 t deck
Distância: 92 NM roundtrip
Tempo: 13,7 horas

Custos:
  - Charter (0,57 dias × $12.000): $6.840
  - Combustível (7,8 t × $700): $5.460
  - Porto: $6.500
  - Offshore: $3.000
  TOTAL: $21.800

Métricas:
  - $/tonelada: $87
  - $/m³: $54
  - $/NM: $237
```

#### Viagem 2: Albacora Leste (75 NM) - Large PSV
```yaml
Carga: 600 m³ líquidos + 200 t deck
Distância: 150 NM roundtrip
Tempo: 18,5 horas

Custos:
  - Charter (0,77 dias × $17.000): $13.090
  - Combustível (10,5 t × $700): $7.350
  - Porto: $7.500
  - Offshore: $4.000
  TOTAL: $31.940

Métricas:
  - $/tonelada: $80
  - $/m³: $53
```

#### Viagem 3: Campanha Perfuração Wahoo
```yaml
Embarcação: Large PSV DP3
Carga: 800 m³ OBM + 300 m³ granel + 300 t deck
Distância: 67 NM (Frade)

Custos:
  - Charter (0,95 dias × $20.000): $19.000
  - Combustível (12 t × $700): $8.400
  - Porto: $9.000
  - Offshore: $5.000
  TOTAL: $41.400

Volume: ~1.500 t equivalente
$/tonelada: $28
```

**Análise:** Campanhas de perfuração têm custo por tonelada **inferior** devido a maior consolidação de carga por viagem.

### 5.3 Custo de Perda de Produção - O Maior Risco

```yaml
Perda de Produção por Stockout de Diesel/Água:

FPSO Valente (38.300 bpd):
  - Receita diária bruta (@$80/bbl): $3.064.000
  - Margem operacional (60%): $1.838.400/dia
  - Perda horária: $76.600/hora

FPSO Forte (22.000 bpd):
  - Perda diária: $1.056.000

FPSO Peregrino (38.200 bpd PRIO share):
  - Perda diária: $1.833.600

Cluster Polvo/TBMT (10.800 bpd):
  - Perda diária: $518.400

REDE TOTAL:
  - Perda diária potencial: $5.246.400
  - Perda horária: $218.600
```

**Implicação crítica para modelo de otimização:**

> **Custo de stockout >> Custo de entrega**
>
> Uma única hora de parada de produção ($218.600) equivale a:
> - 10 viagens completas para Peregrino
> - 7 viagens para Albacora Leste
> - 5 viagens de campanha de perfuração

**Conclusão:** O modelo deve priorizar **disponibilidade de inventário** sobre minimização de custos de transporte. Estoques de segurança ANP (48h diesel, 36h água) são **absolutamente críticos**.

### 5.4 Schema de Custos

#### `cost_structures` - Estruturas de Charter
```sql
CREATE TABLE cost_structures (
    vessel_id VARCHAR(50),
    effective_from DATE,
    effective_to DATE,
    charter_rate_daily_usd DECIMAL(12,2),
    fuel_price_per_tonne_usd DECIMAL(10,2),
    port_dues_usd DECIMAL(10,2),
    ...
)
```

Permite:
- Histórico de preços
- Contratos com datas de validade
- Cenários de sensibilidade

#### `penalty_costs` - Penalidades
```sql
CREATE TABLE penalty_costs (
    order_id VARCHAR(50),
    penalty_type VARCHAR(50), -- LateDelivery, Stockout, ProductionLoss
    amount_usd DECIMAL(15,2),
    duration_h DECIMAL(10,2),
    ...
)
```

Rastreia custos de não-conformidade para análise pós-otimização

#### Trigger Automático de Cálculo
```sql
CREATE TRIGGER calculate_trip_cost_trigger
BEFORE INSERT OR UPDATE ON trips
FOR EACH ROW EXECUTE FUNCTION calculate_trip_cost();
```

Calcula automaticamente:
- Charter proporcional ao tempo
- Combustível (preço × consumo)
- Soma de custos portuários e offshore
- **Total cost** agregado

---

## 6. INTEGRAÇÃO COM IA E INOVAÇÃO TECNOLÓGICA

### 6.1 Plataforma Shape Digital

Em outubro de 2025, PRIO implementou sistema de IA preditiva da Shape Digital em **todas as unidades**:

**Shape Lighthouse Platform:**
- **200+ modelos** de predição de falhas
- Maior biblioteca de algoritmos offshore do setor
- Manutenção preditiva para ativos críticos
- Detecção proativa de anomalias

**Deployment:**
- FPSO Forte (Albacora Leste)
- FPSO Valente (Frade)
- FPSO Bravo (Tubarão Martelo)
- Plataforma Polvo A

**Benefícios:**
- Redução de downtime não planejado
- Otimização de cronogramas de manutenção
- Melhor planejamento logístico (menos emergências)
- Redução de risco de vazamentos

**Soluções Adicionais:**
- **Shape Aura:** Eficiência energética sem CAPEX
- **Shape Reef:** Monitoramento de Safety-Critical Elements

### 6.2 Implicações para Modelo Logístico

A IA preditiva **afeta diretamente** a modelagem logística:

1. **Redução de Demandas Emergenciais**
   - Histórico: 1-3 emergências/semana
   - Esperado: Redução de 30-50% com manutenção preditiva
   - Impacto: Menor necessidade de capacidade de resposta rápida

2. **Maior Previsibilidade de Manutenção**
   - Janelas de manutenção planejadas com antecedência
   - Sincronização com campanhas de suprimento
   - Redução de conflitos operacionais

3. **Dados para Modelagem**
   - Padrões de falha de equipamentos
   - Probabilidades de necessidade de peças
   - Correlação clima → desgaste → demanda

4. **Integração Potencial**
   - API Shape Digital → Sistema logístico
   - Previsões de manutenção → Input para IRP
   - Alertas early-warning → Trigger de pedidos

### 6.3 Oportunidades Futuras

**Machine Learning para Otimização:**
- Previsão de demanda com ML (melhor que padrões fixos)
- Previsão de consumo de combustível por condições reais
- Otimização de velocidade dinâmica (speed optimization)
- Reinforcement learning para decisões de roteamento

**Digital Twins:**
- Gêmeo digital da rede logística
- Simulação de cenários antes de execução
- Teste de políticas de inventário

**IoT e Sensoriamento:**
- Níveis de tanque em tempo real (já mencionado no inventário)
- Monitoramento de equipamentos de carga/descarga
- Rastreamento de containers e cargas críticas

---

## 7. DOMÍNIO DE OTIMIZAÇÃO - FRAMEWORK DE MODELAGEM

### 7.1 Arquitetura de Otimização

O schema define estrutura completa para **execução e análise** de modelos matemáticos:

```
CICLO DE OTIMIZAÇÃO
│
├── 1. OPTIMIZATION_RUNS
│   ├── Horizonte de planejamento (start → end)
│   ├── Função objetivo definida
│   ├── Solver utilizado (Gurobi, CPLEX, etc.)
│   ├── Tempo de solução
│   ├── Status (Optimal, Feasible, Infeasible)
│   └── Gap de otimalidade
│
├── 2. OPTIMIZATION_SCENARIOS
│   ├── Cenários "what-if"
│   ├── Parâmetros variados
│   └── Comparação de soluções
│
├── 3. SOLUTIONS
│   ├── Custo total
│   ├── Distância total
│   ├── Utilização de frota
│   ├── Número de viagens
│   └── Demandas não atendidas
│
├── 4. SOLUTION_TRIPS
│   ├── Linkagem trips ↔ solution
│   └── Permite análise detalhada
│
├── 5. UNMET_DEMANDS
│   ├── Rastreamento de falhas
│   ├── Razões (capacidade, tempo, clima)
│   └── Quantidade de shortfall
│
└── 6. KPIs
    ├── Utilização de frota
    ├── On-time delivery rate
    ├── Custo por tonelada
    ├── Fuel efficiency
    ├── Weather delay rate
    ├── Backhaul rate
    └── Emissões CO₂
```

### 7.2 Tipos de Modelos Suportados

O schema é flexível o suficiente para suportar múltiplas formulações:

#### A. Inventory Routing Problem (IRP)
```
Minimizar: Custos totais (charter + fuel + handling + penalties)

Sujeito a:
  - Inventory constraints (safety stock, capacity)
  - Vehicle capacity constraints
  - Time windows (porto, instalações, clima)
  - Compatibilidade de cargas
  - Fleet availability
  - Workability (clima)
```

**Tabelas chave:**
- `installation_storage` → Níveis de inventário
- `consumption_profiles` → Taxas de consumo
- `demands` → Pedidos confirmados
- `vessels` + `vessel_compartments` → Capacidades
- `weather_windows` → Restrições climáticas

#### B. Vehicle Routing Problem with Pickup and Delivery (VRPPD)
```
Incluindo backhaul:
  - Entrega de suprimentos (pickup @ porto)
  - Coleta de resíduos (delivery @ porto)
  - Containers vazios de retorno
```

**Tabela:** `backhaul_cargo`

#### C. Multi-Period Planning
```
Horizonte: 1-4 semanas
Decisões:
  - Quando visitar cada instalação
  - Quanto entregar de cada carga
  - Qual embarcação alocar
  - Rota sequencial de waypoints
```

**Tabelas:**
- `trips` + `trip_waypoints` → Rotas sequenciais
- `time_windows` → Disponibilidade de instalações
- `vessel_schedules` → Disponibilidade de frota

#### D. Stochastic Optimization
```
Incertezas:
  - Demanda (variability_std_dev)
  - Clima (forecast_accuracy, seasonal patterns)
  - Atrasos operacionais (historical delays)
```

**Dados estocásticos:**
- `consumption_profiles.variability_std_dev`
- `weather_forecasts.forecast_accuracy`
- `seasonal_patterns` (distribuições)

### 7.3 Função Objetivo Típica

```
Minimizar Z =
    Σ (Charter costs)           -- trip.charter_cost_usd
  + Σ (Fuel costs)              -- trip.fuel_cost_usd
  + Σ (Port costs)              -- trip.port_costs_usd
  + Σ (Offshore costs)          -- trip.offshore_costs_usd
  + Σ (Handling costs)          -- trip.handling_costs_usd
  + Σ (Penalty costs)           -- penalty_costs.amount_usd
  - Σ (Revenue from backhaul)   -- (se aplicável)
```

### 7.4 KPIs de Performance

Tabela `kpis` calcula métricas essenciais:

| KPI | Fórmula/Definição | Meta Típica |
|-----|-------------------|-------------|
| **Vessel Utilization** | Tempo produtivo / Tempo total | 75-85% |
| **On-Time Delivery Rate** | Entregas no prazo / Total entregas | >95% |
| **Avg Trip Duration** | Média de horas por viagem | Minimizar |
| **Cost per Tonne** | Custo total / Toneladas entregues | $80-120/t |
| **Fuel Efficiency** | Toneladas fuel / NM percorridas | <0,15 t/NM |
| **Weather Delay Rate** | Horas atraso clima / Horas totais | <10% |
| **Backhaul Rate** | Peso retorno / Peso entrega | >20% |
| **Emergency Response Time** | Tempo médio resposta emergência | <8 horas |

### 7.5 Materialized Views para Analytics

O schema inclui views materializadas otimizadas:

#### `mv_current_inventory`
```sql
SELECT
    installation_name,
    cargo_name,
    current_level,
    max_capacity,
    safety_stock,
    CASE
        WHEN current_level < safety_stock THEN 'Critical'
        WHEN current_level < reorder_point THEN 'Low'
        ELSE 'Normal'
    END AS inventory_status
FROM ...
```

**Uso:** Dashboard em tempo real de status de inventário

#### `mv_vessel_performance`
```sql
SELECT
    vessel_name,
    total_trips,
    avg_trip_duration,
    total_distance,
    avg_fuel_efficiency,
    completion_rate
FROM ...
WHERE trip_date >= CURRENT_DATE - 90
```

**Uso:** Análise de performance de frota, identificação de outliers

---

## 8. ANÁLISE DE GAPS E RECOMENDAÇÕES

### 8.1 Dados Completos vs. Templates de Coleta

| Categoria | Status | Gap |
|-----------|--------|-----|
| **Distâncias e Rotas** | ✅ Completo | 9 rotas principais documentadas |
| **Instalações** | ⚠️ Parcial | Consumos especificados, faltam capacidades exatas de armazenamento |
| **Frota** | ⚠️ Estimado | Composição estimada, faltam especificações exatas de cada vessel |
| **Tipos de Carga** | ✅ Completo | 15+ tipos catalogados com detalhes |
| **Custos** | ✅ Completo | Estrutura detalhada com ranges de mercado |
| **Clima** | ✅ Completo | Estatísticas históricas e limites operacionais |
| **Demanda** | ⚠️ Parcial | Padrões gerais, faltam 12 meses histórico real |

### 8.2 Prioridades de Coleta de Dados

#### PRIORIDADE 1 - CRÍTICO (Sem isso, modelo não funciona)

1. **Capacidades exatas de armazenamento por instalação e carga**
   ```
   installation_storage.max_capacity para cada (installation, cargo_type)
   ```

2. **Níveis atuais de inventário**
   ```
   installation_storage.current_level (tempo real ou última leitura)
   ```

3. **Especificações exatas da frota contratada**
   ```
   vessels: Quantas embarcações de cada classe?
   vessel_compartments: Capacidades de tanques por vessel
   ```

4. **Taxas de charter confirmadas**
   ```
   Contratos PRIO-Solstad: valores reais vs. estimativas de mercado
   ```

#### PRIORIDADE 2 - ALTA (Melhora significativamente o modelo)

5. **Histórico de consumo (12 meses)**
   ```
   consumption_profiles com dados reais, não estimados
   Permite calcular variability_std_dev real
   ```

6. **Histórico de viagens (6-12 meses)**
   ```
   trips com actual_departure, actual_arrival
   Permite calibrar tempos operacionais e consumo de fuel
   ```

7. **Cronograma de campanhas de perfuração 2026**
   ```
   Wahoo: Datas, duração, número de poços
   Albacora Norte: Timeline do tieback
   ```

8. **Previsões meteorológicas operacionais**
   ```
   API para weather_forecasts com update a cada 3-6 horas
   ```

#### PRIORIDADE 3 - MÉDIA (Refinamentos e analytics)

9. **Custos reais de handling no porto**
   ```
   Por tipo de carga, valores de contrato vs. estimativas
   ```

10. **Frequência histórica de emergências**
    ```
    demands com scenario='Emergency', últimos 12 meses
    Distribuição de tamanho e causa
    ```

11. **Dados de backhaul**
    ```
    backhaul_cargo: Pesos típicos de retorno por instalação
    ```

### 8.3 Recomendações de Implementação

#### Fase 1: Modelo Determinístico Base (3-4 meses)
```
Objetivo: IRP básico funcional

Dados necessários:
✅ Rede (distâncias) - COMPLETO
✅ Tipos de carga - COMPLETO
⚠️ Frota - Usar estimativas iniciais, refinar depois
⚠️ Inventário - Coletar capacidades e níveis atuais (CRÍTICO)
✅ Custos - Usar valores médios de mercado
✅ Clima - Usar padrões históricos

Output:
- Rotas otimizadas
- Cronograma de entregas
- Utilização de frota
- Custo total estimado
```

#### Fase 2: Incorporação de Incertezas (2-3 meses)
```
Objetivo: Modelo estocástico robusto

Adicionar:
- Variabilidade de demanda (historical data)
- Previsões meteorológicas probabilísticas
- Cenários de atraso
- Robust optimization ou chance constraints

Output:
- Soluções robustas a incerteza
- Níveis de estoque de segurança otimizados
- Análise de sensibilidade
```

#### Fase 3: Integração Operacional (2-3 meses)
```
Objetivo: Sistema em produção

Desenvolver:
- API para input de dados em tempo real
- Dashboard de monitoramento
- Alertas automáticos (inventário baixo, janelas climáticas)
- Re-otimização dinâmica (rolling horizon)

Integrar:
- ERP da PRIO
- Sistema de previsão meteorológica
- Shape Digital (maintenance alerts)
```

#### Fase 4: Analytics Avançado (Contínuo)
```
Machine Learning:
- Previsão de demanda
- Previsão de consumo de fuel
- Otimização de velocidade

Decision Support:
- Análise de cenários "what-if"
- Planejamento estratégico (novos tiebacks, expansão frota)
- Benchmark de performance
```

### 8.4 Tecnologias Recomendadas

**Backend:**
- PostgreSQL 14+ com PostGIS e TimescaleDB (como especificado)
- Python 3.10+ para scripts de otimização
- Solver: Gurobi ou CPLEX (licenças acadêmicas ou comerciais)

**Otimização:**
- **PuLP/Pyomo:** Modelagem declarativa
- **OR-Tools (Google):** Solvers especializados para VRP
- **Scipy/NumPy:** Cálculos numéricos

**APIs e Integração:**
- FastAPI para REST API
- Celery para jobs assíncronos (re-otimização)
- Redis para cache

**Visualização:**
- Plotly/Dash para dashboards interativos
- Folium/Leaflet para mapas (rotas, instalações)
- Grafana para time-series (inventário, KPIs)

**Weather Data:**
- NOAA GFS ou ECMWF para previsões
- Copernicus Marine Service para dados oceânicos
- APIs de terceiros (WindGuru, Windy, etc.)

---

## 9. CONCLUSÕES E PRÓXIMOS PASSOS

### 9.1 Principais Achados

**1. Estrutura de Dados Robusta**
O schema PostgreSQL fornecido é **extremamente bem projetado** e cobre todos os domínios necessários para modelagem IRP complexa. A inclusão de PostGIS, TimescaleDB e triggers automáticos demonstra sofisticação técnica.

**2. Dados Operacionais Ricos mas Parciais**
O inventário de dados é **abrangente conceitualmente**, mas muitos valores são estimativas ou templates para coleta. Priorizar coleta de:
- Capacidades exatas de armazenamento
- Frota contratada atual (identidades e specs)
- Histórico de consumo real (12 meses)

**3. Contexto Empresarial Favorável**
PRIO está em **posição ideal** para implementar otimização logística avançada:
- Portfolio crescente (200k+ bpd em 2026)
- Investimentos em IA já implementados (Shape Digital)
- Contratos de longo prazo com Solstad (~$100M)
- Cultura de "fazer diferente" e eficiência operacional

**4. Custos de Falha Altíssimos**
Com **$5,2M/dia** de perda potencial por parada de produção, investimento em otimização logística tem ROI claro. Mesmo **1% de redução em stockouts** pode salvar milhões por ano.

**5. Complexidade Gerenciável**
Apesar de múltiplas instalações, cargas e restrições, a rede é **relativamente compacta**:
- 1 base de suprimento (Macaé)
- 4-5 clusters de instalações
- 6-9 embarcações principais
- Distâncias 46-75 NM

Isso torna o problema **computacionalmente tratável** mesmo com modelos sofisticados.

### 9.2 Roadmap Sugerido

**Q1 2026: Fundação**
- [ ] Coletar dados PRIORIDADE 1 (inventário, frota)
- [ ] Popular banco de dados com dados reais
- [ ] Implementar modelo IRP determinístico base
- [ ] Validar com dados históricos (backtesting)

**Q2 2026: Refinamento**
- [ ] Coletar histórico de 12 meses (consumo, viagens)
- [ ] Calibrar modelo com dados reais
- [ ] Adicionar incertezas (demanda, clima)
- [ ] Testes piloto com cenários 2026

**Q3 2026: Produção**
- [ ] Integrar com sistemas operacionais PRIO
- [ ] Conectar previsões meteorológicas
- [ ] Dashboard de monitoramento
- [ ] Re-otimização semanal automatizada

**Q4 2026: Expansão**
- [ ] Machine learning para previsões
- [ ] Integração Shape Digital (manutenção)
- [ ] Otimização de offloading (outbound)
- [ ] Planejamento estratégico (novos tiebacks)

### 9.3 Valor Esperado

**Redução de Custos Operacionais: 5-15%**
- Melhor utilização de frota
- Rotas otimizadas (menos NM)
- Consolidação de cargas
- Redução de viagens emergenciais

**Economia estimada:** $2-6M/ano em custos logísticos

**Redução de Riscos:**
- Menos stockouts (aumento confiabilidade)
- Melhor preparação para clima adverso
- Visibilidade antecipada de gaps

**Valor de prevenção:** $10-20M/ano (evitando 2-4 dias parada)

**ROI Conservador:**
- Investimento: $500k-1M (desenvolvimento + dados + licenças)
- Retorno anual: $12-26M
- **ROI: 1.200-2.600% (payback < 2 meses)**

### 9.4 Mensagem Final

A PRIO possui uma **oportunidade excepcional** para implementar otimização logística de classe mundial. A combinação de:

1. Dados estruturados de forma robusta (schema PostgreSQL)
2. Portfolio em crescimento (Wahoo, Peregrino)
3. Cultura de inovação (Shape Digital)
4. Stakes altíssimos (perda $5M/dia)

...cria caso de negócio **indubitável** para investimento em analytics avançado.

O próximo passo crítico é **coletar dados operacionais reais** (PRIORIDADE 1) e começar desenvolvimento de MVP do modelo de otimização.

---

## ANEXOS

### A. Referências do Schema

**Tabelas Principais:** 40+
**Domínios:** 7 (Network, Fleet, Cargo, Operations, Environment, Costs, Optimization)
**Extensões:** PostGIS, TimescaleDB, pg_trgm
**Views Materializadas:** 2 (inventory, performance)
**Triggers:** 7+ (auto-update timestamps, cost calculation, inventory)
**Índices:** 20+ (geographic, time-series, foreign keys)

### B. Glossário de Termos

- **IRP:** Inventory Routing Problem
- **PSV:** Platform Supply Vessel
- **CSV:** Construction Support Vessel
- **WSV:** Well Stimulation Vessel
- **FPSO:** Floating Production Storage and Offloading
- **Hs:** Altura significativa de onda (Significant wave height)
- **DP:** Dynamic Positioning
- **NM:** Nautical Mile (milha náutica)
- **bpd/bbl:** barrels per day / barrels
- **DWT:** Deadweight Tonnage
- **API:** American Petroleum Institute gravity
- **ANP:** Agência Nacional do Petróleo
- **IBAMA:** Instituto Brasileiro do Meio Ambiente

### C. Contatos para Dados

**Recomendações de stakeholders PRIO para coleta:**
- **Logística/Suprimentos:** Histórico de viagens, custos reais
- **Operações Offshore:** Consumos por instalação, capacidades
- **Comercial:** Contratos de charter, pricing
- **Engenharia:** Especificações de instalações
- **Meteorologia/HSE:** Histórico climático, limites operacionais
- **TI:** Integração com ERP, APIs

---

**Relatório preparado por:** Claude (Anthropic)
**Data:** Janeiro 2026
**Versão:** 1.0
**Páginas:** 25+
