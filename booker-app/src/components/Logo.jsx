import React from 'react';

// Simple, clean SVG logo for NessBook
const Logo = ({ size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-label="NessBook logo"
  >
    <defs>
      <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#f472b6"/>
        <stop offset="100%" stopColor="#a21caf"/>
      </linearGradient>
    </defs>
    <rect x="8" y="12" width="40" height="40" rx="8" fill="url(#g1)"/>
    <path d="M16 20h16a6 6 0 0 1 6 6v18c-2-2-6-4-10-4H16V20z" fill="#fff" opacity=".95"/>
    <path d="M30 20h10a6 6 0 0 1 6 6v18c-2-2-6-4-10-4h-6V20z" fill="#fff" opacity=".85"/>
  </svg>
);

export default Logo;
