// src/components/worksheets/KeywordGlossary.tsx
"use client";

import React from 'react';
import KeywordTooltipWrapper from './KeywordTooltipWrapper';
import StaticContentBlock from './StaticContentBlock'; // For the introduction

interface KeywordGlossaryProps {
  introduction?: string;
  displayTermKeys: string[]; // Array of keys from keywordsData to display
  keywordsData: Record<string, string>; // The main keywords dictionary
}

const KeywordGlossary: React.FC<KeywordGlossaryProps> = ({ introduction, displayTermKeys, keywordsData }) => {
  if (!displayTermKeys || displayTermKeys.length === 0 || !keywordsData) {
    return <p className="text-sm text-red-500">Keyword data missing for glossary.</p>;
  }

  return (
    <div>
      {introduction && <StaticContentBlock htmlContent={introduction} />}
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
        {displayTermKeys.map((termKey) => {
          const definition = keywordsData[termKey.toLowerCase()]; // Ensure consistent key casing
          // The term to display might be the key itself, or you might want a mapping
          // if the key is e.g., "program-counter" but you want to display "Program Counter".
          // For simplicity, we'll format the key.
          const displayTerm = termKey
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');

          if (definition) {
            return (
              <KeywordTooltipWrapper
                key={termKey}
                term={displayTerm}
                definition={definition}
              />
            );
          } else {
            console.warn(`KeywordGlossary: No definition found for term key: ${termKey}`);
            // Render the term without tooltip if definition is missing
            return <span key={termKey} className="font-semibold text-gray-700 p-1 border-b-2 border-dotted border-gray-400">{displayTerm} (Definition not found)</span>;
          }
        })}
      </div>
    </div>
  );
};

export default KeywordGlossary;
