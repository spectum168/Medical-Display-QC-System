import React from 'react';
import { QCQuestion } from '../types';

interface TG18PatternProps {
  activeStep?: number;
  highlightedQuestion?: QCQuestion;
  className?: string;
  isFullscreenMode?: boolean;
}

export const TG18Pattern: React.FC<TG18PatternProps> = ({
  activeStep,
  highlightedQuestion,
  className = '',
  isFullscreenMode = false,
}) => {
  // Let's draw an SVG representation of the AAPM TG18-QC Pattern
  // Standard dimension: 1000 x 1000

  // 16 Grayscale levels for Step 1
  const grayLevels = [
    '#000000', '#111111', '#222222', '#333333',
    '#444444', '#555555', '#666666', '#777777',
    '#888888', '#999999', '#AAAAAA', '#BBBBBB',
    '#CCCCCC', '#DDDDDD', '#EEEEEE', '#FFFFFF'
  ];

  return (
    <div className={`relative bg-[#808080] rounded shadow-lg overflow-hidden border border-gray-600 ${className}`}>
      <svg
        viewBox="0 0 1000 1000"
        className="w-full h-full select-none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio={isFullscreenMode ? "none" : undefined}
      >
        {/* Definitions for patterns and gradients */}
        <defs>
          {/* Vertical Linear Gradient (Black to White) - Left column */}
          <linearGradient id="gradientLeft" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#000000" />
            <stop offset="50%" stopColor="#808080" />
            <stop offset="100%" stopColor="#FFFFFF" />
          </linearGradient>

          {/* Vertical Linear Gradient (White to Black) - Right column */}
          <linearGradient id="gradientRight" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="50%" stopColor="#808080" />
            <stop offset="100%" stopColor="#000000" />
          </linearGradient>

          {/* Linepair Horizontal Patterns */}
          <pattern id="linepairH" width="10" height="4" patternUnits="userSpaceOnUse">
            <rect width="10" height="2" fill="#000000" />
            <rect y="2" width="10" height="2" fill="#FFFFFF" />
          </pattern>

          {/* Linepair Vertical Patterns */}
          <pattern id="linepairV" width="4" height="10" patternUnits="userSpaceOnUse">
            <rect width="2" height="10" fill="#000000" />
            <rect x="2" width="2" height="10" fill="#FFFFFF" />
          </pattern>

          {/* Crosstalk Waves */}
          <linearGradient id="crossTalkGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="25%" stopColor="#808080" />
            <stop offset="50%" stopColor="#000000" />
            <stop offset="75%" stopColor="#808080" />
            <stop offset="100%" stopColor="#FFFFFF" />
          </linearGradient>
        </defs>

        {/* Base Background: Mid-Gray 128/255 */}
        <rect width="1000" height="1000" fill="#808080" />

        {/* Cross Hair Grid Lines (Subtle) */}
        <line x1="0" y1="500" x2="1000" y2="500" stroke="#707070" strokeWidth="1" />
        <line x1="500" y1="0" x2="500" y2="1000" stroke="#707070" strokeWidth="1" />

        {/* ========================================== */}
        {/* Step 8: Cross Talk Bars (Very Top) */}
        {/* ========================================== */}
        <g id="crossTalkBars">
          <rect x="215" y="20" width="570" height="50" fill="url(#crossTalkGrad)" />
          <path d="M 215,70 Q 350,90 500,70 T 785,70" stroke="#000000" strokeWidth="6" fill="none" />
          <path d="M 215,90 Q 350,70 500,90 T 785,90" stroke="#FFFFFF" strokeWidth="6" fill="none" />
        </g>

        {/* ========================================== */}
        {/* Step 6: Video Artifacts Bars (Near Top) */}
        {/* ========================================== */}
        <g id="videoArtifacts">
          <rect x="100" y="160" width="800" height="25" fill="#FFFFFF" />
          <rect x="300" y="160" width="400" height="25" fill="#000000" />
          <rect x="100" y="185" width="800" height="30" fill="#000000" />
          <rect x="300" y="185" width="400" height="30" fill="#FFFFFF" />
        </g>

        {/* ========================================== */}
        {/* Step 7: Bit Depth Vertical Gradient Pillars */}
        {/* ========================================== */}
        {/* Left pillar */}
        <rect x="20" y="250" width="70" height="550" fill="url(#gradientLeft)" />
        {/* Right pillar */}
        <rect x="910" y="250" width="70" height="550" fill="url(#gradientRight)" />

        {/* ========================================== */}
        {/* Step 1: 16-step Grayscale Frame */}
        {/* ========================================== */}
        <g id="grayscaleFrame">
          {/* Top row: 6 blocks */}
          {grayLevels.slice(0, 6).map((color, i) => (
            <rect
              key={`gray-top-${i}`}
              x={200 + i * 100}
              y={215}
              width="100"
              height="100"
              fill={color}
              stroke="#606060"
              strokeWidth="1"
            />
          ))}

          {/* Left column: 5 blocks */}
          {grayLevels.slice(6, 11).map((color, i) => (
            <rect
              key={`gray-left-${i}`}
              x={200}
              y={315 + i * 97}
              width="100"
              height="97"
              fill={color}
              stroke="#606060"
              strokeWidth="1"
            />
          ))}

          {/* Right column: 5 blocks */}
          {grayLevels.slice(11, 16).map((color, i) => (
            <rect
              key={`gray-right-${i}`}
              x={700}
              y={315 + i * 97}
              width="100"
              height="97"
              fill={color}
              stroke="#606060"
              strokeWidth="1"
            />
          ))}
        </g>

        {/* ========================================== */}
        {/* Step 5: Corner & Central Resolution Linepairs */}
        {/* ========================================== */}
        <g id="resolutionPatterns">
          {/* Top Left corner (x: 10, y: 35) */}
          <g transform="translate(10, 35)">
            <rect width="180" height="150" fill="#777" stroke="#444" strokeWidth="2" />
            <rect x="10" y="10" width="75" height="130" fill="url(#linepairV)" />
            <rect x="95" y="10" width="75" height="130" fill="url(#linepairH)" />
          </g>

          {/* Top Right corner (x: 810, y: 35) */}
          <g transform="translate(810, 35)">
            <rect width="180" height="150" fill="#777" stroke="#444" strokeWidth="2" />
            <rect x="10" y="10" width="75" height="130" fill="url(#linepairH)" />
            <rect x="95" y="10" width="75" height="130" fill="url(#linepairV)" />
          </g>

          {/* Bottom Left corner (x: 10, y: 850) */}
          <g transform="translate(10, 850)">
            <rect width="180" height="130" fill="#777" stroke="#444" strokeWidth="2" />
            <rect x="10" y="10" width="75" height="110" fill="url(#linepairV)" />
            <rect x="95" y="10" width="75" height="110" fill="url(#linepairH)" />
          </g>

          {/* Bottom Right corner (x: 810, y: 850) */}
          <g transform="translate(810, 850)">
            <rect width="180" height="130" fill="#777" stroke="#444" strokeWidth="2" />
            <rect x="10" y="10" width="75" height="110" fill="url(#linepairH)" />
            <rect x="95" y="10" width="75" height="110" fill="url(#linepairV)" />
          </g>

          {/* Center Linepairs (x: 400, y: 415) */}
          <g transform="translate(400, 415)">
            <rect width="200" height="185" fill="#999" stroke="#555" strokeWidth="2" />
            {/* Split quadrants of vertical/horizontal lines */}
            <rect x="10" y="10" width="85" height="75" fill="url(#linepairV)" />
            <rect x="105" y="10" width="85" height="75" fill="url(#linepairH)" />
            <rect x="10" y="95" width="85" height="80" fill="url(#linepairH)" />
            <rect x="105" y="95" width="85" height="80" fill="url(#linepairV)" />
          </g>
        </g>

        {/* ========================================== */}
        {/* Step 2 & 3: Contrast patches in center */}
        {/* ========================================== */}
        {/* Bottom Left: 0% containing 5% patch */}
        <g id="darkContrastPatch" transform="translate(300, 700)">
          {/* Base 0% box (Pure Black) */}
          <rect width="100" height="100" fill="#000000" stroke="#333" strokeWidth="1" />
          {/* Inner 5% box (Slightly lighter black) */}
          <rect x="35" y="35" width="30" height="30" fill="#0D0D0D" />
          <text x="50" y="90" fontSize="12" fill="#444" textAnchor="middle" fontWeight="bold">0% / 5%</text>
        </g>

        {/* Bottom Right: 100% containing 95% patch */}
        <g id="lightContrastPatch" transform="translate(600, 700)">
          {/* Base 100% box (Pure White) */}
          <rect width="100" height="100" fill="#FFFFFF" stroke="#DDD" strokeWidth="1" />
          {/* Inner 95% box (Slightly darker white) */}
          <rect x="35" y="35" width="30" height="30" fill="#F2F2F2" />
          <text x="50" y="90" fontSize="12" fill="#AAA" textAnchor="middle" fontWeight="bold">100%/95%</text>
        </g>

        {/* Central Title Details */}
        <g id="patternMetadata" transform="translate(500, 740)">
          <text fontSize="18" fill="#FFFFFF" textAnchor="middle" fontWeight="bold">TG18-QC Pattern</text>
          <text y="20" fontSize="13" fill="#E0E0E0" textAnchor="middle">Version 8.0, 12/01</text>
          <text y="38" fontSize="12" fill="#CCCCCC" textAnchor="middle">Copyright © 2001 by AAPM</text>
        </g>

        {/* ========================================== */}
        {/* Step 4: Low Contrast Alphabet Panels (QUALITY CONTROL) */}
        {/* ========================================== */}
        <g id="lowContrastLetters">
          {/* Left panel: Black with extreme dark-gray letters */}
          <rect x="200" y="800" width="200" height="100" fill="#000000" stroke="#111" strokeWidth="1" />
          <text x="300" y="845" fontSize="22" fill="#050505" fontWeight="bold" textAnchor="middle" letterSpacing="2">QUALITY</text>
          <text x="300" y="875" fontSize="22" fill="#050505" fontWeight="bold" textAnchor="middle" letterSpacing="2">CONTROL</text>

          {/* Center panel: Gray with matching low contrast letters */}
          <rect x="400" y="800" width="200" height="100" fill="#808080" stroke="#777" strokeWidth="1" />
          <text x="500" y="845" fontSize="22" fill="#848484" fontWeight="bold" textAnchor="middle" letterSpacing="2">QUALITY</text>
          <text x="500" y="875" fontSize="22" fill="#848484" fontWeight="bold" textAnchor="middle" letterSpacing="2">CONTROL</text>

          {/* Right panel: White with extreme light-gray letters */}
          <rect x="600" y="800" width="200" height="100" fill="#FFFFFF" stroke="#EEE" strokeWidth="1" />
          <text x="700" y="845" fontSize="22" fill="#FAFAFA" fontWeight="bold" textAnchor="middle" letterSpacing="2">QUALITY</text>
          <text x="700" y="875" fontSize="22" fill="#FAFAFA" fontWeight="bold" textAnchor="middle" letterSpacing="2">CONTROL</text>
        </g>

        {/* Bottom Banner warning: "Not For Diagnostic Use" */}
        <rect x="345" y="905" width="310" height="50" rx="10" fill="#000000" />
        <text x="500" y="937" fontSize="18" fill="#FFFFFF" fontWeight="bold" textAnchor="middle" letterSpacing="1">
          Not For Diagnostic Use
        </text>

        {/* ========================================== */}
        {/* Dynamic Highlight Overlays (Red frames) */}
        {/* ========================================== */}
        {highlightedQuestion && (
          <g id="highlightOverlay" className="animate-pulse">
            {highlightedQuestion.highlightArea.points ? (
              // Multi-point highlights
              highlightedQuestion.highlightArea.points.map((pt, index) => (
                <rect
                  key={`highlight-pt-${index}`}
                  x={pt.x}
                  y={pt.y}
                  width={pt.width}
                  height={pt.height}
                  fill="none"
                  stroke="#FF0000"
                  strokeWidth="8"
                  strokeLinecap="round"
                  className="drop-shadow-[0_0_8px_rgba(255,0,0,0.8)]"
                />
              ))
            ) : (
              // Single highlight block
              <rect
                x={highlightedQuestion.highlightArea.x}
                y={highlightedQuestion.highlightArea.y}
                width={highlightedQuestion.highlightArea.width}
                height={highlightedQuestion.highlightArea.height}
                fill="none"
                stroke="#FF0000"
                strokeWidth="8"
                strokeLinecap="round"
                className="drop-shadow-[0_0_8px_rgba(255,0,0,0.8)]"
              />
            )}
          </g>
        )}
      </svg>
    </div>
  );
};
