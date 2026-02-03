export const mockSchemaDiagram = `digraph prio_schema {
  graph [rankdir=LR, bgcolor=transparent];
  node [shape=record, style=filled, fillcolor="#0b1624", fontcolor="white", color="#0f243a"];

  "vessels" [label=<<TABLE BORDER="0" CELLBORDER="1" CELLSPACING="0" COLOR="#1e3a5f">
    <TR><TD COLSPAN="2" BALIGN="LEFT" COLOR="#12263f"><B>vessels</B></TD></TR>
    <TR><TD ALIGN="LEFT">id</TD><TD ALIGN="LEFT">uuid</TD></TR>
    <TR><TD ALIGN="LEFT">name</TD><TD ALIGN="LEFT">text</TD></TR>
    <TR><TD ALIGN="LEFT">type</TD><TD ALIGN="LEFT">text</TD></TR>
    <TR><TD ALIGN="LEFT">status</TD><TD ALIGN="LEFT">text</TD></TR>
    <TR><TD ALIGN="LEFT">dp_class</TD><TD ALIGN="LEFT">text</TD></TR>
    <TR><TD ALIGN="LEFT">deck_capacity_mt</TD><TD ALIGN="LEFT">numeric</TD></TR>
    <TR><TD ALIGN="LEFT">service_speed_kn</TD><TD ALIGN="LEFT">numeric</TD></TR>
    <TR><TD COLSPAN="2" ALIGN="LEFT">domain: logistics</TD></TR>
  </TABLE>>];

  "installations" [label=<<TABLE BORDER="0" CELLBORDER="1" CELLSPACING="0" COLOR="#1e3a5f">
    <TR><TD COLSPAN="2" BALIGN="LEFT" COLOR="#12263f"><B>installations</B></TD></TR>
    <TR><TD ALIGN="LEFT">id</TD><TD ALIGN="LEFT">uuid</TD></TR>
    <TR><TD ALIGN="LEFT">name</TD><TD ALIGN="LEFT">text</TD></TR>
    <TR><TD ALIGN="LEFT">basin</TD><TD ALIGN="LEFT">text</TD></TR>
    <TR><TD ALIGN="LEFT">distance_nm</TD><TD ALIGN="LEFT">numeric</TD></TR>
    <TR><TD COLSPAN="2" ALIGN="LEFT">domain: network</TD></TR>
  </TABLE>>];

  "berths" [label=<<TABLE BORDER="0" CELLBORDER="1" CELLSPACING="0" COLOR="#1e3a5f">
    <TR><TD COLSPAN="2" BALIGN="LEFT" COLOR="#12263f"><B>berths</B></TD></TR>
    <TR><TD ALIGN="LEFT">id</TD><TD ALIGN="LEFT">uuid</TD></TR>
    <TR><TD ALIGN="LEFT">port</TD><TD ALIGN="LEFT">text</TD></TR>
    <TR><TD ALIGN="LEFT">status</TD><TD ALIGN="LEFT">text</TD></TR>
    <TR><TD ALIGN="LEFT">max_dwt</TD><TD ALIGN="LEFT">numeric</TD></TR>
    <TR><TD COLSPAN="2" ALIGN="LEFT">domain: ports</TD></TR>
  </TABLE>>];

  "cargo_types" [label=<<TABLE BORDER="0" CELLBORDER="1" CELLSPACING="0" COLOR="#1e3a5f">
    <TR><TD COLSPAN="2" BALIGN="LEFT" COLOR="#12263f"><B>cargo_types</B></TD></TR>
    <TR><TD ALIGN="LEFT">id</TD><TD ALIGN="LEFT">uuid</TD></TR>
    <TR><TD ALIGN="LEFT">category</TD><TD ALIGN="LEFT">text</TD></TR>
    <TR><TD ALIGN="LEFT">name</TD><TD ALIGN="LEFT">text</TD></TR>
    <TR><TD ALIGN="LEFT">density</TD><TD ALIGN="LEFT">numeric</TD></TR>
    <TR><TD ALIGN="LEFT">requires_segregation</TD><TD ALIGN="LEFT">boolean</TD></TR>
    <TR><TD COLSPAN="2" ALIGN="LEFT">domain: cargo</TD></TR>
  </TABLE>>];

  "vessel_positions" [label=<<TABLE BORDER="0" CELLBORDER="1" CELLSPACING="0" COLOR="#1e3a5f">
    <TR><TD COLSPAN="2" BALIGN="LEFT" COLOR="#12263f"><B>vessel_positions</B></TD></TR>
    <TR><TD ALIGN="LEFT">id</TD><TD ALIGN="LEFT">uuid</TD></TR>
    <TR><TD ALIGN="LEFT">vessel_id</TD><TD ALIGN="LEFT">uuid</TD></TR>
    <TR><TD ALIGN="LEFT">lat</TD><TD ALIGN="LEFT">numeric</TD></TR>
    <TR><TD ALIGN="LEFT">lon</TD><TD ALIGN="LEFT">numeric</TD></TR>
    <TR><TD ALIGN="LEFT">recorded_at</TD><TD ALIGN="LEFT">timestamp</TD></TR>
    <TR><TD COLSPAN="2" ALIGN="LEFT">domain: telemetry</TD></TR>
  </TABLE>>];

  "vessel_positions" -> "vessels" [label="vessel_id", color="#3b82f6"];
  "vessels" -> "cargo_types" [label="dp_class influences cargo", color="#8b5cf6", style=dashed];
  "vessels" -> "berths" [label="assigned_berth", color="#22c55e"];
  "installations" -> "vessels" [label="serviced_by", color="#f97316"];
}
`;
