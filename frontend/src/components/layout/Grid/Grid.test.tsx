import { describe, it, expect } from 'vitest';
import { render } from '../../../test-utils/testUtils';
import { Grid } from './Grid';

describe('Grid', () => {
  it('renders children', () => {
    const { container } = render(
      <Grid>
        <div>Child 1</div>
        <div>Child 2</div>
      </Grid>
    );
    expect(container.textContent).toContain('Child 1');
    expect(container.textContent).toContain('Child 2');
  });

  it('applies fixed column count class', () => {
    const { container } = render(
      <Grid columns={3}>
        <div>Child</div>
      </Grid>
    );
    const grid = container.querySelector('.layout-grid--cols-3');
    expect(grid).toBeInTheDocument();
  });

  it('applies responsive column classes', () => {
    const { container } = render(
      <Grid columns={{ xs: 1, sm: 2, md: 3, lg: 4 }}>
        <div>Child</div>
      </Grid>
    );
    const grid = container.querySelector('.layout-grid');
    expect(grid).toHaveClass('layout-grid--cols-xs-1');
    expect(grid).toHaveClass('layout-grid--cols-sm-2');
    expect(grid).toHaveClass('layout-grid--cols-md-3');
    expect(grid).toHaveClass('layout-grid--cols-lg-4');
  });

  it('applies gap class', () => {
    const { container } = render(
      <Grid gap="xl">
        <div>Child</div>
      </Grid>
    );
    const grid = container.querySelector('.layout-grid--gap-xl');
    expect(grid).toBeInTheDocument();
  });
});
