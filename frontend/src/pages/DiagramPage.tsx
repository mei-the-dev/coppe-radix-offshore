import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '../components/action';
import { Card, Badge } from '../components/display';
import { Stack } from '../components/layout';
import { Input } from '../components/action/Input/Input';
import { Skeleton } from '../components/feedback/Skeleton/Skeleton';
import { useSchemaDiagram } from '../hooks';
import './DiagramPage.css';

interface TableMetaColumn {
  name: string;
  type?: string;
  description?: string;
}

interface TableMeta {
  id: string;
  domain?: string;
  columns: TableMetaColumn[];
}

const sanitizeId = (value: string) =>
  typeof window !== 'undefined' && window.CSS?.escape
    ? window.CSS.escape(value)
    : value.replace(/[^A-Za-z0-9_-]/g, '');

const parseTableMetadata = (dot?: string): TableMeta[] => {
  if (!dot || typeof window === 'undefined' || typeof window.DOMParser === 'undefined') {
    return [];
  }

  const parser = new window.DOMParser();
  const regex = /"([^"]+)" \[label=<<(TABLE[\s\S]+?<\/TABLE>)>>/g;
  const tables: TableMeta[] = [];
  let match: RegExpExecArray | null;

  while ((match = regex.exec(dot)) !== null) {
    const id = match[1];
    const tableHtml = match[2];
    const doc = parser.parseFromString(tableHtml, 'text/html');
    const rows = Array.from(doc.querySelectorAll('tr'));
    if (!rows.length) continue;

    const headerRow = rows[0];
    const domainRow = rows[rows.length - 1];
    const dataRows = rows.slice(1, -1);

    const domain = domainRow?.textContent?.trim();

    const columns: TableMetaColumn[] = dataRows
      .map((row) => {
        const cells = row.querySelectorAll('td');
        if (cells.length < 2) return null;
        const rawField = cells[0].textContent?.trim() || '';
        const [nameLine, typeLine] = rawField.split(/\n|\r/).map((token) => token.trim()).filter(Boolean);
        const description = cells[1].textContent?.trim() || undefined;
        if (!nameLine) return null;
        return {
          name: nameLine,
          type: typeLine,
          description,
        };
      })
      .filter((column): column is TableMetaColumn => Boolean(column));

    tables.push({
      id,
      domain: headerRow?.textContent?.trim().includes(id) ? domain : domain?.toUpperCase(),
      columns,
    });
  }

  return tables.sort((a, b) => a.id.localeCompare(b.id));
};

