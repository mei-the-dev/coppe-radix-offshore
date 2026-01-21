import './SkipLink.css';

interface SkipLinkProps {
  href: string;
  children: React.ReactNode;
}

/**
 * SkipLink - WCAG 2.4.1 Bypass Blocks
 * Allows keyboard users to skip to main content
 */
export function SkipLink({ href, children }: SkipLinkProps) {
  return (
    <a href={href} className="atom-skip-link">
      {children}
    </a>
  );
}
