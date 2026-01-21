# Component Decision Matrix

This document provides guidelines for deciding when to create a variant vs. a new component, following the curriculum principles.

## Decision Matrix

| Scenario | Decision | Example |
|----------|----------|---------|
| Visual differences only (color, size) | **Variant** | `Button variant="primary|secondary"` |
| Same behavior, different structure | **Variant** | `Button size="sm|md|lg"` |
| Different behavior | **New Component** | `Button` vs `IconButton` vs `SplitButton` |
| Different HTML structure | **New Component** | `Button` (button) vs `Link` (anchor) |
| Complex conditional logic needed | **New Component** | Separate components instead of `if/else` props |

## Examples

### ✅ Create Variant

**Button Variants** - Visual differences only:
```tsx
<Button variant="primary" />
<Button variant="secondary" />
<Button variant="ghost" />
```

**Button Sizes** - Same behavior, different size:
```tsx
<Button size="sm" />
<Button size="md" />
<Button size="lg" />
```

### ✅ Create New Component

**Button vs IconButton** - Different behavior and structure:
- `Button` - Standard button with text/children
- `IconButton` - Icon-only button, may trigger popovers, requires `aria-label`

**Button vs SplitButton** - Different structure and behavior:
- `Button` - Single action button
- `SplitButton` - Two-part button with dropdown menu

## Anti-Patterns

### ❌ Don't: Configuration Hell

```tsx
// BAD: Too many boolean props
<Modal
  isOpen={true}
  title="Title"
  showCloseButton={true}
  closeOnOverlayClick={true}
  size="md"
  variant="default"
/>
```

### ✅ Do: Composition Pattern

```tsx
// GOOD: Compose components
<Modal.Root open={isOpen} onOpenChange={setIsOpen}>
  <Modal.Header>
    <Modal.Title>Title</Modal.Title>
    <Modal.CloseButton />
  </Modal.Header>
  <Modal.Content>Content</Modal.Content>
</Modal.Root>
```

## Guidelines

1. **Start with variants** for visual differences
2. **Create new components** when behavior or structure differs
3. **Use composition** for complex components with many options
4. **Document decisions** in component files with JSDoc comments