export default function DiagramPage() {
  const { data, isLoading, isError, refetch } = useSchemaDiagram();
  const [zoom, setZoom] = useState(1);
  const [svgMarkup, setSvgMarkup] = useState('');
  const [renderError, setRenderError] = useState<string | null>(null);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [domainFilter, setDomainFilter] = useState('all');
  const diagramRef = useRef<HTMLDivElement>(null);

  const tablesMeta = useMemo(() => parseTableMetadata(data), [data]);
  const domains = useMemo(
    () => ['all', ...Array.from(new Set(tablesMeta.map((table) => table.domain).filter(Boolean) as string[]))],
    [tablesMeta]
  );

  const filteredTables = useMemo(() => {
    const normalizedSearch = search.toLowerCase();
    return tablesMeta.filter((table) => {
      const matchesSearch = table.id.toLowerCase().includes(normalizedSearch);
      const matchesDomain = domainFilter === 'all' || table.domain === domainFilter;
      return matchesSearch && matchesDomain;
    });
  }, [tablesMeta, search, domainFilter]);

  useEffect(() => {
    if (!data) return;
    let cancelled = false;
    async function renderDiagram() {
      try {
        setRenderError(null);
        const { graphviz } = await import('@hpcc-js/wasm/graphviz');
        const svg = await graphviz.layout(data, 'svg', 'dot');
        if (!cancelled) {
          setSvgMarkup(svg);
        }
      } catch (error) {
        console.error('Diagram render error', error);
        if (!cancelled) {
          setRenderError('Unable to render diagram.');
        }
      }
    }
    renderDiagram();
    return () => {
      cancelled = true;
    };
  }, [data]);

  useEffect(() => {
    if (!selectedTable && filteredTables.length > 0) {
      setSelectedTable(filteredTables[0].id);
    }
  }, [filteredTables, selectedTable]);

  useEffect(() => {
    if (!diagramRef.current) return;
    diagramRef.current
      .querySelectorAll('.diagram-node--selected')
      .forEach((node) => node.classList.remove('diagram-node--selected'));

    if (selectedTable) {
      const node = diagramRef.current.querySelector(`#${sanitizeId(selectedTable)}`);
      if (node) {
        node.classList.add('diagram-node--selected');
      }
    }
  }, [selectedTable, svgMarkup]);

  const handleDiagramClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.target as Element | null;
    if (!target) return;
    const group = target.closest('g');
    if (group?.id && tablesMeta.some((table) => table.id === group.id)) {
      setSelectedTable(group.id);
    }
  };

  const handleDownload = () => {
    if (!data) return;
    const blob = new Blob([data], { type: 'text/vnd.graphviz' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'prio-database-diagram.dot';
    link.click();
    URL.revokeObjectURL(url);
  };

  const selectedMeta = tablesMeta.find((table) => table.id === selectedTable);

  return (
    <div className="diagram-page">
      <section className="diagram-hero">
        <div>
          <p className="diagram-kicker">Database Atlas</p>
          <h2>PRIO Offshore data model</h2>
          <p className="diagram-subtitle">
            Zoom, pan, and inspect every table that powers vessel logistics, cargo compatibility, and optimization. Built directly from
            <code> prio_database_diagram_detailed_minimal.dot</code>.
          </p>
        </div>
        <Stack direction="row" gap="md" className="diagram-stats">
          <Card className="stat-card">
            <strong>{tablesMeta.length}</strong>
            <span>Tables</span>
          </Card>
          <Card className="stat-card">
            <strong>{domains.length - 1}</strong>
            <span>Domains</span>
          </Card>
          <Card className="stat-card">
            <strong>{selectedMeta?.columns.length ?? 0}</strong>
            <span>Columns</span>
          </Card>
        </Stack>
      </section>

      <div className="diagram-layout">
        <aside className="diagram-sidebar">
          <div className="diagram-filters">
            <Input
              label="Search tables"
              placeholder="Search by name"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <label className="select-label">
              Domain
              <select value={domainFilter} onChange={(event) => setDomainFilter(event.target.value)}>
                {domains.map((domain) => (
                  <option key={domain} value={domain}>
                    {domain === 'all' ? 'All domains' : domain}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="diagram-table-list" role="list">
            {filteredTables.map((table) => (
              <button
                key={table.id}
                className={`diagram-table-button ${table.id === selectedTable ? 'diagram-table-button--active' : ''}`}
                onClick={() => setSelectedTable(table.id)}
              >
                <span>{table.id}</span>
                {table.domain && <Badge variant="info" size="sm">{table.domain}</Badge>}
              </button>
            ))}
            {!filteredTables.length && <p className="diagram-empty">No tables match the current filters.</p>}
          </div>
        </aside>

        <section className="diagram-stage">
          <div className="diagram-controls">
            <label>
              Zoom
              <input
                type="range"
                min="0.5"
                max="2.5"
                step="0.1"
                value={zoom}
                onChange={(event) => setZoom(Number(event.target.value))}
              />
            </label>
            <Button variant="ghost" size="sm" onClick={() => setZoom(1)}>
              Reset view
            </Button>
            <Button variant="secondary" size="sm" onClick={handleDownload}>
              Download DOT
            </Button>
            <Button variant="secondary" size="sm" onClick={() => refetch()}>
              Refresh
            </Button>
          </div>

          <div
            className="diagram-canvas"
            ref={diagramRef}
            onClick={handleDiagramClick}
            style={{ transform: `scale(${zoom})` }}
          >
            {isLoading && <Skeleton lines={8} />}
            {isError && <p className="diagram-error">Failed to load diagram. <Button onClick={() => refetch()}>Try again</Button></p>}
            {renderError && <p className="diagram-error">{renderError}</p>}
            {!isLoading && !renderError && svgMarkup && (
              <div className="diagram-svg" dangerouslySetInnerHTML={{ __html: svgMarkup }} />
            )}
          </div>

          <Card className="diagram-panel">
            <div className="panel-header">
              <div>
                <p className="panel-kicker">Table focus</p>
                <h3>{selectedTable || 'Select a table'}</h3>
              </div>
              {selectedMeta?.domain && <Badge variant="success" size="sm">{selectedMeta.domain}</Badge>}
            </div>
            <div className="panel-body">
              {selectedMeta ? (
                <ul>
                  {selectedMeta.columns.map((column) => (
                    <li key={`${selectedMeta.id}-${column.name}`}>
                      <div className="column-row">
                        <span className="column-name">{column.name}</span>
                        {column.type && <span className="column-type">{column.type}</span>}
                      </div>
                      {column.description && <p className="column-description">{column.description}</p>}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="diagram-empty">Choose a table to inspect its columns.</p>
              )}
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}
