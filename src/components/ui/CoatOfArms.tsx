import React from 'react';

interface CoatOfArmsProps {
  className?: string;
  size?: number;
}

export const CoatOfArms: React.FC<CoatOfArmsProps> = ({ className = '', size = 32 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`text-[#C9A96E] shrink-0 ${className}`}
      aria-label="Герб Імперії Січ"
    >
      {/* Outer shield outline */}
      <path
        d="M24 4L7 9V24C7 34 14 41 24 44C34 41 41 34 41 24V9L24 4Z"
        fill="#121722"
        stroke="#C9A96E"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      {/* Inner shield border */}
      <path
        d="M24 7L10 11V23.5C10 31.5 16 37.5 24 40.5C32 37.5 38 31.5 38 23.5V11L24 7Z"
        stroke="#C9A96E"
        strokeWidth="0.75"
        strokeOpacity="0.4"
      />
      {/* Crossed Cossack Sabres */}
      <path
        d="M15 16L33 32M13 18L17 14M31 34L35 30"
        stroke="#C9A96E"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
      <path
        d="M33 16L15 32M35 18L31 14M17 34L13 30"
        stroke="#C9A96E"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
      {/* Central Hetman Mace (Булава) and Archangel Star */}
      <circle cx="24" cy="24" r="5" fill="#1C1814" stroke="#C9A96E" strokeWidth="1.5" />
      <circle cx="24" cy="24" r="2" fill="#E8D7B8" />
      <path
        d="M24 13V19M24 29V35M13 24H19M29 24H35"
        stroke="#C9A96E"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      {/* Crown pinnacle */}
      <path
        d="M21 7L24 4.5L27 7"
        stroke="#E8D7B8"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
};
