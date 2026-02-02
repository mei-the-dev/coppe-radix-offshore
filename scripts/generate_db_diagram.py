#!/usr/bin/env python3
"""Generate a Graphviz diagram describing the PRIO database schema."""

from __future__ import annotations

import argparse
import re
from pathlib import Path
from textwrap import dedent

ROOT = Path(__file__).resolve().parents[1]
FULL_SQL_FILE = ROOT / "references" / "prio_sql_schema.sql"
MINIMAL_SQL_FILE = ROOT / "references" / "prio_sql_schema_minimal.sql"
DOT_FILE = ROOT / "references" / "prio_database_diagram.dot"
DETAILED_DOT_FILE = ROOT / "references" / "prio_database_diagram_detailed.dot"

DOMAIN_COLORS = {
    "NETWORK": "#E3F2FD",
    "FLEET": "#FFF8E1",
    "CARGO": "#E8F5E9",
    "OPERATIONS": "#F3E5F5",
    "ENVIRONMENT": "#E0F7FA",
    "COSTS": "#FFF3E0",
    "OPTIMIZATION": "#FBE9E7",
}

TYPE_STOPWORDS = re.compile(
    r"\b(NOT|DEFAULT|CHECK|REFERENCES|PRIMARY|UNIQUE|CONSTRAINT|COLLATE|FOREIGN|IDENTITY|STORAGE|USING|GENERATED|TYPE|WITH|SEQUENCE|ARRAY|IS)\b",
    re.IGNORECASE,
)


def normalize_domain(line: str) -> str | None:
    match = re.match(r"--\s*\d+\.\s*(.+?)\s+DOMAIN", line, flags=re.IGNORECASE)
    if not match:
        return None
    return match.group(1).strip().upper()


def parse_schema(sql: str) -> tuple[dict[str, dict[str, list[str]]], dict[str, str]]:
    tables: dict[str, dict[str, list[str]]] = {}
    domains: dict[str, str] = {}

    current_table: str | None = None
    current_domain: str = "OTHER"
    in_constraint_block = False

    for raw_line in sql.splitlines():
        line = raw_line.strip()
        if not line:
            continue

        # If we are inside a multi-line CHECK/CONSTRAINT block, skip until it closes
        if in_constraint_block:
            if ")" in line:
                in_constraint_block = False
            continue

        domain_name = normalize_domain(line)
        if domain_name:
            current_domain = domain_name
            continue

        create_match = re.match(r"CREATE TABLE\s+([A-Za-z0-9_]+)", line, flags=re.IGNORECASE)
        if create_match:
            table_name = create_match.group(1)
            current_table = table_name
            tables[current_table] = {
                "columns": [],
                "columns_info": [],
                "pks": [],
                "fks": [],
            }
            domains[current_table] = current_domain
            continue

        if current_table is None:
            continue

        if line.startswith(");"):
            current_table = None
            continue

        if line.startswith("--"):
            continue

        if re.match(r"^(PRIMARY|CONSTRAINT|UNIQUE|CHECK)", line, flags=re.IGNORECASE):
            # If this constraint opens a multi-line block, set the flag so we skip following lines until it closes
            if "(" in line and ")" not in line:
                in_constraint_block = True
            pk_match = re.search(r"PRIMARY KEY\s*\(([^)]+)\)", line, flags=re.IGNORECASE)
            if pk_match:
                cols = [c.strip().strip('"') for c in pk_match.group(1).split(",")]
                tables[current_table]["pks"].extend(cols)
            continue

        col_match = re.match(r'"?([A-Za-z0-9_]+)"?\s+', line)
        if col_match:
            column_name = col_match.group(1)
            normalized = column_name.strip()
            if normalized.upper() not in {"PRIMARY", "CONSTRAINT", "UNIQUE", "CHECK"}:
                column_def = line[col_match.end() :].strip().rstrip(",")
                column_type = extract_column_type(column_def)
                tables[current_table]["columns"].append(normalized)
                tables[current_table]["columns_info"].append({
                    "name": normalized,
                    "type": column_type,
                })
                if "PRIMARY KEY" in line.upper():
                    tables[current_table]["pks"].append(normalized)

        ref_match = re.search(r"REFERENCES\s+([A-Za-z0-9_]+)", line, flags=re.IGNORECASE)
        if ref_match:
            tables[current_table]["fks"].append(ref_match.group(1))

    return tables, domains


