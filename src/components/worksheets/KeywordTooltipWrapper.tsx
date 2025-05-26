// src/components/worksheets/KeywordTooltipWrapper.tsx
"use client";

import React, { useState } from 'react';

interface KeywordTooltipWrapperProps {
  term: string; // The text to display
  definition: string; // The definition to show in the tooltip
  children?: React.ReactNode; // Optional: if you want to wrap other elements
}

const KeywordTooltipWrapper: React.FC<KeywordTooltipWrapperProps> = ({ term, definition, children }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  // Basic styling for the keyword and tooltip.
  // You can enhance this with Tailwind classes passed as props or more complex CSS.
  // This styling is inspired by your original style.css for .keyword and .tooltip
  const keywordStyle: React.CSSProperties = {
    position: 'relative',
    borderBottom: '2px dotted #60a5fa', // Tailwind blue-400
    cursor: 'help',
    fontWeight: 600,
    color: '#2563eb', // Tailwind blue-600
    display: 'inline-block', // Important for positioning the tooltip correctly relative to the text
  };

  const tooltipStyle: React.CSSProperties = {
    visibility: showTooltip ? 'visible' : 'hidden',
    width: '280px',
    backgroundColor: '#1f2937', // Tailwind gray-800
    color: '#fff',
    textAlign: 'left',
    borderRadius: '6px',
    padding: '8px 12px',
    position: 'absolute',
    zIndex: 50,
    bottom: '125%', // Position above the keyword
    left: '50%',
    marginLeft: '-140px', // Center the tooltip (half of its width)
    opacity: showTooltip ? 1 : 0,
    transition: 'opacity 0.3s, visibility 0.3s',
    fontSize: '0.8rem',
    fontWeight: 400,
    lineHeight: 1.4,
    boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
    pointerEvents: 'none', // So it doesn't interfere with mouse events on the term itself if needed
  };

  return (
    <span
      style={keywordStyle}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onFocus={() => setShowTooltip(true)} // For accessibility
      onBlur={() => setShowTooltip(false)}  // For accessibility
      tabIndex={0} // Make it focusable
      aria-describedby={`tooltip-for-${term.replace(/\s+/g, '-').toLowerCase()}`}
    >
      {children || term}
      <span style={tooltipStyle} role="tooltip" id={`tooltip-for-${term.replace(/\s+/g, '-').toLowerCase()}`}>
        {definition}
      </span>
    </span>
  );
};

export default KeywordTooltipWrapper;
