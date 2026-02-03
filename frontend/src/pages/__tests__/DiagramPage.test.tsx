import { beforeEach, describe, expect, it, vi } from 'vitest';
import DiagramPage from '../DiagramPage';
import { render, screen, waitFor } from '../../test-utils/testUtils';

const mockUseSchemaDiagram = vi.fn();
const layoutMock = vi.fn().mockResolvedValue('<svg><g id="vessels"></g></svg>');

vi.mock('../../hooks', () => ({
  useSchemaDiagram: () => mockUseSchemaDiagram(),
}));

vi.mock('@hpcc-js/wasm/graphviz', () => ({
  graphviz: {
    layout: layoutMock,
  },
}));

const DOT_FIXTURE = `digraph {
  "vessels" [label=<<TABLE border="0" cellborder="1" cellspacing="0">
    <tr><td colspan="2">vessels</td></tr>
    <tr><td>id\\nUUID</td><td>identifier</td></tr>
    <tr><td>name\\nTEXT</td><td>friendly name</td></tr>
    <tr><td>Operations</td></tr>
  </TABLE>>];
}`;

describe('DiagramPage', () => {
  beforeEach(() => {
    mockUseSchemaDiagram.mockReset();
    layoutMock.mockClear();
  });

  it('renders diagram controls and table list when data is available', async () => {
    mockUseSchemaDiagram.mockReturnValue({
      data: DOT_FIXTURE,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    render(<DiagramPage />);

    await waitFor(() =>
      expect(screen.getByText(/PRIO Offshore data model/i)).toBeVisible()
    );

    await waitFor(() =>
      expect(screen.getByRole('button', { name: /vessels/i })).toBeVisible()
    );

    expect(screen.getByText(/Download DOT/i)).toBeVisible();
    expect(layoutMock).toHaveBeenCalledTimes(1);
  });

  it('shows an error message when the diagram query fails', () => {
    mockUseSchemaDiagram.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch: vi.fn(),
    });

    render(<DiagramPage />);

    expect(screen.getByText(/Failed to load diagram/i)).toBeVisible();
  });
});