def extract_column_type(definition: str) -> str:
    if not definition:
        return "UNKNOWN"
    trimmed = definition.strip()
    split = TYPE_STOPWORDS.split(trimmed, 1)
    type_segment = split[0].strip()
    return re.sub(r"\s+", " ", type_segment) or "UNKNOWN"


def humanize(name: str) -> str:
    return name.replace("_", " ").strip()


def describe_column(name: str) -> str:
    lower = name.lower()
    base = humanize(lower)

    if lower == "unitization_id":
        return "References the unitization definition that describes how this order item is stowed."
    if "unitization" in lower:
        if "type" in lower:
            return "Specifies whether the cargo uses a container or pallet unitization."
        if "area" in lower:
            return "Deck stowage area tied to this unitization in square meters."
        if "weight" in lower:
            return "Weight capacity per unitization entry in tonnes."
        return "Metadata describing how deck cargo is unitized."
    if "container" in lower:
        return "Container-specific attribute used for deck cargo planning."
    if "pallet" in lower:
        return "Pallet-specific attribute used for deck cargo planning."
    if "deck" in lower and "area" in lower:
        return "Deck cargo area measured in square meters."
    if "deck" in lower and "weight" in lower:
        return "Deck cargo weight measured in tonnes."
    if "dp" in lower and "activ" in lower:
        return "Indicates whether dynamic positioning is engaged near an installation."
    if "ping" in lower and ("time" in lower or "at" in lower):
        return "Timestamp for when the vessel location ping was recorded."
    if "distance" in lower:
        return "Distance from the vessel to the referenced installation."
    if "location" in lower:
        return "Geographic coordinates for this record."
    if "speed" in lower:
        return "Speed measurement, usually in knots."
    if "heading" in lower:
        return "Vessel heading in degrees."
    if "metric" in lower or "rate" in lower or "utilization" in lower or lower.startswith("kpi"):
        return "Performance metric captured for solution analysis."
    if lower.endswith("_id") and len(lower) > 3:
        target = humanize(lower[:-3]) or "record"
        return f"Identifier for {target}."
    if lower.endswith("_at") or lower.endswith("_date") or "timestamp" in lower:
        target = humanize(lower.replace("_at", "").replace("_date", ""))
        return f"Timestamp of {target or 'event'}."
    if lower in {"name", "label"}:
        return f"Human-readable name for {base}."
    if "status" in lower:
        return f"Current status indicator for {base}."
    if "quantity" in lower or "amount" in lower or "weight" in lower:
        return f"Amount related to {base}."
    if lower in {"created", "created_by", "updated", "updated_by"}:
        return f"Auditing detail for {base}."
    return f"Stores {base}."


def domain_color(domain: str) -> str:
    if not domain:
        return "#F5F5F5"
    return DOMAIN_COLORS.get(domain.upper(), "#F5F5F5")


def html_label(table: str, columns: list[str], domain: str) -> str:
    visible_columns = columns[:6]
    more = len(columns) - len(visible_columns)
    column_rows = "\n".join(
        f"        <tr><td align=\"left\">{col}</td></tr>" for col in visible_columns
    )
    ellipsis = (
        "        <tr><td align=\"left\">&#8230;</td></tr>\n" if more > 0 else ""
    )
    return dedent(
        f"""\
        <<TABLE BORDER=\"0\" CELLBORDER=\"1\" CELLSPACING=\"0\" CELLPADDING=\"4\">
            <tr><td bgcolor=\"{domain_color(domain)}\" align=\"center\"><b>{table}</b></td></tr>
{column_rows}
{ellipsis}
            <tr><td bgcolor=\"#FFFFFF\"><FONT POINT-SIZE=\"10\">{domain or 'Other'}</FONT></td></tr>
        </TABLE>>
        """
    )


