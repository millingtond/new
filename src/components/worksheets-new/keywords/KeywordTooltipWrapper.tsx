// src/components/worksheets-new/keywords/KeywordTooltipWrapper.tsx
import React from 'react';

interface KeywordTooltipWrapperProps {
  keyword: string;
  definition: string;
  children: React.ReactNode;
}

const KeywordTooltipWrapper: React.FC<KeywordTooltipWrapperProps> = ({ definition, children }) => {
  return (
    <span className="keyword"> {/* Ensure .keyword and .keyword .tooltip styles from style.css are applied */}
      {children}
      <span className="tooltip">{definition}</span>
    </span>
  );
};

export default KeywordTooltipWrapper;
