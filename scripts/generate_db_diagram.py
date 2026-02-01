#!/usr/bin/env python3
"""Generate a Graphviz diagram describing the PRIO database schema."""

from __future__ import annotations

import re
from pathlib import Path
from textwrap import dedent

ROOT = Path(__file__).resolve().parents[1]
SQL_FILE = ROOT / "references" / "prio_sql_schema.sql"
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

    for raw_line in sql.splitlines():
        line = raw_line.strip()
        if not line:
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


def write_dot(tables: dict[str, dict[str, list[str]]], domains: dict[str, str]) -> None:
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
    print(f"Wrote {DOT_FILE.relative_to(ROOT)} ({len(tables)} tables, {len(edges)} relationships)")


def collect_edges(tables: dict[str, dict[str, list[str]]]) -> set[tuple[str, str]]:
    edges: set[tuple[str, str]] = set()
    for table, data in tables.items():
        for fk in data["fks"]:
            edges.add((table, fk))
    return edges


def write_detailed_dot(tables: dict[str, dict[str, list[str]]], domains: dict[str, str]) -> None:
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
    print(f"Wrote {DETAILED_DOT_FILE.relative_to(ROOT)} ({len(tables)} tables, {len(edges)} relationships)")


if __name__ == "__main__":
    schema = SQL_FILE.read_text()
    tables, domains = parse_schema(schema)
    write_dot(tables, domains)
    write_detailed_dot(tables, domains)