def detailed_html_label(
    table: str, columns_info: list[dict[str, str]], domain: str
) -> str:
    rows = []
    for info in columns_info:
        name = info["name"]
        col_type = info["type"]
        desc = describe_column(name)
        rows.append(
            f"        <tr><td align=\"left\"><FONT POINT-SIZE=\"10\"><b>{name}</b><BR/><FONT POINT-SIZE=\"8\">{col_type}</FONT></FONT></td><td align=\"left\"><FONT POINT-SIZE=\"8\">{desc}</FONT></td></tr>"
        )
    return dedent(
        f"""\
        <<TABLE BORDER=\"0\" CELLBORDER=\"1\" CELLSPACING=\"0\" CELLPADDING=\"4\">
            <tr><td bgcolor=\"{domain_color(domain)}\" align=\"center\" colspan=\"2\"><b>{table}</b></td></tr>
{"\n".join(rows)}
            <tr><td bgcolor=\"#FFFFFF\" colspan=\"2\"><FONT POINT-SIZE=\"10\">{domain or 'Other'}</FONT></td></tr>
        </TABLE>>
        """
    )


def write_dot(tables: dict[str, dict[str, list[str]]], domains: dict[str, str], schema_name: str) -> None:
    edges = collect_edges(tables)

    lines = [
        "digraph prio_schema {",
        "  graph [splines=ortho, rankdir=LR, nodesep=0.65, ranksep=1];",
        "  node [shape=plaintext, fontname=\"Source Sans 3\"];",
    ]

    for table in sorted(tables):
        label = html_label(table, tables[table]["columns"], domains.get(table, ""))
        lines.append(f'  "{table}" [label={label}];')

    for src, tgt in sorted(edges):
        if tgt not in tables:
            continue
        lines.append(f'  "{src}" -> "{tgt}" [color=\"#607D8B\", penwidth=1.0];')

    lines.append("}")
    DOT_FILE.write_text("\n".join(lines) + "\n")
    print(
        f"Wrote {DOT_FILE.relative_to(ROOT)} ({len(tables)} tables, {len(edges)} relationships) from {schema_name}"
    )


def collect_edges(tables: dict[str, dict[str, list[str]]]) -> set[tuple[str, str]]:
    edges: set[tuple[str, str]] = set()
    for table, data in tables.items():
        for fk in data["fks"]:
            edges.add((table, fk))
    return edges


def write_detailed_dot(
    tables: dict[str, dict[str, list[str]]], domains: dict[str, str], schema_name: str
) -> None:
    edges = collect_edges(tables)
    lines = [
        "digraph prio_schema_detailed {",
        "  graph [splines=ortho, rankdir=LR, nodesep=0.65, ranksep=1];",
        "  node [shape=plaintext, fontname=\"Source Sans 3\"];",
    ]

    for table in sorted(tables):
        label = detailed_html_label(table, tables[table]["columns_info"], domains.get(table, ""))
        lines.append(f'  "{table}" [label={label}];')

    for src, tgt in sorted(edges):
        if tgt not in tables:
            continue
        lines.append(f'  "{src}" -> "{tgt}" [color=\"#607D8B\", penwidth=1.0];')

    lines.append("}")
    DETAILED_DOT_FILE.write_text("\n".join(lines) + "\n")
    print(
        f"Wrote {DETAILED_DOT_FILE.relative_to(ROOT)} ({len(tables)} tables, {len(edges)} relationships) from {schema_name}"
    )


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Generate Graphviz DOT files for the PRIO database schema"
    )
    parser.add_argument(
        "--schema",
        choices=("minimal", "full"),
        default="minimal",
        help="Choose between the compact (default) or complete schema",
    )
    args = parser.parse_args()

    sql_file = MINIMAL_SQL_FILE if args.schema == "minimal" else FULL_SQL_FILE
    schema = sql_file.read_text()
    tables, domains = parse_schema(schema)
    write_dot(tables, domains, sql_file.name)
    write_detailed_dot(tables, domains, sql_file.name)
