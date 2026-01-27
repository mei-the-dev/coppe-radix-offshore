/** Vessel, port, platform, FPSO icons (logistics domain). */

export type IconProps = { className?: string; size?: number };

const def = { className: '', size: 24 };

export function IconVessel({ className = def.className, size = def.size }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 21h18M3 7l9-4 9 4M3 7v14M12 3v18M21 7v14" />
      <path d="M7 12h10M7 16h10" />
    </svg>
  );
}

export function IconPort({ className = def.className, size = def.size }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
      <path d="M8 8l2 2M14 14l2 2M8 16l2-2M14 10l2-2" />
    </svg>
  );
}

export function IconPlatform({ className = def.className, size = def.size }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M9 9h6M9 15h6M12 3v18" />
    </svg>
  );
}

export function IconFPSO({ className = def.className, size = def.size }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <circle cx="7" cy="12" r="1.5" />
      <circle cx="17" cy="12" r="1.5" />
      <path d="M12 8v8" />
    </svg>
  );
}
