import React from 'react';

type Variant = 'prologue' | 'state';

export function SichEmpireMap({ variant = 'prologue' }: { variant?: Variant }) {
  const compact = variant === 'prologue';
  return (
    <svg
      viewBox="0 0 1000 520"
      className="absolute inset-0 h-full w-full"
      role="img"
      aria-label="Схематична історично зорієнтована карта Імперії Січ"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <linearGradient id="sichLand" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#D8B76D" />
          <stop offset="0.55" stopColor="#B48B43" />
          <stop offset="1" stopColor="#806333" />
        </linearGradient>
        <radialGradient id="sichSea" cx="42%" cy="42%">
          <stop offset="0" stopColor="#1D3441" />
          <stop offset="1" stopColor="#08131B" />
        </radialGradient>
        <filter id="softGlow">
          <feGaussianBlur stdDeviation="7" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      <rect width="1000" height="520" fill="url(#sichSea)" />

      {/* Canonical territorial silhouette.
          Geographic reference frame: Europe 1701; Polish-Lithuanian Commonwealth c.1701;
          Tsardom of Russia c.1700/1708; Homann-Ides 1704.
          The game fiction merges these historical territories into one state with Kyiv as capital. */}
      <path
        d="M118 148
           C151 118 188 105 224 111
           C258 116 279 96 314 91
           C350 86 379 99 412 91
           C447 83 475 69 511 76
           C548 83 578 70 615 78
           C653 86 677 72 713 84
           C748 96 777 91 809 105
           C842 119 868 121 891 141
           C913 161 910 183 926 201
           C942 220 935 240 947 259
           C958 278 949 299 956 319
           C962 340 948 355 950 376
           C952 399 935 412 918 423
           C895 438 868 432 846 444
           C819 459 793 449 767 458
           C735 469 710 455 682 463
           C652 471 628 456 599 462
           C568 468 544 451 514 457
           C483 463 461 446 432 449
           C399 452 379 435 350 437
           C319 439 300 420 272 419
           C244 418 227 400 204 392
           C181 384 170 365 175 343
           C180 321 163 304 169 282
           C175 260 159 243 165 220
           C171 199 157 182 151 167
           C144 153 130 154 118 148Z"
        fill="url(#sichLand)"
        stroke="#E0B85C"
        strokeWidth="3"
      />

      {/* Western / central historical zones, intentionally subtle. */}
      <path d="M223 112 C238 151 226 187 236 222 C247 260 230 300 244 338 C251 365 265 394 281 416"
        fill="none" stroke="#735A35" strokeWidth="1.5" strokeDasharray="5 6" opacity=".65" />
      <path d="M387 98 C374 139 391 179 380 218 C368 257 386 292 374 332 C367 364 382 405 399 444"
        fill="none" stroke="#735A35" strokeWidth="1.5" strokeDasharray="5 6" opacity=".65" />
      <path d="M564 79 C548 123 567 162 554 201 C543 238 561 275 550 314 C542 350 559 407 577 457"
        fill="none" stroke="#735A35" strokeWidth="1.5" strokeDasharray="5 6" opacity=".65" />

      {/* Major rivers: simplified, not a political boundary. */}
      <path d="M265 121 C252 164 267 197 256 230 C244 266 259 301 250 337 C244 365 255 391 275 416"
        fill="none" stroke="#6B9294" strokeWidth="3" opacity=".75" />
      <path d="M256 230 C294 237 316 252 350 270 C384 288 407 300 445 303"
        fill="none" stroke="#6B9294" strokeWidth="2" opacity=".7" />
      <path d="M468 93 C454 131 468 165 458 199 C448 233 462 267 478 291 C491 311 499 345 493 382"
        fill="none" stroke="#6B9294" strokeWidth="2" opacity=".65" />
      <path d="M671 86 C657 123 672 155 665 188 C658 221 672 254 690 276 C706 296 714 329 708 359"
        fill="none" stroke="#6B9294" strokeWidth="1.8" opacity=".55" />

      {/* Kyiv: fixed canonical capital. */}
      <g filter="url(#softGlow)">
        <circle cx="267" cy="230" r="13" fill="#10151A" stroke="#F0CA70" strokeWidth="3" />
        <path d="M267 208 L259 220 H275 Z" fill="#F0CA70" />
      </g>
      <text x="286" y="226" fill="#FFF1C9" fontSize={compact ? 17 : 19} fontFamily="Georgia, serif" fontWeight="700">КИЇВ</text>
      <text x="286" y="243" fill="#DDB86B" fontSize="10" fontFamily="monospace" letterSpacing="1.5">СТОЛИЦЯ</text>

      {!compact && (
        <>
          <g fill="#171B1D" stroke="#E2BE65" strokeWidth="1.7">
            <circle cx="191" cy="181" r="4" />
            <circle cx="206" cy="285" r="4" />
            <circle cx="247" cy="154" r="4" />
            <circle cx="329" cy="177" r="4" />
            <circle cx="388" cy="151" r="4" />
            <circle cx="457" cy="223" r="4" />
            <circle cx="560" cy="184" r="4" />
            <circle cx="648" cy="145" r="4" />
            <circle cx="734" cy="206" r="4" />
            <circle cx="820" cy="260" r="4" />
          </g>
          <g fill="#F1E7D1" fontSize="11" fontFamily="Georgia, serif">
            <text x="175" y="172">ЛЬВІВ</text>
            <text x="190" y="302">ВІННИЦЯ</text>
            <text x="252" y="145">МІНСЬК</text>
            <text x="335" y="170">СМОЛЕНСЬК</text>
            <text x="394" y="143">МОСКВА</text>
            <text x="464" y="218">ХАРКІВ</text>
            <text x="567" y="179">КАЗАНЬ</text>
            <text x="655" y="140">ПЕРМ</text>
            <text x="741" y="201">ТОБОЛЬСЬК</text>
            <text x="826" y="255">СИБІР</text>
          </g>
        </>
      )}

      <text x={compact ? 405 : 390} y="336" fill="#2A2116" fontSize={compact ? 25 : 30}
        fontFamily="Georgia, serif" fontWeight="700" letterSpacing="4">ІМПЕРІЯ СІЧ</text>

      <text x="42" y="35" fill="#C9A96E" fontSize="10" fontFamily="monospace" letterSpacing="2">
        ІСТОРИЧНА ОСНОВА · БЛИЗЬКО 1700
      </text>
      <text x="48" y="486" fill="#78909A" fontSize="11" fontFamily="Georgia, serif">ЧОРНЕ МОРЕ</text>
      <text x="760" y="65" fill="#78909A" fontSize="10" fontFamily="Georgia, serif">СХІДНІ ЗЕМЛІ</text>

      <g transform="translate(70 405)">
        <circle r="24" fill="none" stroke="#B89A5B" strokeWidth="1" />
        <path d="M0 -18 L5 0 L0 18 L-5 0Z" fill="#B89A5B" />
        <text x="-3" y="-28" fill="#C9A96E" fontSize="8">N</text>
      </g>
    </svg>
  );
}
