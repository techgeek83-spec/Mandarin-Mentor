import React from 'react';

interface BrandLogoProps {
  className?: string;
  size?: number;
}

export function BrandLogo({ className = '', size = 36 }: BrandLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      aria-label="Mandarin Mentor Logo"
    >
      {/* Speech Bubble Base */}
      <path
        d="M50 8C26.8 8 8 26.8 8 50C8 59.4 11.1 68.1 16.3 75.1L10 92L28.2 86.8C34.7 90.7 42.1 92 50 92C73.2 92 92 73.2 92 50C92 26.8 73.2 8 50 8Z"
        className="fill-[var(--brand-jade-primary)]"
      />
      {/* Speech Radical (言) Dot */}
      <path
        d="M48 24C48 22.9 49.3 22 51 22C52.7 22 54 22.9 54 24L52.5 32H49.5L48 24Z"
        className="fill-[var(--surface-app)]"
      />
      {/* Top Bar Extending Right */}
      <rect x="22" y="36" width="58" height="6" rx="3" className="fill-[var(--surface-app)]" />
      {/* Middle Bars */}
      <rect x="34" y="46" width="34" height="4.5" rx="2.25" className="fill-[var(--surface-app)]" />
      <rect x="34" y="54.5" width="34" height="4.5" rx="2.25" className="fill-[var(--surface-app)]" />
      {/* Mouth Radical (口) Outer Box */}
      <rect x="33" y="63" width="36" height="18" rx="2" className="fill-[var(--surface-app)]" />
      {/* Mouth Radical (口) Cutout */}
      <rect x="39" y="68" width="24" height="8" rx="1" className="fill-[var(--brand-jade-primary)]" />
      {/* Radical Feet */}
      <rect x="33" y="81" width="5" height="4" rx="1" className="fill-[var(--surface-app)]" />
      <rect x="64" y="81" width="5" height="4" rx="1" className="fill-[var(--surface-app)]" />
    </svg>
  );
}