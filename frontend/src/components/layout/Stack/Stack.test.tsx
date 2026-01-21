import { describe, it, expect } from 'vitest';
import { render } from '../../../test-utils/testUtils';
import { Stack } from './Stack';

describe('Stack', () => {
  it('renders children', () => {
    const { container } = render(
      <Stack>
        <div>Child 1</div>
        <div>Child 2</div>
      </Stack>
    );
    expect(container.textContent).toContain('Child 1');
    expect(container.textContent).toContain('Child 2');
  });

  it('applies direction class', () => {
    const { container } = render(
      <Stack direction="row">
        <div>Child</div>
      </Stack>
    );
    const stack = container.querySelector('.layout-stack--row');
    expect(stack).toBeInTheDocument();
  });

  it('applies gap class', () => {
    const { container } = render(
      <Stack gap="lg">
        <div>Child</div>
      </Stack>
    );
    const stack = container.querySelector('.layout-stack--gap-lg');
    expect(stack).toBeInTheDocument();
  });

  it('applies align class', () => {
    const { container } = render(
      <Stack align="center">
        <div>Child</div>
      </Stack>
    );
    const stack = container.querySelector('.layout-stack--align-center');
    expect(stack).toBeInTheDocument();
  });

  it('applies justify class', () => {
    const { container } = render(
      <Stack justify="space-between">
        <div>Child</div>
      </Stack>
    );
    const stack = container.querySelector('.layout-stack--justify-space-between');
    expect(stack).toBeInTheDocument();
  });
});
