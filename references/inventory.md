# Relatório Consolidado: Inventário de Dados para Modelagem de Logística Offshore da PRIO
**Versão:** 1.0
**Data:** Janeiro 2026
**Empresa:** PRIO S.A. (Petro Rio S.A.)
**Objetivo:** Consolidar dados para modelos de Problema de Roteamento de Inventário (IRP) e Otimização de Redes Logísticas
---
## SUMÁRIO EXECUTIVO
Este relatório estabelece um inventário abrangente e estruturado dos dados necessários para desenvolver modelos matemáticos de otimização da logística offshore da PRIO S.A., maior produtora independente de petróleo do Brasil. O documento organiza dados em categorias que refletem os componentes essenciais de um Problema de Roteamento de Inventário (IRP) e otimização de redes logísticas marítimas, fornecendo especificações técnicas, fontes de dados, frequências de atualização e metodologias de coleta.
**Contexto Operacional:**
A PRIO opera múltiplos FPSOs (Floating Production Storage and Offloading units) e plataformas fixas na Bacia de Campos, offshore Rio de Janeiro, com operações logísticas suportadas a partir do Porto de Macaé. A empresa implementou recentemente soluções de IA através de parceria com Shape Digital para manutenção preditiva, posicionando-se na vanguarda da otimização operacional offshore.
**Escopo do Inventário:**
Este relatório cobre 14 categorias principais de dados, desde estrutura de rede e especificações de frota até parâmetros de incerteza e integração digital, fornecendo um framework completo para modelagem matemática avançada.
---
## 1. ESTRUTURA DA REDE LOGÍSTICA
### 1.1 Base de Suprimentos (Shore Facility)
#### Porto de Macaé - Base Principal de Operações
**Identificação e Localização**
| Parâmetro | Especificação | Fonte de Dados | Frequência de Atualização |
|-----------|---------------|----------------|---------------------------|
| **Nome Oficial** | Porto Engenheiro Zephyrino Lavanère Machado Filho | ANTAQ | Estática |
| **Localização Geográfica** | 22°23'S, 41°47'W | Cartas Náuticas CHM | Estática |
| **Código Portuário** | BRMEA | ANTAQ | Estática |
| **Distância do Rio de Janeiro** | 182 km | - | Estática |
**Especificações Técnicas e Restrições**
| Parâmetro | Valor | Unidade | Implicação para Modelagem |
|-----------|-------|---------|---------------------------|
| **Calado Máximo** | 7,9 | metros | Restrição de tamanho de embarcação |
| **Comprimento Máximo do Navio** | 97 | metros | Restrição de classe de PSV |
| **Capacidade de Carga Máxima** | 5.513 | toneladas | Limite de deadweight |
| **Horário de Operação** | 24/7 | - | Sem restrição temporal |
| **Número de Berços** | Múltiplos (variável) | - | Restrição de capacidade simultânea |
**Tempos Operacionais no Porto**
```
Dados a Coletar (Minutos/Horas):
FASE 1: ATRACAÇÃO E PREPARAÇÃO
- Dock_assignment_time: 30-60 minutos
* Variabilidade: ±15 minutos
* Fonte: Histórico operacional do porto
FASE 2: CARREGAMENTO DE CARGAS LÍQUIDAS
- Liquid_cargo_loading_time: 2-4 horas
* Dependente de: volume, número de produtos, taxa de bombeamento
* Taxa típica: 100-200 m³/hora
* Fonte: Registros de loading operations
FASE 3: CARREGAMENTO DE GRANEL SECO
- Dry_bulk_loading_time: 1-3 horas
* Taxa típica: 50-100 m³/hora (pneumático)
* Dependente de: tipo de material, equipamento
* Fonte: Registros operacionais
FASE 4: CARREGAMENTO DE DECK CARGO
- Deck_cargo_loading_time: 3-6 horas
* Dependente de: número de lifts, peso dos itens, complexidade
* Tempo por lift: 15-30 minutos
* Fonte: Registros de guindaste
FASE 5: DOCUMENTAÇÃO E LIBERAÇÃO
- Documentation_time: 30-60 minutos
* Inclui: verificação de carga, papelada, clearance
* Fonte: Administração portuária
TOTAL TURNAROUND TIME: 6-12 horas (média: 8 horas)
```
**Custos Portuários**
| Item de Custo | Valor (USD) | Unidade | Frequência de Atualização |
|---------------|-------------|---------|---------------------------|
| **Taxas Portuárias** | 500-1.500 | Por chamada | Trimestral |
| **Pilotagem** | 300-800 | Por movimento | Trimestral |
| **Agenciamento Marítimo** | 200-500 | Por chamada | Trimestral |
| **Documentação** | 100-300 | Por viagem | Trimestral |
**Capacidades de Armazenamento (Dados a Coletar)**
```
Por Tipo de Carga:
- Diesel: capacidade_tanques (m³), taxa_reposição (m³/dia)
- Água Potável: capacidade_tanques (m³), taxa_reposição (m³/dia)
- Lama de Perfuração: capacidade_tanques (m³)
- Químicos: capacidade_armazenamento por tipo (m³)
- Granel Seco: capacidade_silos (m³)
- Deck Cargo: área_pátio (m²), capacidade_peso (toneladas)
```
### 1.2 Instalações Offshore (Nós da Rede)
#### Matriz de Distâncias e Conectividade
**Distâncias Náuticas entre Nós da Rede**
| Origem | Destino | Distância (NM) | Distância (km) | Tempo @ 12 nós | Tempo @ 14 nós |
|--------|---------|----------------|----------------|----------------|----------------|
| **Macaé** | FPSO Peregrino | 46 | 85 | 3,8h | 3,3h |
| **Macaé** | Polvo/FPSO Bravo | 70 | 130 | 5,8h | 5,0h |
| **Macaé** | FPSO Valente (Frade) | 67 | 125 | 5,6h | 4,8h |
| **Macaé** | FPSO Forte (Albacora Leste) | 75 | 139 | 6,3h | 5,4h |
| **Peregrino** | Polvo | 15 | 28 | 1,3h | 1,1h |
| **Polvo** | FPSO Bravo | 5,9 | 11 | 0,5h | 0,4h |
**Nota:** 1 Nautical Mile (NM) = 1,852 km
**Fatores de Ajuste de Tempo por Condições Climáticas**
| Condição | Hs (altura onda) | Fator de Tempo | Redução de Velocidade |
|----------|------------------|----------------|----------------------|
| **Boas Condições** | < 2m | 1,0x | 0% |
| **Condições Moderadas** | 2-3m | 1,1-1,3x | 10-20% |
| **Condições Ruins** | 3-4m | 1,2-1,4x | 20-35% |
| **Condições Severas** | > 4m | Operações suspensas | - |
#### Inventário Detalhado de Instalações
**1. FPSO Bravo (TubarÃo Martelo)**
```yaml
Identificação:
nome: FPSO Bravo
campo: TubarÃo Martelo + Polvo (cluster)
localização: Campos Sul
coordenadas: [classificar com dados PRIO]
Características Operacionais:
tipo: FPSO (Floating Production Storage Offloading)
distância_macaé: 70 NM
profundidade_água: 121 m
Capacidades:
produção_óleo: ~15.000-16.000 boe/d (cluster Polvo-TBMT)
armazenamento_óleo: ~600.000 barris (estimado)
Infraestrutura de Recebimento:
guindastes: [coletar número e capacidade]
área_convés_disponível: [coletar em m²]
capacidade_simultânea: [coletar número de operações]
Conexões Subsea:
- tieback_polvo: 11 km (completado 2021)
Consumo Semanal Típico (Operações Normais):
diesel: 500 m³
água_potável: 400 m³
químicos: 100 m³
deck_cargo: 150 toneladas
```
**2. FPSO Valente (Frade)**
```yaml
Identificação:
nome: FPSO Valente (ex-FPSO Frade)
campo: Frade + Wahoo (em desenvolvimento)
localização: Campos Norte
coordenadas: [classificar]
Características Operacionais:
tipo: FPSO
distância_macaé: 67 NM (125 km)
profundidade_água: 1.200 m
Capacidades:
processamento_óleo: 100.000 bpd
produção_atual_frade: 38.300 bpd (1T25)
produção_adicional_wahoo: ~40.000 bpd (esperado 2026)
armazenamento_óleo: 1,6 milhões barris
Desenvolvimentos Futuros:
- wahoo_tieback: ~30 km (um dos maiores do Brasil)
- startup_esperado: 2026
- poços_wahoo: até 11 (produtores, injetores, contingência)
Consumo Semanal Típico (Operações Normais):
diesel: 350 m³
água_potável: 250 m³
químicos: 100 m³
deck_cargo: 150 toneladas
Consumo Durante Perfuração (Campanha Ativa):
lama_perfuração: 800 m³/semana
granel_seco: 200 m³/semana
deck_cargo: 300-400 toneladas/semana
```
**3. FPSO Forte (Albacora Leste)**
```yaml
Identificação:
nome: FPSO Forte (ex-P-50)
campo: Albacora Leste
localização: Campos Norte
distância_macaé: 75 NM
Capacidades:
processamento_óleo: 180.000 bpd
produção_atual: 22.000 bpd (1T25)
compressão_gás: 6 milhões m³/dia
armazenamento_óleo: 1+ milhão barris
deadweight: 248.520 DWT
Desenvolvimentos Futuros:
- tieback_norte: 12 km (planejado 2026)
- objetivo: reservatório marginal
Consumo Semanal Típico:
diesel: 500 m³
água_potável: 400 m³
químicos: 120 m³
granel_seco: 100 m³
deck_cargo: 200 toneladas
```
**4. FPSO Peregrino + Plataformas A, B, C**
```yaml
Identificação:
nome: FPSO Peregrino
campo: Peregrino (BM-C-7, BM-C-47)
localização: 85 km offshore
profundidade_água: 120 m
Características:
tipo: FPSO + 3 plataformas fixas de apoio
distância_macaé: 46 NM
Capacidades:
processamento_óleo: 110.000 bpd
processamento_água: 300.000 bpd
produção_atual: ~100.000 bpd (campo total)
produção_prio: ~38.200 bpd (1T25)
armazenamento: ~1 milhão barris (estimado)
Infraestrutura:
poços_produtores: 27
poços_injetores: 6
Características do Óleo:
api_gravity: 14° (óleo pesado)
mercado_principal: refinarias asiáticas
break_even: ~$35/barril
Status de Aquisição:
- 40% adquirido da Sinochem (dez 2024, $1,92 bi)
- 60% em aquisição da Equinor (mai 2025, $3,35 bi)
- operatorship_transfer: em processo
Consumo Semanal Típico (FPSO + 3 Plataformas):
diesel: 800 m³
água_potável: 600 m³
químicos: 190 m³
deck_cargo: 340 toneladas
Distância para Otimização de Carga:
peregrino_to_polvo: 28 km (15 NM)
oportunidade: consolidação de cargas de alívio
```
**5. Plataforma Polvo A (Wellhead Platform)**
```yaml
Identificação:
nome: Plataforma Polvo A
tipo: Plataforma fixa (wellhead)
campo: Polvo (BM-C-8)
Características:
área: 134 km²
profundidade_água: 121 m
ownership: 100% PRIO
Infraestrutura:
poços_produtores: 11
poços_injetores: 1
produção_histórica: ~8.000 bpd (início operações PRIO)
Integração:
conexão_fpso_bravo: 11 km subsea tieback (2021)
benefício: eliminou necessidade de FPSO dedicado
Consumo Semanal Típico:
diesel: 100 m³
água_potável: 100 m³
químicos: 20 m³
deck_cargo: 50 toneladas
```
#### Dados Operacionais por Instalação (Template de Coleta)
```
Para cada instalação k ∈ K, coletar:
1. IDENTIFICAÇÃO
- installation_id: código único
- name: nome oficial
- type: FPSO, Fixed Platform, Wellhead Platform
- field: campo petrolífero
- operator: operador (PRIO ou outro)
- ownership_prio: % de participação PRIO
2. LOCALIZAÇÃO GEOGRÁFICA
- latitude: graus decimais
- longitude: graus decimais
- water_depth: profundidade (metros)
- distance_from_base: distância de Macaé (NM)
- coordinates_datum: WGS84 ou outro
3. CAPACIDADES DE PRODUÇÃO
- oil_processing_capacity: bpd
- current_production: bpd (atual)
- gas_compression: m³/dia
- water_processing: bpd
- oil_storage_capacity: barris
- current_oil_inventory: barris (tempo real)
4. CARACTERÍSTICAS DO ÓLEO
- api_gravity: grau API
- sulfur_content: % enxofre
- viscosity: cP @ temperatura
- bsw: Basic Sediments and Water (%)
5. INFRAESTRUTURA DE RECEBIMENTO
- number_of_cranes: quantidade
- crane_capacity: toneladas por guindaste
- deck_space_available: m²
- max_deck_loading: toneladas/m²
- simultaneous_operations_capacity: número
6. CAPACIDADES DE ARMAZENAMENTO DE INSUMOS
Por tipo de carga c:
- storage_capacity[k,c]: capacidade máxima (m³ ou t)
- current_inventory[k,c]: estoque atual (tempo real)
- safety_stock_minimum[k,c]: estoque de segurança ANP
- reorder_point[k,c]: ponto de reposição
7. TAXAS DE TRANSFERÊNCIA
- liquid_discharge_rate: m³/hora por produto
- dry_bulk_discharge_rate: m³/hora
- deck_cargo_lift_time: minutos por lift
- pumping_equipment_capacity: m³/hora
8. JANELAS OPERACIONAIS
- preferred_operation_hours: janelas preferenciais
- restrictions: restrições de horário
- simultaneous_vessel_limit: número máximo de PSVs
- helicopter_schedule: janelas de helicóptero (conflito)
9. RESTRIÇÕES AMBIENTAIS/OPERACIONAIS
- max_wind_speed_crane: m/s para operações de guindaste
- max_wave_height_operations: metros para carga/descarga
- max_wave_height_approach: metros para aproximação
- max_current_speed: nós para DP
- min_visibility: NM para aproximação
10. CONSUMO HISTÓRICO (12 meses)
Por tipo de carga c:
- monthly_consumption[k,c,month]: consumo mensal
- demand_variability[k,c]: desvio padrão
- emergency_orders_frequency[k,c]: frequência de emergências
- drilling_campaign_impact[k,c]: fator multiplicador
11. DADOS DE BACKHAUL
- return_cargo_weekly[k]: peso médio de retorno (toneladas)
- waste_container_frequency[k]: frequência
- empty_drum_weight[k]: peso de containers vazios
```
---
## 2. FROTA DE EMBARCAÇÕES (FLEET CHARACTERISTICS)
### 2.1 Inventário de Embarcações Contratadas
#### Contratos Solstad Offshore (~$100 milhões combinados)
**CSV Normand Pioneer**
```yaml
Contrato:
tipo: Construction Support Vessel (CSV)
duração_extensão: 18 meses (até agosto 2025)
valor_estimado: [parte dos $100M totais]
Especificações Técnicas:
tipo_embarcação: CSV especializado
loa: 95-110 m (estimado)
beam: 20-24 m (estimado)
calado_carregado: [coletar]
Capacidades:
deck_cargo_capacity: 3.500-4.500 toneladas
clear_deck_area: 1.500+ m²
crane_capacity: 100-250 toneladas
velocidade_serviço: 12-14 nós
Capacidades Especiais:
- Trenching (abertura de valas submarinas)
- Flexible pipe-laying (lançamento de dutos flexíveis)
- Towing (reboque)
- Anchor handling (manuseio de âncoras)
- ROV operations
Sistema de Posicionamento:
dp_class: DP-2 ou DP-3
Consumo de Combustível:
transit: 20-30 toneladas/dia (equipamento especializado)
standby: 6-10 toneladas/dia
dp_operations: 8-12 toneladas/dia
Aplicações:
- Suporte a exploração
- Instalação de infraestrutura subsea
- Suporte a produção
- Operações de tieback (Wahoo, Albacora Leste)
```
**PSV Normand Carioca (Well Stimulation Vessel)**
```yaml
Contrato:
tipo: Convertido para well stimulation
duração_extensão: até dezembro 2027
cliente_primário: Equinor (para campo Bacalhau)
conversão: Financiada por Equinor
Especificações Originais PSV:
classe: Large PSV (provavelmente UT 874 ou similar)
loa: 85-91 m (estimado)
Capacidades Especializadas:
função_primária: Suporte a atividades de perfuração
modificações: Equipamentos para well completion
Consumo Estimado:
similar_large_psv: 18-22 toneladas/dia trânsito
Taxa de Charter:
estimativa: $20.000-35.000/dia (well stimulation vessel)
```
#### Classes de PSV Padrão (Fleet Composition Assumida)
**Classe 1: PSV Padrão (UT 755 Type)**
```yaml
Características Gerais:
número_estimado_frota: 4-6 embarcações (dedicadas/charter frequente)
tipo_contrato: Long-term charter
Especificações Técnicas:
loa: 71,9 m
beam: 16,0 m
calado_carregado: 5,7 m
velocidade_serviço: 15,1 nós (design)
velocidade_operacional: 13 nós (média)
Capacidades de Carga:
deck_cargo_capacity: 2.450 toneladas
clear_deck_area: 900-1.000 m²
max_deck_loading: 5-7 toneladas/m²
total_deadweight: ~4.500 toneladas (estimado)
Tanques e Compartimentos:
fuel_oil_capacity: 994 m³
fresh_water_capacity: 812 m³
liquid_mud_capacity: 2.500 m³
dry_bulk_capacity: 600 m³
base_oil: [coletar se disponível]
chemical_tanks: múltiplos (segregação)
Acomodação:
crew: 13 pessoas (típico)
passenger_capacity: 28 pessoas total
Sistema de Posicionamento:
dp_class: DP-2
thrust_power: [coletar kW]
Consumo de Combustível:
transit_13_knots: 15-18 toneladas/dia
standby_dp: 3-5 toneladas/dia
port_operations: 2-3 toneladas/dia
fuel_type: Marine Gas Oil (MGO)
Custos:
daily_charter_rate: $8.000-15.000/dia (mercado 2024-2025)
variação: Dependente de condições de mercado
long_term_discount: [coletar se contrato PRIO disponível]
```
**Classe 2: PSV Grande (UT 874 / PX 121 Type)**
```yaml
Características Gerais:
número_estimado_frota: 2-3 embarcações (long-term charter)
aplicação: Cargas mais pesadas, maior autonomia
Especificações Técnicas:
loa: 85-91,4 m
beam: 18-18,3 m
calado_carregado: 5,8-6,5 m
velocidade_serviço: 14-15 nós
velocidade_operacional: 12,5 nós (média)
Capacidades de Carga:
deck_cargo_capacity: 2.800-3.200 toneladas
clear_deck_area: 1.040-1.200 m²
total_deadweight: 4.900-5.500 toneladas
Tanques e Compartimentos:
liquid_mud_capacity: 3.000-3.500 m³
dry_bulk_capacity: 800-1.000 m³
fresh_water_capacity: 1.000-1.500 m³
diesel_fuel_capacity: 1.200-1.500 m³
Acomodação:
crew: 13-15 pessoas
passenger_capacity: 40-50 pessoas total
Sistema de Posicionamento:
dp_class: DP-2 ou DP-3
nota: DP-3 tem redundância adicional
Consumo de Combustível:
transit: 18-22 toneladas/dia
standby_loading: 4-7 toneladas/dia
port: 2-4 toneladas/dia
Custos:
daily_charter_rate_dp2: $12.000-22.000/dia
daily_charter_rate_dp3: $15.000-25.000/dia
mercado_referência: 2024-2025
```
### 2.2 Parâmetros Técnicos para Modelagem
#### Template de Dados por Embarcação
```
Para cada embarcação v ∈ V:
IDENTIFICAÇÃO
- vessel_id: código único
- vessel_name: nome
- vessel_class: Standard PSV, Large PSV, CSV, WSV
- owner: Solstad Offshore, etc.
- contract_type: Long-term, Spot, Dedicated
- contract_start_date: data início
- contract_end_date: data término
- daily_charter_rate: USD/dia
DIMENSÕES PRINCIPAIS
- length_overall: metros
- beam: metros
- draught_loaded: metros
- draught_ballast: metros
- gross_tonnage: GT
- net_tonnage: NT
CAPACIDADES DE CARGA
- deck_cargo_capacity: toneladas
- clear_deck_area: m²
- deck_loading_limit: toneladas/m²
- total_deadweight: toneladas
TANQUES/COMPARTIMENTOS
Por compartimento w:
- compartment_id: identificador
- compartment_type: Fresh Water, Diesel, Mud, etc.
- compartment_capacity: m³
- fill_level_max: 95% (safety margin)
- compatible_cargoes: lista de cargas compatíveis
CAPACIDADES DE GRANEL
- liquid_mud_total: m³
- dry_bulk_total: m³
- base_oil: m³
- brine: m³
- methanol: m³
PERFORMANCE E PROPULSÃO
- engine_power: kW
- propulsion_type: Diesel-electric, etc.
- service_speed: nós (design)
- operational_speed: nós (típica)
- max_speed: nós
- fuel_capacity: m³ ou toneladas
CONSUMO DE COMBUSTÍVEL
- fuel_type: MGO, HFO, etc.
- fuel_consumption_model:
* transit[speed]: f(velocidade) - t/dia
* dp_operations[wave_height]: f(Hs) - t/dia
* port_operations: constante - t/dia
- historical_consumption_data: 12 meses de dados reais
POSICIONAMENTO DINÂMICO
- dp_class: DP-1, DP-2, DP-3, Nenhum
- thrust_capacity: kW total
- number_of_thrusters: quantidade
- max_wind_dp: m/s para manter posição
- max_wave_dp: metros Hs
- max_current_dp: nós
LIMITAÇÕES OPERACIONAIS
- max_wind_transit: m/s
- max_wind_cargo_ops: m/s
- max_wave_transit: metros Hs
- max_wave_cargo_ops: metros Hs
- min_visibility: NM
ACOMODAÇÃO
- crew_size: número de tripulantes
- total_berths: total de leitos
- passenger_capacity: capacidade adicional
EQUIPAMENTOS ESPECIAIS
- crane_capacity: toneladas (se equipado)
- rov_capability: sim/não
- firefighting_class: FiFi-1, FiFi-2, etc.
- oil_recovery_equipment: sim/não
DISPONIBILIDADE E MANUTENÇÃO
- availability_status: Available, In Use, Maintenance, etc.
- current_location: coordenadas ou instalação
- last_maintenance: data
- next_maintenance_due: data
- maintenance_duration: dias típicos
- drydock_schedule: próximo drydock programado
HISTÓRICO OPERACIONAL (12 meses)
- number_of_trips: total de viagens
- average_trip_duration: horas
- utilization_rate: % tempo produtivo
- fuel_efficiency_actual: t/NM
- weather_delays_total: horas/dias
- mechanical_issues: número e tipo
RESTRIÇÕES REGULATÓRIAS
- flag_state: bandeira
- imo_number: número IMO
- classification_society: DNV, ABS, etc.
- certificates_expiry: datas de expiração
- solas_compliant: sim/não
- marpol_compliant: sim/não
- brazilian_cabotage: permissão para cabotagem
```
### 2.3 Matriz de Compatibilidade de Carga por Embarcação
```
Coletar para cada combinação (v, c):
can_carry[v,c]: booleano (pode transportar?)
tank_required[v,c]: qual tanque/compartimento
max_quantity[v,c]: quantidade máxima (m³ ou t)
loading_rate[v,c]: taxa de carregamento (m³/h ou t/h)
discharge_rate[v,c]: taxa de descarga (m³/h ou t/h)
```
### 2.4 Custos Operacionais Detalhados
**Custos de Charter**
| Tipo de Embarcação | Taxa Diária Mínima | Taxa Diária Máxima | Média Mercado | Fonte |
|--------------------|--------------------|--------------------|--------------|----|
| **Standard PSV (DP-2)** | $8.000 | $15.000 | $11.500 | Fearnley Offshore, Spinergie |
| **Large PSV (DP-2)** | $12.000 | $22.000 | $17.000 | Fearnley Offshore |
| **Large PSV (DP-3)** | $15.000 | $25.000 | $20.000 | Fearnley Offshore |
| **CSV/Specialized** | $25.000 | $50.000 | $37.500 | Contratos específicos |
| **Well Stimulation** | $20.000 | $35.000 | $27.500 | Estimativa mercado |
**Nota:** Contratos long-term da PRIO com Solstad podem ter descontos de 10-20% sobre taxas spot.
**Custos de Combustível**
```
Coletar Dados de Combustível
:
PREÇOS
- current_mgo_price: $/tonelada (atual)
- price_forecast_monthly: previsão 12 meses
- price_volatility: desvio padrão histórico
- hedging_contracts: contratos de hedge se existentes
CONSUMO POR MODO OPERACIONAL
Para cada embarcação v:
Transit Mode:
- fuel_consumption_transit[v, speed]:
* @11 nós: X t/dia
* @12 nós: Y t/dia
* @13 nós: Z t/dia
* @14 nós: W t/dia
DP Operations:
- fuel_consumption_dp[v, wave_height]:
* Hs < 2m: A t/dia
* Hs 2-3m: B t/dia
* Hs 3-4m: C t/dia
Port Operations:
- fuel_consumption_port[v]: constante - D t/dia
CÁLCULO DE CUSTO POR VIAGEM
Exemplo para rota Macaé → Frade → Macaé:
- Distância: 67 NM × 2 = 134 NM
- Velocidade: 12 nós
- Tempo trânsito: 11,2 horas
- Tempo offshore: 6 horas (médio)
- Tempo total: 17,2 horas
Consumo:
- Trânsito: (11,2h / 24h) × 18 t/dia = 8,4 t
- DP offshore: (6h / 24h) × 5 t/dia = 1,25 t
- Total: 9,65 toneladas
Custo combustível: 9,65 t × $700/t = $6.755
TOTAL VIAGEM:
- Charter: 0,72 dias × $17.000/dia = $12.240
- Combustível: $6.755
- Porto: $1.000 (estimado)
- TOTAL: $19.995
```
---
## 3. DEMANDA E INVENTÁRIO DE INSUMOS (INBOUND LOGISTICS)
### 3.1 Catálogo de Tipos de Carga
#### A. Cargas Líquidas (Liquid Bulk Cargo)
**Diesel Marítimo (Marine Diesel Oil)**
```yaml
Características Físicas:
densidade: 850 kg/m³
viscosidade: [coletar @ temperatura]
ponto_fulgor: > 60°C
Requisitos de Segregação:
segregação_requerida: Sim
incompatível_com: Água potável, químicos, metanol
tempo_limpeza_tanque: 4 horas (para água)
Volumes Típicos:
volume_por_viagem: 200-800 m³
pedido_mínimo: 50 m³
pedido_máximo: [capacidade tanque embarcação]
Taxas de Transferência:
taxa_carregamento_porto: 100-150 m³/hora
taxa_descarga_plataforma: 80-120 m³/hora
método: Bombeamento por mangote
Consumo por Instalação (m³/dia):
fpso_valente: 45 m³/dia (exemplo documento)
fpso_bravo: 40-50 m³/dia (estimado)
fpso_forte: 50-60 m³/dia (estimado)
fpso_peregrino: 80-100 m³/dia (maior, 4 instalações)
plataforma_polvo: 10-15 m³/dia
plataformas_peregrino_abc: 15-20 m³/dia cada
Estoque de Segurança (ANP Resolução 43/2007):
mínimo_regulatório: 48 horas de consumo
exemplo_valente: 45 m³/dia × 2 dias = 90 m³
Custos:
preço_fornecedor: [coletar $/m³]
custo_handling_porto: $5-10/m³
```
**Água Potável (Fresh Water)**
```yaml
Características Físicas:
densidade: 1.000 kg/m³
padrão_qualidade: Potável (consumo humano)
tratamento_requerido: Cloração, filtração
Requisitos de Segregação:
segregação_requerida: Sim (crítico)
incompatível_com: Todos os outros líquidos
tempo_limpeza_tanque: 4 horas (se contaminação)
Volumes Típicos:
volume_por_viagem: 300-600 m³
Taxas de Transferência:
taxa_carregamento_porto: 100-200 m³/hora
taxa_descarga_plataforma: 100-150 m³/hora
Consumo por Instalação (m³/dia):
fpso_valente: 35 m³/dia (exemplo)
fpso_bravo: 30-40 m³/dia
fpso_forte: 40-50 m³/dia
fpso_peregrino: 60-80 m³/dia
plataformas_fixas: 5-10 m³/dia cada
Estoque de Segurança (ANP):
mínimo_regulatório: 36 horas de consumo
exemplo_valente: 35 m³/dia × 1,5 dias = 52,5 m³
Custos:
preço_água_tratada: [coletar $/m³]
custo_handling: $5-10/m³
```
**Lama de Perfuração (Drilling Mud)**
```yaml
Tipo 1: Oil-Based Mud (OBM)
densidade: 1.200-1.400 kg/m³
composição: Base óleo mineral + aditivos
aplicação: Perfuração em formações reativas
segregação: Sim (com todos exceto base oil)
Tipo 2: Water-Based Mud (WBM)
densidade: 1.100-1.300 kg/m³
composição: Base água + bentonita + aditivos
aplicação: Perfuração em formações estáveis
segregação: Sim (incompatível com OBM)
tempo_limpeza_tanque: 6 horas (OBM → WBM)
Volumes Típicos:
volume_por_viagem: 400-1.000 m³
demanda_normal: 0 (sem perfuração)
demanda_drilling_campaign: 800-1.200 m³/semana
Taxas de Transferência:
taxa_carregamento: 80-120 m³/hora
taxa_descarga: 60-100 m³/hora
método: Bombeamento com mixer
Aplicabilidade:
fpso_valente: Campanha Wahoo (2026)
fpso_forte: Tieback norte (2026)
operações_workover: Todas instalações
Custos:
obm_price: [coletar $/m³]
wbm_price: [coletar $/m³]
handling: $8-12/m³
```
**Salmoura (Brine)**
```yaml
Características:
densidade: 1.200 kg/m³
composição: Solução saturada de sais
aplicação: Controle de pressão, workover
Volumes Típicos:
volume_por_viagem: 200-500 m³
demanda: Intermitente (operações especiais)
Segregação:
compatibilidade_água: Mínima limpeza requerida (1h)
Custos:
preço: [coletar $/m³]
```
**Metanol**
```yaml
Características:
densidade: 792 kg/m³
aplicação: Inibidor de hidrato
hazard: Inflamável, tóxico
Requisitos de Segregação:
segregação_crítica: Sim
incompatível: Todos os outros líquidos
tempo_limpeza: 8 horas (maior de todos)
Volumes Típicos:
volume_por_viagem: 100-400 m³
demanda: Sazonal (inverno maior)
Custos:
preço_metanol: [coletar $/m³]
handling_especial: $10-15/m³
```
**Produtos Químicos (Chemical Products)**
```yaml
Tipos Diversos:
- Inibidores de corrosão
- Biocidas
- Desemulsificantes
- Antiespumantes
- Removedores de parafina
Características Gerais:
densidade: 800-1.100 kg/m³ (variável)
segregação: Sim (múltiplos tanques necessários)
Volumes Típicos:
volume_total_viagem: 50-200 m³
número_de_produtos: 3-8 tipos diferentes
volume_por_produto: 10-50 m³
Taxas de Transferência:
taxa_carregamento: 20-50 m³/hora
taxa_descarga: 20-40 m³/hora
Demanda Semanal por Instalação:
fpso_grande: 80-120 m³/semana
fpso_médio: 50-80 m³/semana
plataforma_fixa: 10-20 m³/semana
Custos:
preço_médio: [coletar $/m³ por tipo]
handling: $8-12/m³
```
**Base Oil**
```yaml
Características:
densidade: 850-900 kg/m³
aplicação: Base para lama de perfuração OBM
Volumes Típicos:
volume_por_viagem: 100-300 m³
demanda: Durante campanhas de perfuração
Segregação:
compatível_com: Diesel, OBM
tempo_limpeza: 0-2 horas (compatível)
```
#### B. Cargas de Granel Seco (Dry Bulk Cargo)
**Cimento (Cement)**
```yaml
Características:
densidade_aparente: 1.500 kg/m³
tipo: Portland ou especial para poços
sensibilidade_umidade: Alta (crítico)
Volumes Típicos:
volume_por_viagem: 100-400 m³
peso_equivalente: 150-600 toneladas
Método de Transferência:
sistema: Pneumático
taxa_transferência: 50-100 m³/hora
pressão_ar: [coletar bar]
Demanda:
operações_normais: 0
campanha_perfuração: 150-300 m³/semana
operações_cimentação: 200-400 m³ (por operação)
Tempo de Descarga:
típico: 2-4 horas
preparação_sistema: 30-60 minutos
limpeza_sistema: 1-2 horas
Restrições Climáticas:
max_wind: 15 m/s
max_wave: 2,5 m
chuva: Operações suspensas
Custos:
preço_cimento: [coletar $/tonelada]
handling_porto: $15-20/tonelada
```
**Barita (Barite)**
```yaml
Características:
densidade_aparente: 2.500-4.200 kg/m³
composição: Sulfato de bário (BaSO₄)
aplicação: Agente densificante para lama
Volumes Típicos:
volume_por_viagem: 100-300 m³
peso_equivalente: 250-1.260 toneladas (!)
Nota Importante:
peso_volumétrico_alto: Limitação por peso, não volume
Método de Transferência:
sistema: Pneumático
taxa_transferência: 50-80 m³/hora
Demanda:
campanha_perfuração_ativa: 100-200 m³/semana
Custos:
preço_barita: [coletar $/tonelada]
handling: $18-25/tonelada
```
**Bentonita (Bentonite)**
```yaml
Características:
densidade_aparente: 600-800 kg/m³
aplicação: Agente viscosificante para WBM
Volumes Típicos:
volume_por_viagem: 50-200 m³
peso_equivalente: 30-160 toneladas
Método de Transferência:
sistema: Pneumático
taxa_transferência: 40-80 m³/hora
Demanda:
campanha_wbm: 50-150 m³/semana
Custos:
preço: [coletar $/tonelada]
```
**Químicos em Pó (Powdered Chemicals)**
```yaml
Tipos:
- Aditivos para lama
- Agentes de controle de filtrado
- Redutores de viscosidade
Características:
densidade_aparente: 800-1.200 kg/m³
Volumes Típicos:
volume_por_viagem: 50-150 m³
Método de Transferência:
sistema: Pneumático
taxa: 30-60 m³/hora
Tempo Limpeza Sistema:
típico: 2-4 horas
```
#### C. Carga de Convés (Deck Cargo)
**Tubos de Perfuração (Drill Pipes)**
```yaml
Especificações:
comprimento_padrão: 40 ft (12,2 m)
diâmetro_típico: 5" (127 mm)
peso_individual: 5-15 toneladas/tubo
material: Aço liga especial
Arranjo no Convés:
empilhamento: Horizontal em racks
altura_stack: Máximo 2,0 m acima convés
amarração: Chains e binders
Carga Típica por Viagem:
número_tubos: 20-60 tubos
peso_total: 200-800 toneladas
espaço_requerido: 250-600 m² (comprimento!)
Manuseio:
método: Guindaste de plataforma
tempo_por_lift: 15-25 minutos
capacidade_guindaste_requerida: 20+ toneladas
Restrições Climáticas:
max_wind: 15 m/s
max_wave: 2,5 m
Demanda:
campanha_perfuração: 200-500 toneladas/semana
mobilização_sonda: 800+ toneladas (única vez)
Custos:
handling_porto: $20-30/tonelada
offshore_handling: $500-800/hora guindaste
```
**Tubos de Revestimento (Casing Pipes)**
```yaml
Especificações:
comprimento: 40 ft (12,2 m) típico
diâmetro: 7"-20" (variável por seção)
peso_individual: 10-30 toneladas/tubo
Carga Típica:
peso_total_viagem: 300-1.000 toneladas
aplicação: Operações de completação
Manuseio:
similar_drill_pipes: Porém mais pesado
tempo_por_lift: 20-30 minutos
Demanda:
completação_poço: 500-1.000 toneladas (por poço)
frequência: Conforme cronograma de poços
```
**Containers ISO**
```yaml
Tipo 1: Container 20 ft
dimensões: 6,1 m × 2,4 m × 2,6 m
peso_vazio: ~2,3 toneladas
capacidade_carga: até 25 toneladas
peso_médio_carregado: 10-15 toneladas
Tipo 2: Container 40 ft
dimensões: 12,2 m × 2,4 m × 2,6 m
peso_vazio: ~3,7 toneladas
capacidade_carga: até 30 toneladas
peso_médio_carregado: 15-20 toneladas
Conteúdo Típico:
- Peças sobressalentes
- Ferramentas
- Equipamentos pequenos
- Consumíveis de oficina
- EPIs e materiais de segurança
Carga Típica por Viagem:
número_containers_20ft: 4-10
número_containers_40ft: 2-5
peso_total: 100-250 toneladas
Manuseio:
método: Guindaste (spreader bar)
tempo_por_container_20ft: 10-15 minutos
tempo_por_container_40ft: 15-20 minutos
Demanda Semanal:
fpso_grande: 6-10 containers
fpso_médio: 4-6 containers
plataforma_fixa: 1-3 containers
```
**Equipamentos e Maquinário**
```yaml
Categorias:
- Bombas (centrifugas, submersíveis)
- Compressores
- Geradores
- Sistemas elétricos
- Equipamentos de processo
- Ferramentas grandes
Características:
peso_por_item: 1-100 toneladas
dimensões: Altamente variável
Requisitos Especiais:
pontos_içamento: Certificados
centro_gravidade: Baixo (estabilidade)
proteção: Contra água salgada
Carga Típica:
peso_médio_viagem: 50-200 toneladas
número_itens: 3-15
Manuseio:
método: Guindaste com rigging especial
tempo_por_lift: 20-45 minutos
planejamento_lifts: Requerido (sequência)
Demanda:
manutenção_programada: Trimestral
substituição_equipamentos: Ad hoc
projetos_especiais: Conforme projeto
```
**Tanques e Tambores de Químicos**
```yaml
Especificações:
tanques_portáteis: 1-5 toneladas cada
tambores_metálicos: 200 kg típico
Carga Típica:
peso_total_viagem: 10-50 toneladas
número_unidades: 5-30
Manuseio:
método: Guindaste com slings
tempo_por_unidade: 5-10 minutos
Demanda:
semanal: 10-30 toneladas por instalação
```
**Provisões e Alimentos**
```yaml
Conteúdo:
- Alimentos não perecíveis
- Alimentos congelados (reefer containers)
- Bebidas
- Itens de cozinha
- Produtos de limpeza
Embalagem:
containers_reefer: 20 ft refrigerados
containers_secos: 20 ft padrão
Carga Típica:
peso_total: 2-10 toneladas
containers: 1-2 por viagem
Frequência:
semanal_por_instalação: 1 entrega
Manuseio:
rápido: Prioritário (perecíveis)
tempo: 15-30 minutos total
```
**Containers de Resíduos (Return Cargo / Backhaul)**
```yaml
Tipos de Resíduos:
classe_1: Resíduos perigosos (químicos)
classe_2a: Resíduos não inertes
classe_2b: Resíduos inertes
Containers Típicos:
cestos_waste: 1-3 toneladas cada
containers_20ft: Resíduos diversos
Peso de Retorno Semanal:
fpso_grande: 20-30 toneladas
fpso_médio: 15-25 toneladas
plataforma_fixa: 10-15 toneladas
Manuseio:
similar_containers_cheios: Mesmos tempos
documentação_especial: Manifesto de resíduos
Destinação:
porto_macaé: Área dedicada
tratamento: Empresas especializadas
regulação: IBAMA, CONAMA
```
### 3.2 Perfis de Demanda por Instalação
#### Template de Coleta de Demanda
```
Para cada instalação k e tipo de carga c:
DEMANDA BASE (Operações Normais)
- daily_consumption[k,c]: Consumo diário (m³/dia ou t/dia)
- weekly_demand[k,c]: Demanda semanal total
- monthly_pattern[k,c,month]: Padrão mensal (12 meses)
- day_of_week_factor[k,c,dow]: Fator por dia da semana
VARIABILIDADE
- demand_std_dev[k,c]: Desvio padrão histórico
- coefficient_of_variation[k,c]: CV = std_dev / mean
- min_observed[k,c]: Demanda mínima observada
- max_observed[k,c]: Demanda máxima observada
SAZONALIDADE
- seasonal_index[k,c,month]: Índice sazonal por mês
* Exemplo: Janeiro = 1,1 (10% acima média)
* Exemplo: Julho = 0,9 (10% abaixo média)
CENÁRIOS OPERACIONAIS
- normal_operations_factor[k,c]: 1,0 (baseline)
- drilling_campaign_factor[k,c]: 1,5-2,0 (50-100% aumento)
- workover_factor[k,c]: 1,2-1,5 (20-50% aumento)
- low_activity_factor[k,c]: 0,6-0,8 (20-40% redução)
ESTOQUE E INVENTÁRIO
- storage_capacity[k,c]: Capacidade máxima armazenamento
- current_inventory[k,c]: Nível atual (tempo real)
- safety_stock[k,c]: Estoque de segurança mínimo
* Diesel: 48h × consumption (ANP)
* Água: 36h × consumption (ANP)
* Outros: 3-7 dias típico
- reorder_point[k,c]: Ponto de reposição
- max_inventory_level[k,c]: 95% de storage_capacity
PEDIDOS EMERGENCIAIS
- emergency_frequency[k,c]: Ocorrências por mês
- emergency_size_distribution[k,c]: Distribuição de tamanho
- emergency_lead_time_required[k,c]: Tempo resposta (horas)
- emergency_causes[k,c]: Causas principais
JANELAS DE ENTREGA
- preferred_delivery_day[k]: Dia da semana preferencial
- time_window_start[k]: Hora início janela
- time_window_end[k]: Hora fim janela
- delivery_flexibility[k]: Flexibilidade (horas)
- due_date[k,order]: Data/hora devido por pedido
PRIORIDADES
- cargo_criticality[k,c]: Crítico, Alto, Normal, Baixo
- stockout_penalty[k,c]: Penalidade por falta ($/dia)
- late_delivery_penalty[k,c]: Penalidade atraso ($/dia)
```
#### Dados de Demanda - FPSO Bravo + Plataforma Polvo (Cluster)
```yaml
Operações Normais (Baseline):
diesel:
consumo_diário: 40-50 m³/dia (cluster)
demanda_semanal: 500 m³
estoque_segurança: 200 m³ (48h × 2 instalações)
capacidade_armazenamento: [coletar]
água_potável:
consumo_diário: 35-45 m³/dia
demanda_semanal: 400 m³
estoque_segurança: 70 m³ (36h)
químicos:
demanda_semanal: 100 m³
tipos: 5-7 produtos diferentes
granel_seco:
demanda_normal: 0 m³
demanda_perfuração: 100-200 m³/semana
deck_cargo:
demanda_semanal: 150 toneladas
containers: 4-6 por semana
equipamentos: Ad hoc
backhaul:
resíduos_semanais: 20-25 toneladas
containers_vazios: 3-5 por semana
Viagens Requeridas:
operações_normais: 2-3 viagens/semana
durante_perfuração: 3-4 viagens/semana
Oportunidades Consolidação:
polvo_to_bravo: 11 km (única viagem serve ambos)
economia: 15-20% redução de viagens
```
#### Dados de Demanda - FPSO Valente (Frade + Wahoo)
```yaml
Operações Normais (Produção Frade):
diesel:
consumo_diário: 45 m³/dia (exemplo documento)
demanda_semanal: 350 m³
água_potável:
consumo_diário: 35 m³/dia (exemplo documento)
demanda_semanal: 250 m³
químicos:
demanda_semanal: 100 m³
deck_cargo:
demanda_semanal: 150 toneladas
Campanha de Perfuração Wahoo (2026):
lama_perfuração:
demanda_semanal: 800 m³ (exemplo documento)
tipo: OBM provavelmente (1.200m profundidade)
duração_campanha: [coletar meses]
granel_seco:
cimento: 150-250 m³/semana
barita: 50-100 m³/semana
deck_cargo:
tubos_perfuração: 200-400 toneladas/semana
equipamentos: 100-200 toneladas/semana
Viagens Requeridas:
normal: 2 viagens/semana
perfuração_wahoo: 4-5 viagens/semana (2026)
Capacidade Armazenamento:
óleo: 1,6 milhões barris
[demais capacidades: coletar]
```
#### Dados de Demanda - FPSO Forte (Albacora Leste)
```yaml
Operações Normais:
diesel:
demanda_semanal: 500 m³
água_potável:
demanda_semanal: 400 m³
químicos:
demanda_semanal: 120 m³
granel_seco:
demanda_normal: 100 m³/semana
deck_cargo:
demanda_semanal: 200 toneladas
Tieback Norte (2026):
impacto_demanda: +20-30% durante construção
duração: [coletar]
Viagens Requeridas:
normal: 3 viagens/semana
Capacidade Instalação:
processamento: 180.000 bpd
armazenamento: 1+ milhão barris
compressão_gás: 6 milhões m³/dia
```
#### Dados de Demanda - FPSO Peregrino + Plataformas A, B, C
```yaml
Complexo Total (4 Instalações):
diesel:
consumo_total: 80-100 m³/dia
demanda_semanal: 800 m³
distribuição:
fpso: 600 m³
plataforma_a: 50 m³
plataforma_b: 50 m³
plataforma_c: 50 m³
água_potável:
demanda_semanal: 600 m³
distribuição: Similar diesel
químicos:
demanda_semanal: 190 m³
deck_cargo:
demanda_semanal: 340 toneladas
Padrão de Entrega:
rota_sequencial: FPSO → A → B → C
distância_entre_instalações: < 5 km
tempo_total_cluster: 8-10 horas
Viagens Requeridas:
normal: 3-4 viagens/semana
Otimização Cargo Offtake:
distância_polvo: 28 km (15 NM)
oportunidade: Consolidar cargas óleo pesado
volume_single_offload: ~650.000 barris
```
### 3.3 Matriz de Compatibilidade de Cargas
```
Matriz de Limpeza de Tanques (horas):
Diesel Água OBM WBM Brine Metanol Químicos BaseOil
Diesel anterior 0 4 0 2 2 8 3 0
Água anterior 4 0 6 4 1 8 4 6
OBM anterior 0 6 0 6 4 8 4 0
WBM anterior 2 4 6 0 2 8 4 4
Brine anterior 2 1 4 2 0 8 2 3
Metanol anterior 8 8 8 8 8 0 8 8
Químicos anterior 3 4 4 4 2 8 0-6 3
BaseOil anterior 0 6 0 4 3 8 3 0
Notas:
- 0 = Compatível (sem limpeza)
- 1-4 = Limpeza rápida
- 6-8 = Limpeza profunda
- Químicos entre si: Depende do tipo (0-6 horas)
```
### 3.4 Frequência de Pedidos e Horizonte de Planejamento
```
Horizontes de Planejamento:
PLANEJAMENTO TÁTICO (1-4 semanas):
- Campanhas de perfuração conhecidas
- Manutenção programada
- Necessidades regulares de suprimento
- Previsões climáticas disponíveis
Acurácia Demanda:
- Semana 1: 95% (pedidos confirmados)
- Semana 2: 90% (pedidos planejados)
- Semana 3-4: 75-80% (previsão)
PLANEJAMENTO OPERACIONAL (1-7 dias):
- Pedidos de carga confirmados
- Disponibilidade de embarcações conhecida
- Previsões climáticas detalhadas
- Ajustes dinâmicos possíveis
Acurácia Demanda:
- 1-2 dias: 98% (confirmado)
- 3-5 dias: 85-90%
- 6-7 dias: 75-80%
AGENDAMENTO TEMPO REAL (< 24 horas):
- Entregas emergenciais
- Replanejamento por clima
- Quebras de embarcação
- Peças críticas urgentes
Frequência Emergências:
- Total rede: 1-3 por semana
- Distribuição: Poisson(λ=2)
- Tamanho: 5-50 toneladas
- Resposta requerida: 6-24 horas
```
---
## 4. PRODUÇÃO E ESCOAMENTO (OUTBOUND LOGISTICS)
### 4.1 Taxas de Produção de Óleo
**Produção por Campo (1T25 - Primeiro Trimestre 2025)**
| Campo | Produção (kbpd) | Proprietário PRIO | Óleo API | Características |
|-------|-----------------|-------------------|----------|-----------------|
| **Frade** | 38,3 | 100% | 20-25° | Médio, pre-salt prep |
| **Albacora Leste** | 22,0 | [% a coletar] | ~20° | Médio |
| **Polvo/TBMT Cluster** | 10,8 | 100% | 25° | Leve, baixo enxofre |
| **Peregrino** | 38,2 | 40% → 100% | 14° | Pesado, alto enxofre |
**Produção Adicional Esperada (2026)**
```yaml
Wahoo (tieback to Frade):
produção_adicional: ~40.000 bpd
startup: 2026 (previsto)
fpso_destino: Valente
capacidade_processamento_disponível: Sim (100k bpd capacity)
Total Produção PRIO (projetada 2026):
frade_wahoo: 78.000 bpd
albacora_leste: 22.000+ bpd
polvo_tbmt: 10.000-15.000 bpd
peregrino: 100.000 bpd (quando 100% operatorship)
TOTAL: ~200.000-215.000 bpd entitled
```
### 4.2 Dados de Offloading
**Template de Coleta por FPSO:**
```
Para cada FPSO k:
CARACTERÍSTICAS DO ÓLEO PRODUZIDO
- api_gravity[k]: Grau API
- sulfur_content[k]: % enxofre (massa)
- viscosity[k]: cP @ 20°C
- pour_point[k]: °C
- bsw_typical[k]: Basic Sediments & Water (%)
- export_specification: Conforme ANP
CAPACIDADE DE ARMAZENAMENTO
- total_storage_capacity[k]: barris totais
- working_storage[k]: Estoque operacional (barris)
- min_offload_level[k]: Nível mínimo para offloading
- max_storage_level[k]: Nível máximo seguro (95%)
- current_inventory[k]: Nível atual (tempo real)
- tank_configuration: Número e tamanho de tanques
TAXAS DE ENCHIMENTO
- production_rate[k]: bpd (média)
- production_variability[k]: % desvio padrão
- days_to_fill[k]: Dias para encher desde min level
- inventory_forecast[k,t]: Previsão por dia
OPERAÇÕES DE ALÍVIO (OFFLOADING)
- offload_frequency[k]: Dias entre offloads
- typical_offload_volume[k]: barris por alívio
- tanker_type_preferred[k]: Suezmax, Aframax, VLCC
- connection_time[k]: Horas (approach + hookup)
- transfer_rate[k]: barris/hora
- disconnection_time[k]: Horas
- total_offload_duration[k]: Horas (típico)
JANELAS OPERACIONAIS OFFLOADING
- max_wave_height_connection: metros Hs
- max_wave_height_transfer: metros Hs
- max_wind_speed: m/s
- max_current: nós
- weather_delay_frequency: % do tempo
RESTRIÇÕES LOGÍSTICAS
- min_interval_between_offloads: dias (operacional)
- notice_period_tanker: dias (aviso prévio)
- demurrage_cost: $/dia (se tanker espera)
- berthing_window_conflicts: Com PSVs?
DESTINO E COMERCIALIZAÇÃO
- primary_market[k]: Ásia, Europa, Americas
- buyers[k]: Lista de compradores
- pricing_benchmark[k]: Brent, WTI, etc.
- premium_discount[k]: $ sobre benchmark
- blending_opportunities[k]: Com outros campos?
```
**Dados Específicos por FPSO (a coletar):**
```yaml
FPSO Valente (Frade):
armazenamento: 1,6 milhões barris
produção_atual: 38.300 bpd
api: 20-25°
days_to_fill: ~30-35 dias (desde 50%)
offload_frequency: ~25-30 dias
offload_volume: 1,2-1,4 milhões barris
tanker_type: Suezmax (1 milhão barris)
FPSO Forte (Albacora Leste):
armazenamento: 1+ milhão barris
produção_atual: 22.000 bpd
api: ~20°
offload_frequency: ~35-40 dias
FPSO Bravo (Polvo/TBMT):
armazenamento: ~600.000 barris (estimado)
produção_atual: 10.800 bpd
api: 25°
offload_frequency: ~45-50 dias
offload_volume: ~500.000 barris
FPSO Peregrino:
armazenamento: ~1 milhão barris (estimado)
produção_atual: 38.200 bpd (PRIO share)
produção_total: 100.000 bpd
api: 14° (óleo pesado)
mercado: Ásia (China principalmente)
offload_frequency: ~25-30 dias
tanker_type: Suezmax ou Aframax
Acordo Comercial:
- Cathay Petroleum: 110.000 bpd (set 2025)
- Consolidação com Polvo/TBMT: Possível (28 km)
- Volume consolidado: ~650.000 barris
```
### 4.3 Porto do Açu - Transbordo Ship-to-Ship
```yaml
Operações STS (Ship-to-Ship):
localização: Porto do Açu, RJ
distância_bacia_campos: ~200-300 km
função: Transbordo para VLCCs (exportação)
Vantagens:
- Águas mais profundas que Macaé
- Capacidade para VLCCs (calado >15m)
- Menor custo demurrage
Dados a Coletar:
- Capacidade mensal processamento (barris)
- Taxa de transbordo (barris/hora)
- Custos por barril
- Tempo típico de operação
- Janelas de disponibilidade
- Restrições climáticas
- Interface com FPSOs (tankers shuttle?)
```
---
## 5. RESTRIÇÕES AMBIENTAIS E OPERACIONAIS
### 5.1 Dados Meteorológicos e Oceanográficos
#### Estatísticas Climáticas - Bacia de Campos
**Distribuição de Altura Significativa de Onda (Hs)**
```yaml
Frequência Anual (% do tempo):
hs_menor_2m: 50-60% (condições boas)
hs_2_a_3m: 25-30% (condições moderadas)
hs_3_a_4m: 10-15% (condições ruins)
hs_maior_4m: 5-10% (condições severas)
Variação Sazonal:
verão_dez_mar:
hs_média: 1,5-2,0 m
condições_boas: 65-70%
condições_severas: 3-5%
inverno_jun_ago:
hs_média: 2,0-2,5 m
condições_boas: 40-50%
condições_severas: 10-15%
transição_abr_mai_set_nov:
hs_média: 1,8-2,2 m
condições_boas: 55-60%
condições_severas: 5-8%
```
**Dados de Vento**
```yaml
Velocidade Média Mensal:
janeiro_fevereiro: 5-7 m/s
março_abril: 6-8 m/s
maio_junho: 7-9 m/s
julho_agosto: 8-10 m/s (pico)
setembro_outubro: 7-9 m/s
novembro_dezembro: 6-8 m/s
Frequência Ventos Fortes:
vento_maior_15ms: 15-25% do tempo
vento_maior_20ms: 5-10% do tempo
vento_maior_25ms: 1-3% do tempo
Direção Predominante:
verão: NE (nordeste)
inverno: S/SW (sul/sudoeste) - frentes frias
```
**Correntes Marítimas**
```yaml
Corrente do Brasil:
direção: Sul (flui para sul ao longo da costa)
velocidade_típica: 0,5-1,5 nós
velocidade_máxima: 2,0-2,5 nós
variabilidade: Vórtices e meandros
Impacto em Trânsito:
norte_para_sul: Favorável (+10-15% velocidade)
sul_para_norte: Desfavorável (-10-15% velocidade)
```
**Visibilidade**
```yaml
Condições Normais:
visibilidade_boa_maior_5nm: 85-90% do tempo
visibilidade_moderada_1_5nm: 8-12% do tempo
visibilidade_baixa_menor_1nm: 2-5% do tempo
Causas Baixa Visibilidade:
- Nevoeiro (principalmente inverno/manhã)
- Chuva intensa
- Spray marítimo (ventos fortes)
```
#### Template de Coleta de Dados Climáticos
```
DADOS HISTÓRICOS (mínimo 3-5 anos):
Por Mês e Localização:
- hs_distribution[month, location]: Distribuição de Hs
- wind_speed_distribution[month, location]: Distribuição vento
- wind_direction_frequency[month, location, direction]: Rosa dos ventos
- current_speed_distribution[location]: Distribuição corrente
- visibility_frequency[month]: Frequência por categoria
PREVISÕES OPERACIONAIS:
- forecast_24h[parameter]: Previsão 24h (acurácia 85%)
- forecast_48h[parameter]: Previsão 48h (acurácia 75%)
- forecast_72h[parameter]: Previsão 72h (acurácia 65%)
- forecast_96h+[parameter]: Previsão 96h+ (acurácia 50%)
DADOS TEMPO REAL:
- current_hs[location]: Hs atual por localização
- current_wind[location]: Vento atual
- current_visibility[location]: Visibilidade atual
- update_frequency: A cada 1-3 horas
MODELOS DE CADEIA DE MARKOV:
- transition_matrix[state_from, state_to]: Probabilidade transição
- state_definition: Estados (Calm, Moderate, Rough, Severe)
- persistence_probability: Prob de manter estado
```
### 5.2 Limites Operacionais (Workability)
#### Matriz de Restrições Climáticas
| Operação | Hs Máximo (m) | Vento Máximo (m/s) | Corrente Máxima (nós) | Visibilidade Mín (NM) |
|----------|---------------|--------------------|-----------------------|---------------------|
| **Carregamento Líquidos (Porto)** | 2,0 | 20 | 1,5 | 0,5 |
| **Carregamento Deck (Porto)** | 2,5 | 18 | 1,5 | 1,0 |
| **Trânsito PSV** | 4,5 | 30 | - | 0,5 |
| **Aproximação Plataforma** | 3,0 | 20 | 2,0 | 1,0 |
| **Setup DP** | 3,0 | 20 | 2,0 | - |
| **Descarga Líquidos Offshore** | 3,0 | 18 | 2,0 | - |
| **Descarga Granel Seco** | 2,5 | 15 | 2,0 | - |
| **Operações Guindaste** | 2,5 | 15 | 2,0 | 1,0 |
| **Transferência Pessoal (Cesta)** | 2,7 | 12 | - | 1,0 |
| **Offloading Tanker** | 3,5 | 18 | 2,5 | 2,0 |
**Notas:**
- Limites são **conservadores** para segurança
- Podem ser relaxados com aprovação caso a caso
- Comandante tem autoridade final
#### Cálculo de Weather Windows
```python
# Pseudocódigo para Cálculo de Janela Climática
def calculate_weather_window(operation, start_time, duration):
"""
Determina se janela climática permite operação
"""
weather_limits = get_limits(operation)
for hour in range(start_time, start_time + duration):
forecast = get_forecast(hour)
if forecast['Hs'] > weather_limits['hs_max']:
return False, "Wave height exceeded"
if forecast['wind'] > weather_limits['wind_max']:
return False, "Wind speed exceeded"
if forecast['current'] > weather_limits['current_max']:
return False, "Current speed exceeded"
if forecast['visibility'] < weather_limits['vis_min']:
return False, "Visibility too low"
return True, "Weather window OK"
# Exemplo de Uso:
operation = "Crane Operations"
start = datetime(2026, 1, 15, 8, 0) # 15 Jan 2026, 08:00
duration_hours = 6
can_proceed, reason = calculate_weather_window(operation, start, duration)
```
#### Modelo de Atrasos Climáticos
```
DISTRIBUIÇÃO DE ATRASOS:
Tipo de Atraso: Espera por Condições Melhorarem
- Ocorrência: 10-15% das operações offshore
- Duração média: 4-8 horas
- Duração máxima observada: 48+ horas
- Distribuição: Lognormal(μ=1,5, σ=0,8)
Impacto por Tipo de Operação:
- Operações guindaste: 15-20% atrasos (mais sensível)
- Descargas líquidas: 8-12% atrasos
- Trânsito: 5-8% atrasos (menos sensível)
Sazonalidade:
- Verão (Dez-Mar): 8% taxa de atraso
- Outono (Mar-Jun): 12% taxa de atraso
- Inverno (Jun-Set): 18% taxa de atraso
- Primavera (Set-Dez): 12% taxa de atraso
```
### 5.3 Janelas Operacionais e Restrições de Tempo
#### Preferências de Horário - Porto de Macaé
```yaml
Janelas de Carregamento (% de inicializações):
06:00-10:00: 25% (pico manhã)
10:00-14:00: 20% (operações padrão)
14:00-18:00: 20% (operações padrão)
18:00-22:00: 15% (atividade reduzida)
22:00-02:00: 10% (operações noturnas)
02:00-06:00: 10% (atividade mínima)
Fatores de Eficiência por Período:
diurno_06_18: 100% (eficiência total)
noturno_18_06: 85-90% (eficiência reduzida)
Restrições:
- Berço deve ser reservado com antecedência
- Disponibilidade 24/7 mas com preferências
- Mudanças de turno: 06:00, 14:00, 22:00
```
#### Preferências de Horário - Operações Offshore
```yaml
Janelas Preferenciais:
luz_do_dia_06_18: Fortemente preferido
- Operações guindaste: Obrigatório salvo emergência
- Descarga deck cargo: Preferencial
- Descargas líquidas: Sem restrição
noturno_18_06: Possível mas reduzido
- Eficiência operacional: 70-80%
- Somente líquidos: Preferencial
- Granel seco: Evitar
- Guindaste: Evitar (exceto emergência)
Condições Climáticas por Período:
manhã_06_12: Geralmente melhores (mar mais calmo)
tarde_12_18: Condições padrão
noite_18_24: Pode piorar
madrugada_00_06: Variável
```
#### Restrições de Simultaneidade
```yaml
Por Instalação:
max_psv_simultaneous: 1-2 (típico)
conflicts_with_helicopter: Sim (janelas dedicadas)
conflicts_with_offloading: Sim (FPSO ocupado)
conflicts_with_rov_operations: Possível
Dados a Coletar:
- Cronograma de helicópteros (semanal)
- Janelas de offloading planejadas
- Operações especiais programadas (ROV, mergulho, etc.)
- Restrições de área (500m safety zone?)
```
---
## 6. PARÂMETROS FINANCEIROS E CUSTOS
### 6.1 Estrutura Completa de Custos
#### Custos Fixos de Charter
```yaml
Contratos Long-Term (PRIO-Solstad ~$100M combinados):
Standard PSV Fleet:
daily_rate: $8.000-15.000/dia
contract_discount: 10-15% vs spot market
contract_duration: 2-4 anos típico
escalation_clause: CPI ou fixo?
termination_penalties: [coletar]
Large PSV Fleet:
daily_rate_dp2: $12.000-22.000/dia
daily_rate_dp3: $15.000-25.000/dia
CSV Normand Pioneer:
daily_rate: $35.000-50.000/dia (estimado)
contract_end: Agosto 2025
Well Stimulation Normand Carioca:
daily_rate: $25.000-35.000/dia (estimado)
contract_end: Dezembro 2027
funded_by: Equinor (Bacalhau field)
Mobilization/Demobilization:
mobilization_cost: $50.000-200.000 (por embarcação)
demobilization_cost: $30.000-100.000
transit_to_field: Incluído ou separado?
```
#### Custos Variáveis de Combustível
```yaml
Marine Gas Oil (MGO):
current_price_2024_2025: $600-800/tonelada
price_volatility: ±$100/t (mensal)
hedging_strategy: [coletar se PRIO tem hedge]
Consumo Típico por Viagem:
rota_curta_46nm_roundtrip:
vessel: Standard PSV
total_nm: 92 NM
transit_time: 7,7 horas @ 12 knots
platform_time: 6 horas
total_time: 13,7 horas
fuel_consumed: 7,8 toneladas
fuel_cost: $4.680-6.240
rota_média_67nm_roundtrip:
total_nm: 134 NM
transit_time: 11,2 horas
platform_time: 6 horas
total_time: 17,2 horas
fuel_consumed: 9,7 toneladas
fuel_cost: $5.820-7.760
rota_longa_75nm_roundtrip:
total_nm: 150 NM
transit_time: 12,5 horas
platform_time: 6 horas
total_time: 18,5 horas
fuel_consumed: 10,5 toneladas
fuel_cost: $6.300-8.400
Fatores de Ajuste:
velocidade_maior: +15-20% consumo por nó adicional
clima_ruim_hs3-4m: +20-30% consumo
dp_extended_ops: +10-15% consumo
```
#### Custos Portuários (Macaé)
```yaml
Por Chamada de Embarcação:
taxa_portuária_base: $500-1.500
pilotagem_entrada: $300-400 (se aplicável)
pilotagem_saída: $300-400
rebocadores: $0 (PSVs geralmente não precisam)
agenciamento_marítimo: $200-500
documentação_despacho: $100-300
segurança_portuária: $50-150
TOTAL POR CALL: $1.450-3.250 (médio: $2.350)
Custos de Handling/Loading:
líquidos_granel:
custo_por_m3: $5-10
exemplo_500m3: $2.500-5.000
deck_cargo:
custo_por_tonelada: $15-30
exemplo_150t: $2.250-4.500
granel_seco_pneumático:
custo_por_m3: $8-15
exemplo_200m3: $1.600-3.000
Taxa de Ocupação Berço:
custo_por_hora: $100-200 (se aplicável)
tempo_típico: 8 horas
total: $800-1.600
TOTAL CUSTOS PORTO POR VIAGEM:
mínimo: $4.000
típico: $6.500-8.500
máximo: $12.000+
```
#### Custos Offshore (Plataforma/FPSO)
```yaml
Operações na Instalação:
guindaste_platform:
custo_horário: $500-1.000/hora
tempo_típico_operação: 3-5 horas
total: $1.500-5.000 por viagem
pessoal_offshore:
custo_crew_descarga: Incluído em platform ops
consumíveis_descarga:
mangotes_conexão: $50-200
energia_elétrica: Incluído
TOTAL CUSTOS OFFSHORE: $1.500-5.500 por viagem
```
### 6.2 Custos Totais por Viagem - Exemplos
#### Exemplo 1: Viagem Peregrino (46 NM)
```yaml
Embarcação: Standard PSV
Distância: 46 NM one-way (92 NM roundtrip)
Carga: 400 m³ líquidos + 100 t deck cargo
CUSTOS:
Charter (0,57 dias @ $12.000/dia): $6.840
Combustível (7,8 t @ $700/t): $5.460
Porto Macaé: $6.500
Offshore Peregrino: $3.000
TOTAL: $21.800
MÉTRICAS:
Custo por tonelada entregue: $87/t (250t total)
Custo por m³ líquido: $54/m³
Custo por NM: $237/NM
```
#### Exemplo 2: Viagem Albacora Leste (75 NM)
```yaml
Embarcação: Large PSV
Distância: 75 NM one-way (150 NM roundtrip)
Carga: 600 m³ líquidos + 200 t deck cargo
CUSTOS:
Charter (0,77 dias @ $17.000/dia): $13.090
Combustível (10,5 t @ $700/t): $7.350
Porto Macaé: $7.500
Offshore Albacora: $4.000
TOTAL: $31.940
MÉTRICAS:
Custo por tonelada: $80/t (400t total)
Custo por m³: $53/m³
Custo por NM: $213/NM
```
#### Exemplo 3: Campanha Perfuração Valente (67 NM)
```yaml
Embarcação: Large PSV
Carga Especializada: 800 m³ OBM + 300 m³ granel + 300 t deck
CUSTOS:
Charter (0,95 dias @ $20.000/dia): $19.000
Combustível (12 t @ $700/t): $8.400
Porto Macaé: $9.000
Offshore Valente: $5.000
TOTAL: $41.400
VOLUME/PESO:
Total: ~1.500 toneladas equivalente
Custo por tonelada: $28/t
```
### 6.3 Custos de Penalidade
#### Penalidades por Atraso
```yaml
Atraso em Entrega Crítica:
diesel_abaixo_safety_stock:
penalidade_diária: $10.000-20.000/dia
acumulativa: Sim
água_abaixo_safety_stock:
penalidade_diária: $8.000-15.000/dia
regulação_anp: Multa adicional possível
lama_perfuração_drilling_parado:
penalidade_horária: $5.000-10.000/hora
perda_produção_associada: Incluída abaixo
peças_críticas_equipamento:
penalidade: Variável (caso a caso)
range: $5.000-50.000
Entrega Incompleta:
carga_parcial_não_aceitável:
penalidade: $2.000-10.000/ocorrência
reentrega_necessária: Custo adicional
```
#### Custos de Perda de Produção
```yaml
Parada de Produção por Falta de Insumos:
FPSO Valente (Frade 38.3 kbpd):
produção_diária: 38.300 barris
preço_brent_referência: $80/barril
receita_diária_bruta: $3.064.000
margem_operacional_estimada: 60%
perda_líquida_dia: $1.838.400/dia
FPSO Forte (Albacora 22 kbpd):
produção_diária: 22.000 barris
perda_líquida_dia: $1.056.000/dia
FPSO Peregrino (100 kbpd total):
produção_prio_share: 38.200 bpd (40% atual)
perda_líquida_dia: $1.833.600/dia
nota: Aumentará quando 100% operatorship
Cluster Polvo/TBMT (10.8 kbpd):
produção_diária: 10.800 barris
perda_líquida_dia: $518.400/dia
CUSTO TOTAL DE PARADA REDE:
todas_instalações: $5.246.400/dia
por_hora: $218.600/hora
IMPLICAÇÃO PARA MODELO:
stockout_penalty >> delivery_cost
Estoques de segurança são críticos
Modelo deve evitar stockouts a quase qualquer custo razoável
```
#### Custos Regulatórios (ANP)
```yaml
Violação Estoque Mínimo (Resolução ANP 43/2007):
diesel_abaixo_48h:
multa_base: $10.000-50.000
recorrência: Multas progressivas
água_abaixo_36h:
multa_base: $8.000-40.000
Atraso em Relatórios:
multa_administrativa: $1.000-10.000
Incidentes Ambientais (spillage):
derramamento_pequeno: $50.000-200.000
derramamento_médio: $200.000-1.000.000+
Nota: Valores estimados, confirmar com departamento regulatório PRIO
```
### 6.4 KPIs Financeiros e Metas
```yaml
Custo por Tonelada Entregue:
target: $80-120/tonelada
benchmark_industry: $100-150
