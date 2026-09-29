"use client";

import React from "react";

interface AbhedyaLogoProps {
  className?: string;
  size?: number | string;
  withText?: boolean;
  withVersion?: boolean;
  variant?: "shield" | "badge" | "minimal";
}

/**
 * AbhedyaX Official Brand Emblem
 * Represents "Abhedya" (अभैद्य - Impenetrable / Invulnerable Fortress)
 * combined with the cryptographic protocol analyzer "X" interceptor.
 * Built strictly adhering to the Neo-Brutalism design system.
 */
export const AbhedyaLogo: React.FC<AbhedyaLogoProps> = ({
  className = "",
  size = 36,
  withText = false,
  withVersion = false,
  variant = "shield",
}) => {
  const pixelSize = typeof size === "number" ? `${size}px` : size;

  const ShieldSvg = (
    <svg
      width={pixelSize}
      height={pixelSize}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 transition-transform group-hover:scale-105"
      aria-label="AbhedyaX Logo"
    >
      {/* Neo-brutalist solid shadow offset layer */}
      <path
        d="M 24 5 L 42 11 V 26 C 42 36 24 44 24 44 C 24 44 6 36 6 26 V 11 Z"
        fill="#000000"
        transform="translate(2, 2)"
      />

      {/* Outer Bastion / Fortress Shield Body */}
      <path
        d="M 24 4 L 42 10 V 25 C 42 35 24 43 24 43 C 24 43 6 35 6 25 V 10 Z"
        fill="#FFE600"
        stroke="#000000"
        strokeWidth="3"
        strokeLinejoin="miter"
      />

      {/* Internal Cryptographic Bastion Armor Facets */}
      <path
        d="M 24 4 L 42 10 L 24 16 L 6 10 Z"
        fill="#FFFFFF"
        stroke="#000000"
        strokeWidth="2"
      />

      {/* Cryptographic 'X' Interceptor Wings - Upper and Lower Portals */}
      {/* Top Left to Bottom Right Stroke */}
      <polygon
        points="14,16 20,16 34,34 28,34"
        fill="#000000"
      />
      {/* Top Right to Bottom Left Stroke */}
      <polygon
        points="34,16 28,16 14,34 20,34"
        fill="#000000"
      />

      {/* Crosshair Protocol Grid Guides */}
      <line x1="24" y1="12" x2="24" y2="17" stroke="#000000" strokeWidth="2.5" strokeLinecap="square" />
      <line x1="24" y1="31" x2="24" y2="36" stroke="#000000" strokeWidth="2.5" strokeLinecap="square" />
      <line x1="12" y1="24" x2="17" y2="24" stroke="#000000" strokeWidth="2.5" strokeLinecap="square" />
      <line x1="31" y1="24" x2="36" y2="24" stroke="#000000" strokeWidth="2.5" strokeLinecap="square" />

      {/* Central Impenetrable Quantum Keyhole / Diamond Node */}
      <polygon
        points="24,18 30,24 24,30 18,24"
        fill="#4ADE80"
        stroke="#000000"
        strokeWidth="2.5"
      />

      {/* Center Core Dot */}
      <circle cx="24" cy="24" r="2.5" fill="#000000" />
    </svg>
  );

  if (!withText) {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        {ShieldSvg}
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      {ShieldSvg}
      <div className="flex flex-col leading-none">
        <div className="flex items-center gap-1.5">
          <span className="font-black tracking-tight text-lg text-black">
            Abhedya<span className="bg-black text-[#FFE600] px-1 ml-0.5">X</span>
          </span>
          {withVersion && (
            <span className="text-[10px] font-mono font-black px-1.5 py-0.5 bg-white text-black border-2 border-black shadow-[1.5px_1.5px_0px_0px_#000]">
              PROTOTYPE
            </span>
          )}
        </div>
        <span className="text-[9px] font-mono font-bold tracking-widest text-zinc-700 uppercase mt-0.5">
          IPsec Security Intelligence
        </span>
      </div>
    </div>
  );
};
